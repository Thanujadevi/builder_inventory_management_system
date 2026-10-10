const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { generateBusinessCode } = require('../services/codeGeneratorService');
const { logAudit } = require('../services/auditService');

// POST /api/quotations (Supplier submits quotation)
const submitQuotation = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const supplierId = req.user.supplierId;
    const { requirementId, deliveryDays, paymentTerms, validUntil, remarks, items } = req.body;

    if (!requirementId || !deliveryDays || !validUntil || !items || !Array.isArray(items) || items.length === 0) {
      connection.release();
      return sendError(res, 'Requirement, Delivery Days, Valid Until Date, and Items are required');
    }

    // Check duplicate quotation for same RFQ and Supplier
    const [existing] = await connection.query(
      'SELECT int_Quotation_Id FROM tbl_quotation WHERE int_Requirement_Id = ? AND int_Supplier_Id = ?',
      [requirementId, supplierId]
    );

    if (existing.length > 0) {
      connection.release();
      return sendError(res, 'You have already submitted a quotation for this RFQ.');
    }

    // Fetch total requested items in RFQ to calculate coverage percentage
    const [reqItems] = await connection.query(
      'SELECT COUNT(*) as total FROM tbl_requirement_item WHERE int_Requirement_Id = ?',
      [requirementId]
    );
    const totalReqItems = reqItems[0].total || 1;
    const quotedItemsCount = items.length;
    const coveragePercent = Math.min(100, (quotedItemsCount / totalReqItems) * 100);

    const quoCode = await generateBusinessCode('QUO', 'tbl_quotation', 'txt_Quotation_Code');

    // Calculate total amount and compute discount & tax amounts per item
    let totalAmount = 0;
    const processedItems = items.map(item => {
      const qty = parseInt(item.quantity, 10) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      const baseAmount = unitPrice * qty;

      // 1. Calculate Discount
      const discountType = (item.discountType || 'AMOUNT').toUpperCase();
      const discountInput = parseFloat(item.discount) || 0;
      let discountAmount = 0;

      if (discountType === 'PERCENTAGE' || discountType === '%') {
        discountAmount = (baseAmount * discountInput) / 100;
      } else {
        discountAmount = discountInput;
      }
      discountAmount = Math.min(baseAmount, Math.max(0, discountAmount));

      const subtotalAfterDiscount = baseAmount - discountAmount;

      // 2. Calculate Tax (on taxable subtotal after discount)
      const taxType = (item.taxType || 'AMOUNT').toUpperCase();
      const taxInput = parseFloat(item.tax) || 0;
      let taxAmount = 0;

      if (taxType === 'PERCENTAGE' || taxType === '%') {
        taxAmount = (subtotalAfterDiscount * taxInput) / 100;
      } else {
        taxAmount = Math.max(0, taxInput);
      }

      const lineTotal = subtotalAfterDiscount + taxAmount;
      totalAmount += lineTotal;

      return {
        ...item,
        qty,
        unitPrice,
        discountAmount: parseFloat(discountAmount.toFixed(2)),
        taxAmount: parseFloat(taxAmount.toFixed(2)),
        lineTotal: parseFloat(lineTotal.toFixed(2))
      };
    });

    // 1. Insert Quotation Header
    const [quoResult] = await connection.query(
      `INSERT INTO tbl_quotation 
       (txt_Quotation_Code, int_Requirement_Id, int_Supplier_Id, num_Total_Amount, num_Delivery_Days, txt_Payment_Terms, dte_Valid_Until, num_Coverage_Percent, txt_Status, txt_Remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'SUBMITTED', ?)`,
      [quoCode, requirementId, supplierId, parseFloat(totalAmount.toFixed(2)), deliveryDays, paymentTerms || '30 Days Net', validUntil, coveragePercent, remarks || '']
    );

    const quotationId = quoResult.insertId;

    // 2. Insert Quotation Items with computed discount & tax amounts
    for (const pItem of processedItems) {
      await connection.query(
        `INSERT INTO tbl_quotation_item
         (int_Quotation_Id, int_Req_Item_Id, int_Product_Id, num_Quantity, int_Unit_Id, num_Unit_Price, num_Discount, num_Tax, num_Total_Price, num_Delivery_Estimate_Days, txt_Specification)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          quotationId,
          pItem.reqItemId,
          pItem.productId,
          pItem.qty,
          pItem.unitId,
          pItem.unitPrice,
          pItem.discountAmount,
          pItem.taxAmount,
          pItem.lineTotal,
          pItem.deliveryEstimateDays || deliveryDays,
          pItem.specification || ''
        ]
      );
    }

    // Update RFQ status to QUOTATION_SUBMITTED
    try {
      await connection.query('UPDATE tbl_material_requirement SET txt_Status = "QUOTATION_SUBMITTED" WHERE int_Requirement_Id = ?', [requirementId]);
    } catch (statusErr) {
      await connection.query('UPDATE tbl_material_requirement SET txt_Status = "QUOTATION_RECEIVED" WHERE int_Requirement_Id = ?', [requirementId]);
    }

    await connection.commit();
    connection.release();

    await logAudit(req.user.int_User_Id, 'SUBMIT_QUOTATION', 'tbl_quotation', quotationId, `Supplier submitted quotation ${quoCode} for RFQ ${requirementId}`);

    return sendSuccess(res, 'Quotation submitted successfully', { quotationId, quotationCode: quoCode, totalAmount, coveragePercent }, 201);
  } catch (error) {
    await connection.rollback();
    connection.release();
    return sendError(res, 'Failed to submit quotation', error.message, 500);
  }
};

// GET /api/quotations/requirement/:reqId (Get all submitted quotations for an RFQ)
const getQuotationsByRequirement = async (req, res) => {
  try {
    const reqId = req.params.reqId;

    const [quotations] = await pool.query(
      `SELECT q.*, s.txt_Supplier_Name, s.txt_Contact_Person, s.txt_Phone, s.txt_City, s.txt_Pincode, s.num_Delivery_Radius_KM,
              (SELECT COALESCE(AVG(num_Overall_Rating), 0) FROM tbl_supplier_review WHERE int_Supplier_Id = s.int_Supplier_Id) as supplier_rating,
              (SELECT COUNT(*) FROM tbl_supplier_review WHERE int_Supplier_Id = s.int_Supplier_Id) as review_count
       FROM tbl_quotation q
       JOIN tbl_supplier s ON q.int_Supplier_Id = s.int_Supplier_Id
       WHERE q.int_Requirement_Id = ?
       ORDER BY q.num_Total_Amount ASC`,
      [reqId]
    );

    return sendSuccess(res, 'Quotations retrieved successfully', { quotations });
  } catch (error) {
    return sendError(res, 'Failed to fetch quotations', error.message, 500);
  }
};

module.exports = {
  submitQuotation,
  getQuotationsByRequirement
};
