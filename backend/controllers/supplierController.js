const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { generateBusinessCode } = require('../services/codeGeneratorService');

// GET /api/suppliers/profile
const getProfile = async (req, res) => {
  try {
    const supplierId = req.user.supplierId;
    const [rows] = await pool.query(
      `SELECT s.*, u.txt_Username, u.txt_Email, k.txt_GST_Status, k.txt_KYC_Status, k.txt_Business_Reg_No, k.txt_PAN
       FROM tbl_supplier s
       JOIN tbl_user u ON s.int_User_Id = u.int_User_Id
       LEFT JOIN tbl_supplier_kyc k ON s.int_Supplier_Id = k.int_Supplier_Id
       WHERE s.int_Supplier_Id = ?`,
      [supplierId]
    );

    if (rows.length === 0) return sendError(res, 'Supplier profile not found', null, 404);

    return sendSuccess(res, 'Supplier profile retrieved successfully', { profile: rows[0] });
  } catch (error) {
    return sendError(res, 'Failed to fetch supplier profile', error.message, 500);
  }
};

// GET /api/suppliers/products (List supplier's active products)
const getSupplierProducts = async (req, res) => {
  try {
    const supplierId = req.user.supplierId;
    const [rows] = await pool.query(
      `SELECT sp.*, p.txt_Product_Name as master_product_name, c.txt_Category_Name, u.txt_Unit_Name, u.txt_Abbreviation
       FROM tbl_supplier_product sp
       JOIN tbl_product p ON sp.int_Product_Id = p.int_Product_Id
       JOIN tbl_category c ON p.int_Category_Id = c.int_Category_Id
       JOIN tbl_unit u ON sp.int_Unit_Id = u.int_Unit_Id
       WHERE sp.int_Supplier_Id = ?
       ORDER BY sp.int_Supplier_Product_Id DESC`,
      [supplierId]
    );

    return sendSuccess(res, 'Supplier products retrieved successfully', { products: rows });
  } catch (error) {
    return sendError(res, 'Failed to fetch supplier products', error.message, 500);
  }
};

// POST /api/suppliers/products (Add product offering to catalogue)
const addSupplierProduct = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const supplierId = req.user.supplierId;
    const { productId, customProductName, brand, specification, unitId, basePrice, bulkPrice, bulkThreshold, moq, currentStock, minimumStock, deliveryRadius, certificationRef } = req.body;

    if (!productId || !unitId || basePrice === undefined || moq === undefined) {
      connection.release();
      return sendError(res, 'Product, Unit, Price, and MOQ are required');
    }

    // Check duplicate offering
    const [existing] = await connection.query(
      'SELECT int_Supplier_Product_Id FROM tbl_supplier_product WHERE int_Supplier_Id = ? AND int_Product_Id = ?',
      [supplierId, productId]
    );

    if (existing.length > 0) {
      connection.release();
      return sendError(res, 'Product is already listed in your catalogue. Please edit existing listing instead.');
    }

    const spCode = await generateBusinessCode('SPR', 'tbl_supplier_product', 'txt_Supplier_Product_Code');
    const availStatus = parseInt(currentStock, 10) > parseInt(minimumStock, 10) ? 'IN_STOCK' : (parseInt(currentStock, 10) > 0 ? 'LOW_STOCK' : 'OUT_OF_STOCK');

    const [spResult] = await connection.query(
      `INSERT INTO tbl_supplier_product 
       (txt_Supplier_Product_Code, int_Supplier_Id, int_Product_Id, txt_Custom_Product_Name, txt_Brand, txt_Specification, int_Unit_Id, num_Base_Price, num_Bulk_Price, num_Bulk_Threshold, num_MOQ, num_Current_Stock, num_Minimum_Stock, num_Delivery_Radius_KM, txt_Certification_Ref, txt_Availability_Status, txt_Status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
      [spCode, supplierId, productId, customProductName || '', brand || '', specification || '', unitId, basePrice, bulkPrice || null, bulkThreshold || 0, moq, currentStock || 0, minimumStock || 10, deliveryRadius || 50.0, certificationRef || '', availStatus]
    );

    // Sync supplier inventory table
    await connection.query(
      `INSERT INTO tbl_supplier_inventory (int_Supplier_Id, int_Product_Id, num_Current_Stock, num_Minimum_Stock, int_Unit_Id, txt_Availability_Status)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE num_Current_Stock = VALUES(num_Current_Stock), num_Minimum_Stock = VALUES(num_Minimum_Stock), txt_Availability_Status = VALUES(txt_Availability_Status)`,
      [supplierId, productId, currentStock || 0, minimumStock || 10, unitId, availStatus]
    );

    await connection.commit();
    connection.release();

    return sendSuccess(res, 'Product offering added to catalogue successfully', { supplierProductId: spResult.insertId, code: spCode }, 201);
  } catch (error) {
    await connection.rollback();
    connection.release();
    return sendError(res, 'Failed to add supplier product', error.message, 500);
  }
};

// PUT /api/suppliers/products/:id (Update stock & price)
const updateSupplierProduct = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const supplierId = req.user.supplierId;
    const spId = req.params.id;
    const { basePrice, moq, currentStock, minimumStock, deliveryRadius, status } = req.body;

    const [existing] = await connection.query('SELECT * FROM tbl_supplier_product WHERE int_Supplier_Product_Id = ? AND int_Supplier_Id = ?', [spId, supplierId]);
    if (existing.length === 0) {
      connection.release();
      return sendError(res, 'Supplier product listing not found', null, 404);
    }

    const current = existing[0];
    const newStock = currentStock !== undefined ? parseInt(currentStock, 10) : current.num_Current_Stock;
    const newMinStock = minimumStock !== undefined ? parseInt(minimumStock, 10) : current.num_Minimum_Stock;
    const availStatus = newStock > newMinStock ? 'IN_STOCK' : (newStock > 0 ? 'LOW_STOCK' : 'OUT_OF_STOCK');

    await connection.query(
      `UPDATE tbl_supplier_product
       SET num_Base_Price = COALESCE(?, num_Base_Price),
           num_MOQ = COALESCE(?, num_MOQ),
           num_Current_Stock = ?,
           num_Minimum_Stock = ?,
           num_Delivery_Radius_KM = COALESCE(?, num_Delivery_Radius_KM),
           txt_Availability_Status = ?,
           txt_Status = COALESCE(?, txt_Status)
       WHERE int_Supplier_Product_Id = ? AND int_Supplier_Id = ?`,
      [basePrice, moq, newStock, newMinStock, deliveryRadius, availStatus, status, spId, supplierId]
    );

    // Sync supplier inventory table
    await connection.query(
      `UPDATE tbl_supplier_inventory
       SET num_Current_Stock = ?, num_Minimum_Stock = ?, txt_Availability_Status = ?
       WHERE int_Supplier_Id = ? AND int_Product_Id = ?`,
      [newStock, newMinStock, availStatus, supplierId, current.int_Product_Id]
    );

    await connection.commit();
    connection.release();

    return sendSuccess(res, 'Supplier product updated successfully', { spId, newStock, availStatus });
  } catch (error) {
    await connection.rollback();
    connection.release();
    return sendError(res, 'Failed to update supplier product', error.message, 500);
  }
};

module.exports = {
  getProfile,
  getSupplierProducts,
  addSupplierProduct,
  updateSupplierProduct
};
