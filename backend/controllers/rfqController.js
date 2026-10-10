const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { generateBusinessCode } = require('../services/codeGeneratorService');

// POST /api/requirements (Create RFQ Header + Items)
const createRequirement = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const builderId = req.user.builderId;
    const { projectId, requirementTitle, deliveryLocation, city, pincode, requiredDeliveryDate, priority, remarks, items } = req.body;

    if (!projectId || !requirementTitle || !deliveryLocation || !city || !pincode || !requiredDeliveryDate || !items || !Array.isArray(items) || items.length === 0) {
      connection.release();
      return sendError(res, 'Project, Title, Delivery Location, City, Pincode, Required Date, and at least 1 Item are required');
    }

    const reqCode = await generateBusinessCode('REQ', 'tbl_material_requirement', 'txt_Requirement_Code');

    // 1. Insert RFQ Header
    const [reqResult] = await connection.query(
      `INSERT INTO tbl_material_requirement 
       (txt_Requirement_Code, int_Project_Id, int_Builder_Id, txt_Requirement_Title, txt_Delivery_Location, txt_City, txt_Pincode, dte_Required_Delivery_Date, txt_Priority, txt_Status, txt_Remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'OPEN', ?)`,
      [reqCode, projectId, builderId, requirementTitle, deliveryLocation, city, pincode, requiredDeliveryDate, priority || 'MEDIUM', remarks || '']
    );

    const requirementId = reqResult.insertId;

    // 2. Insert RFQ Items
    for (const item of items) {
      const { productId, categoryId, quantity, unitId, requiredSpec, preferredBrand, maxAcceptablePrice } = item;
      if (!productId || !categoryId || !quantity || !unitId) {
        throw new Error('Each item must contain productId, categoryId, quantity, and unitId');
      }

      await connection.query(
        `INSERT INTO tbl_requirement_item
         (int_Requirement_Id, int_Product_Id, int_Category_Id, num_Quantity, int_Unit_Id, txt_Required_Spec, txt_Preferred_Brand, num_Max_Acceptable_Price)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [requirementId, productId, categoryId, quantity, unitId, requiredSpec || '', preferredBrand || '', maxAcceptablePrice || null]
      );
    }

    await connection.commit();
    connection.release();

    return sendSuccess(res, 'Material Requirement / RFQ created successfully', { requirementId, requirementCode: reqCode }, 201);
  } catch (error) {
    await connection.rollback();
    connection.release();
    return sendError(res, 'Failed to create RFQ requirement', error.message, 500);
  }
};

// GET /api/requirements (List RFQs by role)
const getRequirements = async (req, res) => {
  try {
    const { role, builderId, supplierId } = req.user;
    const { status, search } = req.query;

    let query = `
      SELECT r.*, p.txt_Project_Name, b.txt_Company_Name as builder_company_name,
             (SELECT COUNT(*) FROM tbl_requirement_item WHERE int_Requirement_Id = r.int_Requirement_Id) as item_count,
             (SELECT COUNT(*) FROM tbl_quotation WHERE int_Requirement_Id = r.int_Requirement_Id) as quotation_count
             ${role === 'SUPPLIER' && supplierId ? `, (SELECT COUNT(*) FROM tbl_quotation WHERE int_Requirement_Id = r.int_Requirement_Id AND int_Supplier_Id = ${parseInt(supplierId, 10)}) as my_quotation_count` : ''}
      FROM tbl_material_requirement r
      JOIN tbl_project p ON r.int_Project_Id = p.int_Project_Id
      JOIN tbl_builder b ON r.int_Builder_Id = b.int_Builder_Id
      WHERE 1=1
    `;
    const params = [];

    if (role === 'BUILDER') {
      query += ' AND r.int_Builder_Id = ?';
      params.push(builderId);
    } else if (role === 'SUPPLIER') {
      // Show open and active RFQs
      query += " AND r.txt_Status IN ('OPEN', 'QUOTATION_RECEIVED', 'QUOTATION_SUBMITTED', 'CLOSED')";
    }

    if (status) {
      query += ' AND r.txt_Status = ?';
      params.push(status);
    }
    if (search) {
      query += ' AND (r.txt_Requirement_Title LIKE ? OR r.txt_Requirement_Code LIKE ? OR r.txt_City LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    query += ' ORDER BY r.int_Requirement_Id DESC';

    const [rows] = await pool.query(query, params);
    return sendSuccess(res, 'Requirements retrieved successfully', { requirements: rows });
  } catch (error) {
    return sendError(res, 'Failed to fetch requirements', error.message, 500);
  }
};

// GET /api/requirements/:id (Get single RFQ details with items)
const getRequirementById = async (req, res) => {
  try {
    const reqId = req.params.id;

    const [rfqs] = await pool.query(
      `SELECT r.*, p.txt_Project_Name, p.txt_Project_Code, b.txt_Company_Name, b.txt_Phone as builder_phone, u.txt_Email as builder_email
       FROM tbl_material_requirement r
       JOIN tbl_project p ON r.int_Project_Id = p.int_Project_Id
       JOIN tbl_builder b ON r.int_Builder_Id = b.int_Builder_Id
       JOIN tbl_user u ON b.int_User_Id = u.int_User_Id
       WHERE r.int_Requirement_Id = ?`,
      [reqId]
    );

    if (rfqs.length === 0) return sendError(res, 'Requirement not found', null, 404);

    const [items] = await pool.query(
      `SELECT ri.*, prd.txt_Product_Name, prd.txt_Product_Code, c.txt_Category_Name, u.txt_Unit_Name, u.txt_Abbreviation
       FROM tbl_requirement_item ri
       JOIN tbl_product prd ON ri.int_Product_Id = prd.int_Product_Id
       JOIN tbl_category c ON ri.int_Category_Id = c.int_Category_Id
       JOIN tbl_unit u ON ri.int_Unit_Id = u.int_Unit_Id
       WHERE ri.int_Requirement_Id = ?`,
      [reqId]
    );

    return sendSuccess(res, 'Requirement details retrieved successfully', { requirement: rfqs[0], items });
  } catch (error) {
    return sendError(res, 'Failed to fetch requirement details', error.message, 500);
  }
};

module.exports = {
  createRequirement,
  getRequirements,
  getRequirementById
};
