const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { generateBusinessCode } = require('../services/codeGeneratorService');
const { logAudit } = require('../services/auditService');

// GET /api/admin/suppliers (with status filter & pagination)
const getSuppliers = async (req, res) => {
  try {
    const { status, approvalStatus, search, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (approvalStatus) {
      whereClause += ' AND s.txt_Approval_Status = ?';
      params.push(approvalStatus);
    }
    if (status) {
      whereClause += ' AND s.txt_Status = ?';
      params.push(status);
    }
    if (search) {
      whereClause += ' AND (s.txt_Supplier_Name LIKE ? OR s.txt_Contact_Person LIKE ? OR s.txt_GSTIN LIKE ? OR s.txt_City LIKE ?)';
      const sTerm = `%${search}%`;
      params.push(sTerm, sTerm, sTerm, sTerm);
    }

    const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM tbl_supplier s ${whereClause}`, params);
    const totalRecords = countRows[0].total;

    const query = `
      SELECT s.*, u.txt_Email, u.txt_Username, u.dte_Created_Date as user_created_date,
             k.txt_GST_Status, k.txt_KYC_Status
      FROM tbl_supplier s
      JOIN tbl_user u ON s.int_User_Id = u.int_User_Id
      LEFT JOIN tbl_supplier_kyc k ON s.int_Supplier_Id = k.int_Supplier_Id
      ${whereClause}
      ORDER BY s.int_Supplier_Id DESC
      LIMIT ? OFFSET ?
    `;

    params.push(parseInt(limit), offset);
    const [rows] = await pool.query(query, params);

    return sendSuccess(res, 'Suppliers retrieved successfully', {
      suppliers: rows,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalRecords / parseInt(limit)) || 1,
      totalRecords,
      limit: parseInt(limit)
    });
  } catch (error) {
    return sendError(res, 'Failed to fetch suppliers', error.message, 500);
  }
};

// PUT /api/admin/suppliers/:id/approve
const updateSupplierApproval = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const supplierId = req.params.id;
    const { action, rejectionReason } = req.body; // action: 'APPROVE', 'REJECT', 'SUSPEND', 'REACTIVATE'

    if (!['APPROVE', 'REJECT', 'SUSPEND', 'REACTIVATE'].includes(action)) {
      connection.release();
      return sendError(res, 'Invalid action. Must be APPROVE, REJECT, SUSPEND, or REACTIVATE');
    }

    const [suppliers] = await connection.query('SELECT * FROM tbl_supplier WHERE int_Supplier_Id = ?', [supplierId]);
    if (suppliers.length === 0) {
      connection.release();
      return sendError(res, 'Supplier not found', null, 404);
    }

    const supplier = suppliers[0];
    let newApprovalStatus = supplier.txt_Approval_Status;
    let newUserStatus = 'ACTIVE';

    if (action === 'APPROVE') {
      newApprovalStatus = 'APPROVED';
      newUserStatus = 'ACTIVE';
    } else if (action === 'REJECT') {
      newApprovalStatus = 'REJECTED';
      newUserStatus = 'REJECTED';
    } else if (action === 'SUSPEND') {
      newApprovalStatus = 'SUSPENDED';
      newUserStatus = 'SUSPENDED';
    } else if (action === 'REACTIVATE') {
      newApprovalStatus = 'APPROVED';
      newUserStatus = 'ACTIVE';
    }

    // Update supplier table
    await connection.query(
      `UPDATE tbl_supplier 
       SET txt_Approval_Status = ?, txt_Status = ?, txt_Rejection_Reason = ?
       WHERE int_Supplier_Id = ?`,
      [newApprovalStatus, newUserStatus, rejectionReason || null, supplierId]
    );

    // Update central user table
    await connection.query(
      'UPDATE tbl_user SET txt_Status = ? WHERE int_User_Id = ?',
      [newUserStatus, supplier.int_User_Id]
    );

    // Update KYC table status if approving
    if (action === 'APPROVE') {
      await connection.query(
        'UPDATE tbl_supplier_kyc SET txt_KYC_Status = "APPROVED", txt_GST_Status = "VERIFIED" WHERE int_Supplier_Id = ?',
        [supplierId]
      );
    }

    await connection.commit();
    connection.release();

    await logAudit(req.user.int_User_Id, `SUPPLIER_${action}`, 'tbl_supplier', supplierId, `Admin ${req.user.txt_Username} set supplier status to ${newApprovalStatus}`);

    return sendSuccess(res, `Supplier status updated to ${newApprovalStatus} successfully`, { supplierId, action, newApprovalStatus });
  } catch (error) {
    await connection.rollback();
    connection.release();
    return sendError(res, 'Failed to update supplier approval status', error.message, 500);
  }
};

// GET /api/admin/categories
const getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tbl_category ORDER BY txt_Category_Name ASC');
    return sendSuccess(res, 'Categories retrieved successfully', { categories: rows });
  } catch (error) {
    return sendError(res, 'Failed to fetch categories', error.message, 500);
  }
};

// POST /api/admin/categories
const createCategory = async (req, res) => {
  try {
    const { categoryName, description, imageUrl } = req.body;
    if (!categoryName) return sendError(res, 'Category name is required');

    const categoryCode = await generateBusinessCode('CAT', 'tbl_category', 'txt_Category_Code');

    const [result] = await pool.query(
      `INSERT INTO tbl_category (txt_Category_Code, txt_Category_Name, txt_Description, txt_Image_Url, txt_Status)
       VALUES (?, ?, ?, ?, 'ACTIVE')`,
      [categoryCode, categoryName, description || '', imageUrl || '']
    );

    return sendSuccess(res, 'Category created successfully', { categoryId: result.insertId, categoryCode, categoryName }, 201);
  } catch (error) {
    return sendError(res, 'Failed to create category', error.message, 500);
  }
};

// GET /api/admin/products
const getMasterProducts = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT p.*, c.txt_Category_Name, u.txt_Unit_Name, u.txt_Abbreviation
      FROM tbl_product p
      JOIN tbl_category c ON p.int_Category_Id = c.int_Category_Id
      JOIN tbl_unit u ON p.int_Default_Unit_Id = u.int_Unit_Id
      ORDER BY p.int_Product_Id DESC
    `);
    return sendSuccess(res, 'Master products retrieved successfully', { products: rows });
  } catch (error) {
    return sendError(res, 'Failed to fetch master products', error.message, 500);
  }
};

// POST /api/admin/products
const createMasterProduct = async (req, res) => {
  try {
    const { categoryId, productName, description, defaultSpec, defaultUnitId } = req.body;
    if (!categoryId || !productName || !defaultUnitId) {
      return sendError(res, 'Category, Product Name, and Default Unit are required');
    }

    const productCode = await generateBusinessCode('PRD', 'tbl_product', 'txt_Product_Code');

    const [result] = await pool.query(
      `INSERT INTO tbl_product (txt_Product_Code, int_Category_Id, txt_Product_Name, txt_Description, txt_Default_Spec, int_Default_Unit_Id, txt_Status)
       VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')`,
      [productCode, categoryId, productName, description || '', defaultSpec || '', defaultUnitId]
    );

    return sendSuccess(res, 'Master product created successfully', { productId: result.insertId, productCode, productName }, 201);
  } catch (error) {
    return sendError(res, 'Failed to create master product', error.message, 500);
  }
};

module.exports = {
  getSuppliers,
  updateSupplierApproval,
  getCategories,
  createCategory,
  getMasterProducts,
  createMasterProduct
};
