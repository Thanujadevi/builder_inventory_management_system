const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { generateBusinessCode } = require('../services/codeGeneratorService');
const { logAudit } = require('../services/auditService');

// POST /api/purchase-orders (Builder accepts a quotation & creates PO)
const createPurchaseOrder = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const builderId = req.user.builderId;
    const { quotationId, expectedDeliveryDate, deliveryLocation, terms, remarks } = req.body;

    if (!quotationId || !expectedDeliveryDate || !deliveryLocation) {
      connection.release();
      return sendError(res, 'Quotation ID, Expected Delivery Date, and Delivery Location are required');
    }

    // 1. Fetch quotation & RFQ details
    const [quotations] = await connection.query(
      `SELECT q.*, r.int_Project_Id, r.int_Builder_Id
       FROM tbl_quotation q
       JOIN tbl_material_requirement r ON q.int_Requirement_Id = r.int_Requirement_Id
       WHERE q.int_Quotation_Id = ?`,
      [quotationId]
    );

    if (quotations.length === 0) {
      connection.release();
      return sendError(res, 'Quotation not found', null, 404);
    }

    const quotation = quotations[0];

    if (quotation.int_Builder_Id !== builderId) {
      connection.release();
      return sendError(res, 'Unauthorized to accept this quotation', null, 403);
    }

    if (quotation.txt_Status === 'ACCEPTED') {
      connection.release();
      return sendError(res, 'This quotation has already been accepted and converted into a Purchase Order.');
    }

    const poCode = await generateBusinessCode('PO', 'tbl_purchase_order', 'txt_PO_Code');
    const today = new Date().toISOString().split('T')[0];

    // 2. Create Purchase Order Header
    const [poResult] = await connection.query(
      `INSERT INTO tbl_purchase_order 
       (txt_PO_Code, int_Project_Id, int_Builder_Id, int_Supplier_Id, int_Quotation_Id, int_Requirement_Id, dte_PO_Date, txt_Delivery_Location, dte_Expected_Delivery_Date, num_Total_Amount, txt_Terms, txt_Remarks, txt_Status, txt_Payment_Status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ISSUED', 'PENDING')`,
      [poCode, quotation.int_Project_Id, builderId, quotation.int_Supplier_Id, quotationId, quotation.int_Requirement_Id, today, deliveryLocation, expectedDeliveryDate, quotation.num_Total_Amount, terms || quotation.txt_Payment_Terms, remarks || '']
    );

    const poId = poResult.insertId;

    // 3. Copy Quotation Items into Purchase Order Items
    const [quoItems] = await connection.query('SELECT * FROM tbl_quotation_item WHERE int_Quotation_Id = ?', [quotationId]);

    for (const item of quoItems) {
      await connection.query(
        `INSERT INTO tbl_purchase_order_item 
         (int_PO_Id, int_Product_Id, num_Quantity, int_Unit_Id, num_Unit_Price, num_Discount, num_Tax, num_Total)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [poId, item.int_Product_Id, item.num_Quantity, item.int_Unit_Id, item.num_Unit_Price, item.num_Discount, item.num_Tax, item.num_Total_Price]
      );
    }

    // 4. Update Quotation Status to ACCEPTED & others for same RFQ to REJECTED
    await connection.query('UPDATE tbl_quotation SET txt_Status = "ACCEPTED" WHERE int_Quotation_Id = ?', [quotationId]);
    await connection.query('UPDATE tbl_quotation SET txt_Status = "REJECTED" WHERE int_Requirement_Id = ? AND int_Quotation_Id != ?', [quotation.int_Requirement_Id, quotationId]);

    // 5. Update RFQ Status to CLOSED
    await connection.query('UPDATE tbl_material_requirement SET txt_Status = "CLOSED" WHERE int_Requirement_Id = ?', [quotation.int_Requirement_Id]);

    await connection.commit();
    connection.release();

    await logAudit(req.user.int_User_Id, 'CREATE_PO', 'tbl_purchase_order', poId, `Builder accepted quotation ${quotation.txt_Quotation_Code} and generated PO ${poCode}`);

    return sendSuccess(res, 'Purchase Order created successfully', { poId, poCode, totalAmount: quotation.num_Total_Amount }, 201);
  } catch (error) {
    await connection.rollback();
    connection.release();
    return sendError(res, 'Failed to create Purchase Order', error.message, 500);
  }
};

// GET /api/purchase-orders (List POs by role)
const getPurchaseOrders = async (req, res) => {
  try {
    const { role, builderId, supplierId } = req.user;
    const { status } = req.query;

    let query = `
      SELECT po.*, p.txt_Project_Name, b.txt_Company_Name as builder_company_name,
             s.txt_Supplier_Name, r.txt_Requirement_Title,
             (SELECT COUNT(*) FROM tbl_purchase_order_item WHERE int_PO_Id = po.int_PO_Id) as item_count,
             (SELECT COALESCE(SUM(num_Amount), 0) FROM tbl_payment WHERE int_PO_Id = po.int_PO_Id AND txt_Status = 'SUCCESSFUL') as total_paid
      FROM tbl_purchase_order po
      JOIN tbl_project p ON po.int_Project_Id = p.int_Project_Id
      JOIN tbl_builder b ON po.int_Builder_Id = b.int_Builder_Id
      JOIN tbl_supplier s ON po.int_Supplier_Id = s.int_Supplier_Id
      JOIN tbl_material_requirement r ON po.int_Requirement_Id = r.int_Requirement_Id
      WHERE 1=1
    `;
    const params = [];

    if (role === 'BUILDER') {
      query += ' AND po.int_Builder_Id = ?';
      params.push(builderId);
    } else if (role === 'SUPPLIER') {
      query += ' AND po.int_Supplier_Id = ?';
      params.push(supplierId);
    }

    if (status) {
      query += ' AND po.txt_Status = ?';
      params.push(status);
    }

    query += ' ORDER BY po.int_PO_Id DESC';

    const [rows] = await pool.query(query, params);

    // Compute remaining balance for each PO
    const pos = rows.map(r => ({
      ...r,
      remaining_balance: Math.max(0, parseFloat(r.num_Total_Amount) - parseFloat(r.total_paid))
    }));

    return sendSuccess(res, 'Purchase Orders retrieved successfully', { purchaseOrders: pos });
  } catch (error) {
    return sendError(res, 'Failed to fetch purchase orders', error.message, 500);
  }
};

// PUT /api/purchase-orders/:id/status (Update delivery status: ISSUED -> ACCEPTED -> PROCESSING -> DISPATCHED -> DELIVERED)
const updatePOStatus = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const poId = req.params.id;
    const { status } = req.body; // ISSUED, ACCEPTED, REJECTED, PROCESSING, DISPATCHED, DELIVERED, CANCELLED

    if (!['ACCEPTED', 'REJECTED', 'PROCESSING', 'DISPATCHED', 'DELIVERED', 'CANCELLED'].includes(status)) {
      connection.release();
      return sendError(res, 'Invalid status transition value');
    }

    const [pos] = await connection.query('SELECT * FROM tbl_purchase_order WHERE int_PO_Id = ?', [poId]);
    if (pos.length === 0) {
      connection.release();
      return sendError(res, 'Purchase Order not found', null, 404);
    }

    const po = pos[0];
    if (po.txt_Status === 'DELIVERED') {
      connection.release();
      return sendError(res, 'This Purchase Order has already been delivered and its status is locked.');
    }

    // Update PO Status
    await connection.query('UPDATE tbl_purchase_order SET txt_Status = ? WHERE int_PO_Id = ?', [status, poId]);

    // CRITICAL REQUIREMENT: If status transitions to DELIVERED, update Project Inventory & create Inventory Transaction
    if (status === 'DELIVERED') {
      const [poItems] = await connection.query('SELECT * FROM tbl_purchase_order_item WHERE int_PO_Id = ?', [poId]);

      for (const item of poItems) {
        const qty = parseInt(item.num_Quantity, 10);
        const productId = item.int_Product_Id;
        const unitId = item.int_Unit_Id;

        // 1. Update/Upsert Project Inventory
        await connection.query(
          `INSERT INTO tbl_project_inventory (int_Project_Id, int_Product_Id, num_Current_Stock, num_Minimum_Level, int_Unit_Id)
           VALUES (?, ?, ?, 10, ?)
           ON DUPLICATE KEY UPDATE num_Current_Stock = num_Current_Stock + VALUES(num_Current_Stock)`,
          [po.int_Project_Id, productId, qty, unitId]
        );

        // 2. Deduct Supplier Stock
        await connection.query(
          `UPDATE tbl_supplier_product 
           SET num_Current_Stock = GREATEST(0, num_Current_Stock - ?)
           WHERE int_Supplier_Id = ? AND int_Product_Id = ?`,
          [qty, po.int_Supplier_Id, productId]
        );

        await connection.query(
          `UPDATE tbl_supplier_inventory 
           SET num_Current_Stock = GREATEST(0, num_Current_Stock - ?)
           WHERE int_Supplier_Id = ? AND int_Product_Id = ?`,
          [qty, po.int_Supplier_Id, productId]
        );

        // 3. Log Inventory Transaction
        const txnCode = await generateBusinessCode('TXN', 'tbl_inventory_transaction', 'txt_Transaction_Code');
        await connection.query(
          `INSERT INTO tbl_inventory_transaction
           (txt_Transaction_Code, int_Product_Id, int_Project_Id, int_Supplier_Id, num_Quantity, txt_Transaction_Type, txt_Reference, txt_Remarks)
           VALUES (?, ?, ?, ?, ?, 'DELIVERY', ?, ?)`,
          [txnCode, productId, po.int_Project_Id, po.int_Supplier_Id, qty, po.txt_PO_Code, `Delivered for PO ${po.txt_PO_Code}`]
        );
      }
    }

    await connection.commit();
    connection.release();

    await logAudit(req.user.int_User_Id, 'UPDATE_PO_STATUS', 'tbl_purchase_order', poId, `PO ${po.txt_PO_Code} status updated to ${status}`);

    return sendSuccess(res, `Purchase Order delivery status updated to ${status} successfully`, { poId, status });
  } catch (error) {
    await connection.rollback();
    connection.release();
    return sendError(res, 'Failed to update PO status', error.message, 500);
  }
};

module.exports = {
  createPurchaseOrder,
  getPurchaseOrders,
  updatePOStatus
};
