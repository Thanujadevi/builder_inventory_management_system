const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { generateBusinessCode } = require('../services/codeGeneratorService');
const { logAudit } = require('../services/auditService');

// Helper to resolve Builder ID from session
const getBuilderIdFromReq = async (req) => {
  if (req.user && req.user.builderId) return req.user.builderId;
  const [bRows] = await pool.query('SELECT int_Builder_Id FROM tbl_builder LIMIT 1');
  return bRows.length > 0 ? bRows[0].int_Builder_Id : 1;
};

// ============================================================
// 1. INVENTORY DASHBOARD & ALERTS
// ============================================================
const getInventoryDashboard = async (req, res) => {
  try {
    const builderId = await getBuilderIdFromReq(req);

    // Summary counts & valuation
    const [[metrics]] = await pool.query(
      `SELECT 
         COUNT(*) as totalItems,
         COALESCE(SUM(num_Current_Stock * num_Unit_Price), 0) as totalStockValue,
         SUM(CASE WHEN num_Current_Stock <= num_Minimum_Level AND num_Current_Stock > 0 THEN 1 ELSE 0 END) as lowStockItems,
         SUM(CASE WHEN num_Current_Stock <= 0 THEN 1 ELSE 0 END) as outOfStockItems
       FROM tbl_material_inventory
       WHERE int_Builder_Id = ? AND txt_Status = 'ACTIVE'`,
      [builderId]
    );

    // Active Low-stock & Out-of-stock Alerts
    const [alerts] = await pool.query(
      `SELECT mi.*, c.txt_Category_Name, u.txt_Unit_Name, u.txt_Abbreviation, s.txt_Supplier_Name
       FROM tbl_material_inventory mi
       JOIN tbl_category c ON mi.int_Category_Id = c.int_Category_Id
       JOIN tbl_unit u ON mi.int_Unit_Id = u.int_Unit_Id
       LEFT JOIN tbl_supplier s ON mi.int_Supplier_Id = s.int_Supplier_Id
       WHERE mi.int_Builder_Id = ? AND mi.txt_Status = 'ACTIVE' AND mi.num_Current_Stock <= mi.num_Minimum_Level
       ORDER BY (mi.num_Current_Stock / GREATEST(mi.num_Minimum_Level, 1)) ASC
       LIMIT 10`,
      [builderId]
    );

    // Recent Stock Movements (last 10 transactions)
    const [recentMovements] = await pool.query(
      `SELECT it.*, p.txt_Product_Name, prj.txt_Project_Name, s.txt_Supplier_Name, mi.txt_Material_Name, mi.txt_Material_Code
       FROM tbl_inventory_transaction it
       LEFT JOIN tbl_material_inventory mi ON it.int_Inventory_Id = mi.int_Inventory_Id
       LEFT JOIN tbl_product p ON it.int_Product_Id = p.int_Product_Id
       LEFT JOIN tbl_project prj ON it.int_Project_Id = prj.int_Project_Id
       LEFT JOIN tbl_supplier s ON it.int_Supplier_Id = s.int_Supplier_Id
       ORDER BY it.int_Transaction_Id DESC
       LIMIT 10`
    );

    // Category Valuation Breakdown
    const [categoryBreakdown] = await pool.query(
      `SELECT c.txt_Category_Name, 
              COUNT(mi.int_Inventory_Id) as itemCount,
              COALESCE(SUM(mi.num_Current_Stock * mi.num_Unit_Price), 0) as categoryValue
       FROM tbl_category c
       LEFT JOIN tbl_material_inventory mi ON c.int_Category_Id = mi.int_Category_Id AND mi.int_Builder_Id = ? AND mi.txt_Status = 'ACTIVE'
       GROUP BY c.int_Category_Id, c.txt_Category_Name
       ORDER BY categoryValue DESC`,
      [builderId]
    );

    return sendSuccess(res, 'Inventory dashboard metrics retrieved', {
      stats: {
        totalItems: parseInt(metrics.totalItems || 0, 10),
        totalStockValue: parseFloat(metrics.totalStockValue || 0),
        lowStockItems: parseInt(metrics.lowStockItems || 0, 10),
        outOfStockItems: parseInt(metrics.outOfStockItems || 0, 10)
      },
      alerts,
      recentMovements,
      categoryBreakdown
    });
  } catch (error) {
    return sendError(res, 'Failed to fetch inventory dashboard', error.message, 500);
  }
};

// ============================================================
// 2. MATERIAL MANAGEMENT (CRUD, SEARCH, FILTER, SORT)
// ============================================================
const getMaterials = async (req, res) => {
  try {
    const builderId = await getBuilderIdFromReq(req);
    const { search, categoryId, stockStatus, supplierId, location, projectId, sortBy = 'id', sortOrder = 'DESC' } = req.query;

    let query = `
      SELECT mi.*, 
             c.txt_Category_Name, 
             u.txt_Unit_Name, u.txt_Abbreviation, 
             s.txt_Supplier_Name, s.txt_Contact_Person as supplier_contact, s.txt_Phone as supplier_phone,
             prj.txt_Project_Name,
             (mi.num_Current_Stock * mi.num_Unit_Price) as totalStockValue,
             CASE 
               WHEN mi.num_Current_Stock <= 0 THEN 'OUT_OF_STOCK'
               WHEN mi.num_Current_Stock <= mi.num_Minimum_Level THEN 'LOW_STOCK'
               ELSE 'IN_STOCK'
             END as stockHealth
      FROM tbl_material_inventory mi
      JOIN tbl_category c ON mi.int_Category_Id = c.int_Category_Id
      JOIN tbl_unit u ON mi.int_Unit_Id = u.int_Unit_Id
      LEFT JOIN tbl_supplier s ON mi.int_Supplier_Id = s.int_Supplier_Id
      LEFT JOIN tbl_project prj ON mi.int_Project_Id = prj.int_Project_Id
      WHERE mi.int_Builder_Id = ? AND mi.txt_Status = 'ACTIVE'
    `;
    const params = [builderId];

    if (search) {
      query += ` AND (mi.txt_Material_Name LIKE ? OR mi.txt_Material_Code LIKE ? OR mi.txt_Storage_Location LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    if (categoryId) {
      query += ` AND mi.int_Category_Id = ?`;
      params.push(categoryId);
    }

    if (supplierId) {
      query += ` AND mi.int_Supplier_Id = ?`;
      params.push(supplierId);
    }

    if (location) {
      query += ` AND mi.txt_Storage_Location LIKE ?`;
      params.push(`%${location}%`);
    }

    if (projectId) {
      if (projectId === 'central') {
        query += ` AND mi.int_Project_Id IS NULL`;
      } else {
        query += ` AND mi.int_Project_Id = ?`;
        params.push(projectId);
      }
    }

    if (stockStatus) {
      if (stockStatus === 'OUT_OF_STOCK') {
        query += ` AND mi.num_Current_Stock <= 0`;
      } else if (stockStatus === 'LOW_STOCK') {
        query += ` AND mi.num_Current_Stock > 0 AND mi.num_Current_Stock <= mi.num_Minimum_Level`;
      } else if (stockStatus === 'IN_STOCK') {
        query += ` AND mi.num_Current_Stock > mi.num_Minimum_Level`;
      }
    }

    // Sorting
    const sortMapping = {
      name: 'mi.txt_Material_Name',
      quantity: 'mi.num_Current_Stock',
      price: 'mi.num_Unit_Price',
      value: 'totalStockValue',
      date: 'mi.dte_Last_Updated',
      id: 'mi.int_Inventory_Id'
    };
    const orderCol = sortMapping[sortBy] || 'mi.int_Inventory_Id';
    const direction = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query += ` ORDER BY ${orderCol} ${direction}`;

    const [rows] = await pool.query(query, params);
    return sendSuccess(res, 'Materials retrieved successfully', { materials: rows });
  } catch (error) {
    return sendError(res, 'Failed to fetch materials', error.message, 500);
  }
};

const createMaterial = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const builderId = await getBuilderIdFromReq(req);
    const { 
      materialName, 
      categoryId, 
      unitId, 
      currentQuantity = 0, 
      minimumLevel = 10, 
      unitPrice = 0, 
      supplierId = null, 
      storageLocation = 'Central Warehouse - Yard A',
      projectId = null 
    } = req.body;

    if (!materialName || !categoryId || !unitId) {
      connection.release();
      return sendError(res, 'Material Name, Category, and Unit of Measurement are required.');
    }

    // Check duplicate material in same location/project
    const [existing] = await connection.query(
      `SELECT int_Inventory_Id FROM tbl_material_inventory 
       WHERE int_Builder_Id = ? AND LOWER(txt_Material_Name) = LOWER(?) AND txt_Storage_Location = ? AND txt_Status = 'ACTIVE'`,
      [builderId, materialName.trim(), storageLocation]
    );

    if (existing.length > 0) {
      connection.release();
      return sendError(res, 'A material with this name already exists in this storage location.');
    }

    const materialCode = await generateBusinessCode('MAT', 'tbl_material_inventory', 'txt_Material_Code');

    // Create Material record
    const [result] = await connection.query(
      `INSERT INTO tbl_material_inventory
       (txt_Material_Code, int_Builder_Id, int_Project_Id, int_Product_Id, txt_Material_Name, int_Category_Id, int_Unit_Id, num_Current_Stock, num_Minimum_Level, num_Unit_Price, int_Supplier_Id, txt_Storage_Location)
       VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        materialCode,
        builderId,
        projectId ? parseInt(projectId, 10) : null,
        materialName.trim(),
        parseInt(categoryId, 10),
        parseInt(unitId, 10),
        parseFloat(currentQuantity) || 0,
        parseFloat(minimumLevel) || 10,
        parseFloat(unitPrice) || 0,
        supplierId ? parseInt(supplierId, 10) : null,
        storageLocation || 'Central Warehouse'
      ]
    );

    const invId = result.insertId;

    // If initial stock was provided > 0, log an initial stock-in transaction
    if (parseFloat(currentQuantity) > 0) {
      const txnCode = await generateBusinessCode('TXN', 'tbl_inventory_transaction', 'txt_Transaction_Code');
      const totalCost = (parseFloat(currentQuantity) || 0) * (parseFloat(unitPrice) || 0);
      await connection.query(
        `INSERT INTO tbl_inventory_transaction
         (txt_Transaction_Code, int_Inventory_Id, int_Product_Id, int_Project_Id, int_Supplier_Id, num_Quantity, num_Unit_Cost, num_Total_Cost, txt_Transaction_Type, txt_Reference, txt_Storage_Location, txt_Remarks, txt_Created_By)
         VALUES (?, ?, 1, ?, ?, ?, ?, ?, 'STOCK_IN', 'INITIAL-SETUP', ?, 'Initial opening stock intake', ?)`,
        [
          txnCode,
          invId,
          projectId ? parseInt(projectId, 10) : null,
          supplierId ? parseInt(supplierId, 10) : null,
          parseFloat(currentQuantity),
          parseFloat(unitPrice) || 0,
          totalCost,
          storageLocation,
          req.user?.username || 'SYSTEM'
        ]
      );
    }

    await connection.commit();
    connection.release();

    await logAudit(req.user?.int_User_Id, 'CREATE_MATERIAL', 'tbl_material_inventory', invId, `Created material ${materialCode} - ${materialName}`);

    return sendSuccess(res, 'Construction material created successfully', { inventoryId: invId, materialCode }, 201);
  } catch (error) {
    await connection.rollback();
    connection.release();
    return sendError(res, 'Failed to create construction material', error.message, 500);
  }
};

const updateMaterial = async (req, res) => {
  try {
    const invId = req.params.id;
    const { 
      materialName, 
      categoryId, 
      unitId, 
      minimumLevel, 
      unitPrice, 
      supplierId, 
      storageLocation, 
      projectId 
    } = req.body;

    const [rows] = await pool.query('SELECT * FROM tbl_material_inventory WHERE int_Inventory_Id = ?', [invId]);
    if (rows.length === 0) return sendError(res, 'Material not found', null, 404);

    await pool.query(
      `UPDATE tbl_material_inventory 
       SET txt_Material_Name = COALESCE(?, txt_Material_Name),
           int_Category_Id = COALESCE(?, int_Category_Id),
           int_Unit_Id = COALESCE(?, int_Unit_Id),
           num_Minimum_Level = COALESCE(?, num_Minimum_Level),
           num_Unit_Price = COALESCE(?, num_Unit_Price),
           int_Supplier_Id = ?,
           txt_Storage_Location = COALESCE(?, txt_Storage_Location),
           int_Project_Id = ?,
           dte_Last_Updated = CURRENT_TIMESTAMP
       WHERE int_Inventory_Id = ?`,
      [
        materialName ? materialName.trim() : null,
        categoryId ? parseInt(categoryId, 10) : null,
        unitId ? parseInt(unitId, 10) : null,
        minimumLevel !== undefined ? parseFloat(minimumLevel) : null,
        unitPrice !== undefined ? parseFloat(unitPrice) : null,
        supplierId ? parseInt(supplierId, 10) : null,
        storageLocation || null,
        projectId ? parseInt(projectId, 10) : null,
        invId
      ]
    );

    await logAudit(req.user?.int_User_Id, 'UPDATE_MATERIAL', 'tbl_material_inventory', invId, `Updated material ID ${invId}`);

    return sendSuccess(res, 'Material updated successfully');
  } catch (error) {
    return sendError(res, 'Failed to update material', error.message, 500);
  }
};

const deleteMaterial = async (req, res) => {
  try {
    const invId = req.params.id;
    const [rows] = await pool.query('SELECT * FROM tbl_material_inventory WHERE int_Inventory_Id = ?', [invId]);
    if (rows.length === 0) return sendError(res, 'Material not found', null, 404);

    // Soft delete to preserve foreign key integrity with transactions
    await pool.query('UPDATE tbl_material_inventory SET txt_Status = "INACTIVE" WHERE int_Inventory_Id = ?', [invId]);

    await logAudit(req.user?.int_User_Id, 'DELETE_MATERIAL', 'tbl_material_inventory', invId, `Archived material ID ${invId}`);

    return sendSuccess(res, 'Material archived successfully');
  } catch (error) {
    return sendError(res, 'Failed to delete material', error.message, 500);
  }
};

// ============================================================
// 3. STOCK IN & STOCK OUT TRANSACTIONS
// ============================================================
const recordStockIn = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { 
      inventoryId, 
      quantity, 
      unitCost, 
      supplierId, 
      reference, 
      storageLocation, 
      remarks, 
      transactionType = 'STOCK_IN' // STOCK_IN, PURCHASE, DELIVERY, RETURN, ADJUSTMENT
    } = req.body;

    const qty = parseFloat(quantity);
    if (!inventoryId || !qty || qty <= 0) {
      connection.release();
      return sendError(res, 'Material and a positive quantity are required.');
    }

    const [materials] = await connection.query(
      'SELECT * FROM tbl_material_inventory WHERE int_Inventory_Id = ? AND txt_Status = "ACTIVE" FOR UPDATE',
      [inventoryId]
    );

    if (materials.length === 0) {
      connection.release();
      return sendError(res, 'Material inventory item not found or inactive', null, 404);
    }

    const material = materials[0];
    const newStock = parseFloat(material.num_Current_Stock) + qty;
    const costPerUnit = unitCost !== undefined ? parseFloat(unitCost) : parseFloat(material.num_Unit_Price);
    const totalCost = qty * costPerUnit;

    // 1. Atomically update material stock & unit price
    await connection.query(
      `UPDATE tbl_material_inventory 
       SET num_Current_Stock = ?, 
           num_Unit_Price = COALESCE(?, num_Unit_Price),
           txt_Storage_Location = COALESCE(?, txt_Storage_Location),
           dte_Last_Updated = CURRENT_TIMESTAMP
       WHERE int_Inventory_Id = ?`,
      [newStock, unitCost ? costPerUnit : null, storageLocation || null, inventoryId]
    );

    // 2. Generate and Insert Transaction Record
    const txnCode = await generateBusinessCode('TXN', 'tbl_inventory_transaction', 'txt_Transaction_Code');
    await connection.query(
      `INSERT INTO tbl_inventory_transaction
       (txt_Transaction_Code, int_Inventory_Id, int_Product_Id, int_Project_Id, int_Supplier_Id, num_Quantity, num_Unit_Cost, num_Total_Cost, txt_Transaction_Type, txt_Reference, txt_Storage_Location, txt_Remarks, txt_Created_By)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        txnCode,
        inventoryId,
        material.int_Product_Id || 1,
        material.int_Project_Id || null,
        supplierId ? parseInt(supplierId, 10) : material.int_Supplier_Id,
        qty,
        costPerUnit,
        totalCost,
        transactionType || 'STOCK_IN',
        reference || 'MANUAL-STOCK-IN',
        storageLocation || material.txt_Storage_Location,
        remarks || 'Stock intake recorded',
        req.user?.username || 'AUTHORIZED_USER'
      ]
    );

    await connection.commit();
    connection.release();

    await logAudit(req.user?.int_User_Id, 'STOCK_IN', 'tbl_material_inventory', inventoryId, `Received ${qty} units of ${material.txt_Material_Name}`);

    return sendSuccess(res, 'Stock In recorded successfully', {
      transactionCode: txnCode,
      updatedStock: newStock,
      totalCost
    }, 201);
  } catch (error) {
    await connection.rollback();
    connection.release();
    return sendError(res, 'Failed to record Stock In', error.message, 500);
  }
};

const recordStockOut = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { 
      inventoryId, 
      quantity, 
      projectId, 
      issuedTo, 
      purpose, 
      reference, 
      remarks 
    } = req.body;

    const qty = parseFloat(quantity);
    if (!inventoryId || !qty || qty <= 0) {
      connection.release();
      return sendError(res, 'Material and a positive issue quantity are required.');
    }

    const [materials] = await connection.query(
      'SELECT * FROM tbl_material_inventory WHERE int_Inventory_Id = ? AND txt_Status = "ACTIVE" FOR UPDATE',
      [inventoryId]
    );

    if (materials.length === 0) {
      connection.release();
      return sendError(res, 'Material inventory item not found or inactive', null, 404);
    }

    const material = materials[0];

    // CRITICAL BUSINESS RULE: Prevent stock-out if requested quantity exceeds available stock!
    if (parseFloat(material.num_Current_Stock) < qty) {
      connection.release();
      return sendError(res, `Insufficient stock! Requested: ${qty}, but only ${material.num_Current_Stock} is currently available in inventory.`);
    }

    const newStock = parseFloat(material.num_Current_Stock) - qty;
    const costPerUnit = parseFloat(material.num_Unit_Price);
    const totalCost = qty * costPerUnit;

    // 1. Atomically deduct stock
    await connection.query(
      `UPDATE tbl_material_inventory 
       SET num_Current_Stock = ?, 
           dte_Last_Updated = CURRENT_TIMESTAMP
       WHERE int_Inventory_Id = ?`,
      [newStock, inventoryId]
    );

    // 2. Generate and Insert Transaction Record
    const txnCode = await generateBusinessCode('TXN', 'tbl_inventory_transaction', 'txt_Transaction_Code');
    await connection.query(
      `INSERT INTO tbl_inventory_transaction
       (txt_Transaction_Code, int_Inventory_Id, int_Product_Id, int_Project_Id, int_Supplier_Id, num_Quantity, num_Unit_Cost, num_Total_Cost, txt_Transaction_Type, txt_Reference, txt_Issued_To, txt_Storage_Location, txt_Remarks, txt_Created_By)
       VALUES (?, ?, ?, ?, NULL, ?, ?, ?, 'STOCK_OUT', ?, ?, ?, ?, ?)`,
      [
        txnCode,
        inventoryId,
        material.int_Product_Id || 1,
        projectId ? parseInt(projectId, 10) : null,
        qty,
        costPerUnit,
        totalCost,
        reference || 'MATERIAL-ISSUE',
        issuedTo || 'Site Engineer / Subcontractor',
        material.txt_Storage_Location,
        purpose ? `${purpose} | ${remarks || ''}` : remarks || 'Issued for site execution',
        req.user?.username || 'AUTHORIZED_USER'
      ]
    );

    await connection.commit();
    connection.release();

    await logAudit(req.user?.int_User_Id, 'STOCK_OUT', 'tbl_material_inventory', inventoryId, `Issued ${qty} units of ${material.txt_Material_Name} to ${issuedTo || 'Site'}`);

    return sendSuccess(res, 'Stock Out recorded successfully', {
      transactionCode: txnCode,
      updatedStock: newStock,
      issuedQuantity: qty
    }, 201);
  } catch (error) {
    await connection.rollback();
    connection.release();
    return sendError(res, 'Failed to record Stock Out', error.message, 500);
  }
};

// ============================================================
// 4. PROJECT-WISE MATERIAL ALLOCATION
// ============================================================
const getAllocations = async (req, res) => {
  try {
    const { projectId } = req.query;

    let query = `
      SELECT ma.*, 
             mi.txt_Material_Name, mi.txt_Material_Code, mi.num_Current_Stock as central_available_stock, mi.num_Unit_Price,
             c.txt_Category_Name, 
             u.txt_Unit_Name, u.txt_Abbreviation,
             prj.txt_Project_Name, prj.txt_Project_Code, prj.txt_City as project_city,
             (ma.num_Allocated_Qty - ma.num_Issued_Qty) as num_Remaining_Qty
      FROM tbl_material_allocation ma
      JOIN tbl_material_inventory mi ON ma.int_Inventory_Id = mi.int_Inventory_Id
      JOIN tbl_category c ON mi.int_Category_Id = c.int_Category_Id
      JOIN tbl_unit u ON mi.int_Unit_Id = u.int_Unit_Id
      JOIN tbl_project prj ON ma.int_Project_Id = prj.int_Project_Id
      WHERE ma.txt_Status = 'ACTIVE'
    `;
    const params = [];

    if (projectId) {
      query += ` AND ma.int_Project_Id = ?`;
      params.push(projectId);
    }

    query += ` ORDER BY ma.int_Allocation_Id DESC`;

    const [rows] = await pool.query(query, params);
    return sendSuccess(res, 'Project material allocations retrieved', { allocations: rows });
  } catch (error) {
    return sendError(res, 'Failed to fetch allocations', error.message, 500);
  }
};

const createAllocation = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { inventoryId, projectId, allocatedQuantity, remarks } = req.body;
    const qty = parseFloat(allocatedQuantity);

    if (!inventoryId || !projectId || !qty || qty <= 0) {
      connection.release();
      return sendError(res, 'Material, Project Site, and positive allocation quantity are required.');
    }

    const [materials] = await connection.query(
      'SELECT * FROM tbl_material_inventory WHERE int_Inventory_Id = ? AND txt_Status = "ACTIVE" FOR UPDATE',
      [inventoryId]
    );

    if (materials.length === 0) {
      connection.release();
      return sendError(res, 'Material not found', null, 404);
    }

    const material = materials[0];

    // Validate available central inventory
    if (parseFloat(material.num_Current_Stock) < qty) {
      connection.release();
      return sendError(res, `Cannot allocate ${qty} units. Only ${material.num_Current_Stock} available in inventory.`);
    }

    const allocCode = await generateBusinessCode('ALC', 'tbl_material_allocation', 'txt_Allocation_Code');
    const today = new Date().toISOString().split('T')[0];

    const [resAlloc] = await connection.query(
      `INSERT INTO tbl_material_allocation
       (txt_Allocation_Code, int_Inventory_Id, int_Project_Id, num_Allocated_Qty, num_Issued_Qty, num_Returned_Qty, txt_Status, dte_Allocation_Date, txt_Remarks)
       VALUES (?, ?, ?, ?, 0.00, 0.00, 'ACTIVE', ?, ?)`,
      [allocCode, inventoryId, projectId, qty, today, remarks || 'Material allocation to site project']
    );

    // Record transfer transaction
    const txnCode = await generateBusinessCode('TXN', 'tbl_inventory_transaction', 'txt_Transaction_Code');
    await connection.query(
      `INSERT INTO tbl_inventory_transaction
       (txt_Transaction_Code, int_Inventory_Id, int_Product_Id, int_Project_Id, num_Quantity, num_Unit_Cost, num_Total_Cost, txt_Transaction_Type, txt_Reference, txt_Storage_Location, txt_Remarks, txt_Created_By)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'TRANSFER', ?, ?, ?, ?)`,
      [
        txnCode,
        inventoryId,
        material.int_Product_Id || 1,
        projectId,
        qty,
        material.num_Unit_Price,
        qty * parseFloat(material.num_Unit_Price),
        allocCode,
        material.txt_Storage_Location,
        `Allocated to project ${projectId}: ${remarks || ''}`,
        req.user?.username || 'SYSTEM'
      ]
    );

    await connection.commit();
    connection.release();

    return sendSuccess(res, 'Material allocated to project successfully', { allocationCode: allocCode, allocationId: resAlloc.insertId }, 201);
  } catch (error) {
    await connection.rollback();
    connection.release();
    return sendError(res, 'Failed to allocate material', error.message, 500);
  }
};

const recordAllocationIssue = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { allocationId, issueQuantity, issuedTo, remarks } = req.body;
    const qty = parseFloat(issueQuantity);

    if (!allocationId || !qty || qty <= 0) {
      connection.release();
      return sendError(res, 'Allocation ID and positive issue quantity are required.');
    }

    const [allocs] = await connection.query(
      `SELECT ma.*, mi.int_Inventory_Id, mi.num_Current_Stock, mi.num_Unit_Price, mi.int_Product_Id, mi.txt_Material_Name, prj.txt_Project_Name
       FROM tbl_material_allocation ma
       JOIN tbl_material_inventory mi ON ma.int_Inventory_Id = mi.int_Inventory_Id
       JOIN tbl_project prj ON ma.int_Project_Id = prj.int_Project_Id
       WHERE ma.int_Allocation_Id = ? FOR UPDATE`,
      [allocationId]
    );

    if (allocs.length === 0) {
      connection.release();
      return sendError(res, 'Allocation not found', null, 404);
    }

    const alloc = allocs[0];
    const remainingInAllocation = parseFloat(alloc.num_Allocated_Qty) - parseFloat(alloc.num_Issued_Qty);

    if (qty > remainingInAllocation) {
      connection.release();
      return sendError(res, `Cannot issue ${qty} units. Remaining unissued allocation for this project is ${remainingInAllocation}.`);
    }

    if (parseFloat(alloc.num_Current_Stock) < qty) {
      connection.release();
      return sendError(res, `Cannot issue ${qty} units. Physical stock remaining in inventory is only ${alloc.num_Current_Stock}.`);
    }

    // 1. Update Allocation
    const newIssued = parseFloat(alloc.num_Issued_Qty) + qty;
    await connection.query(
      `UPDATE tbl_material_allocation 
       SET num_Issued_Qty = ?, dte_Updated_Date = CURRENT_TIMESTAMP
       WHERE int_Allocation_Id = ?`,
      [newIssued, allocationId]
    );

    // 2. Deduct physical stock
    const newPhysicalStock = parseFloat(alloc.num_Current_Stock) - qty;
    await connection.query(
      `UPDATE tbl_material_inventory 
       SET num_Current_Stock = ?, dte_Last_Updated = CURRENT_TIMESTAMP 
       WHERE int_Inventory_Id = ?`,
      [newPhysicalStock, alloc.int_Inventory_Id]
    );

    // 3. Log Stock-Out Transaction
    const txnCode = await generateBusinessCode('TXN', 'tbl_inventory_transaction', 'txt_Transaction_Code');
    await connection.query(
      `INSERT INTO tbl_inventory_transaction
       (txt_Transaction_Code, int_Inventory_Id, int_Product_Id, int_Project_Id, num_Quantity, num_Unit_Cost, num_Total_Cost, txt_Transaction_Type, txt_Reference, txt_Issued_To, txt_Remarks, txt_Created_By)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'STOCK_OUT', ?, ?, ?, ?)`,
      [
        txnCode,
        alloc.int_Inventory_Id,
        alloc.int_Product_Id || 1,
        alloc.int_Project_Id,
        qty,
        alloc.num_Unit_Price,
        qty * parseFloat(alloc.num_Unit_Price),
        alloc.txt_Allocation_Code,
        issuedTo || 'Site Team',
        `Site issue for ${alloc.txt_Project_Name}: ${remarks || ''}`,
        req.user?.username || 'SYSTEM'
      ]
    );

    await connection.commit();
    connection.release();

    return sendSuccess(res, 'Site material issued successfully', {
      allocationId,
      issuedQuantity: qty,
      remainingInAllocation: remainingInAllocation - qty
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    return sendError(res, 'Failed to record site material issue', error.message, 500);
  }
};

const recordSiteReturn = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { allocationId, returnQuantity, remarks } = req.body;
    const qty = parseFloat(returnQuantity);

    if (!allocationId || !qty || qty <= 0) {
      connection.release();
      return sendError(res, 'Allocation and positive return quantity are required.');
    }

    const [allocs] = await connection.query(
      `SELECT ma.*, mi.int_Inventory_Id, mi.num_Current_Stock, mi.num_Unit_Price, mi.int_Product_Id, mi.txt_Material_Name
       FROM tbl_material_allocation ma
       JOIN tbl_material_inventory mi ON ma.int_Inventory_Id = mi.int_Inventory_Id
       WHERE ma.int_Allocation_Id = ? FOR UPDATE`,
      [allocationId]
    );

    if (allocs.length === 0) {
      connection.release();
      return sendError(res, 'Allocation not found', null, 404);
    }

    const alloc = allocs[0];

    // 1. Update Allocation
    const newReturned = parseFloat(alloc.num_Returned_Qty) + qty;
    const newAllocated = Math.max(0, parseFloat(alloc.num_Allocated_Qty) - qty);
    await connection.query(
      `UPDATE tbl_material_allocation 
       SET num_Returned_Qty = ?, num_Allocated_Qty = ?, dte_Updated_Date = CURRENT_TIMESTAMP
       WHERE int_Allocation_Id = ?`,
      [newReturned, newAllocated, allocationId]
    );

    // 2. Increment central warehouse stock
    const newCentralStock = parseFloat(alloc.num_Current_Stock) + qty;
    await connection.query(
      `UPDATE tbl_material_inventory 
       SET num_Current_Stock = ?, dte_Last_Updated = CURRENT_TIMESTAMP
       WHERE int_Inventory_Id = ?`,
      [newCentralStock, alloc.int_Inventory_Id]
    );

    // 3. Log Return Transaction
    const txnCode = await generateBusinessCode('TXN', 'tbl_inventory_transaction', 'txt_Transaction_Code');
    await connection.query(
      `INSERT INTO tbl_inventory_transaction
       (txt_Transaction_Code, int_Inventory_Id, int_Product_Id, int_Project_Id, num_Quantity, num_Unit_Cost, num_Total_Cost, txt_Transaction_Type, txt_Reference, txt_Remarks, txt_Created_By)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'RETURN', ?, ?, ?)`,
      [
        txnCode,
        alloc.int_Inventory_Id,
        alloc.int_Product_Id || 1,
        alloc.int_Project_Id,
        qty,
        alloc.num_Unit_Price,
        qty * parseFloat(alloc.num_Unit_Price),
        alloc.txt_Allocation_Code,
        `Site material returned to central warehouse: ${remarks || ''}`,
        req.user?.username || 'SYSTEM'
      ]
    );

    await connection.commit();
    connection.release();

    return sendSuccess(res, 'Materials successfully returned to central inventory', {
      allocationId,
      returnedQuantity: qty,
      updatedCentralStock: newCentralStock
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    return sendError(res, 'Failed to process material return', error.message, 500);
  }
};

// ============================================================
// 5. INVENTORY REPORTS & VALUATION
// ============================================================
const getInventoryReports = async (req, res) => {
  try {
    const builderId = await getBuilderIdFromReq(req);

    // 1. Valuation & Stock Health Report
    const [materials] = await pool.query(
      `SELECT mi.*, c.txt_Category_Name, u.txt_Unit_Name, u.txt_Abbreviation, s.txt_Supplier_Name,
              (mi.num_Current_Stock * mi.num_Unit_Price) as totalValuation,
              CASE 
                WHEN mi.num_Current_Stock <= 0 THEN 'OUT_OF_STOCK'
                WHEN mi.num_Current_Stock <= mi.num_Minimum_Level THEN 'LOW_STOCK'
                ELSE 'HEALTHY'
              END as stockStatus
       FROM tbl_material_inventory mi
       JOIN tbl_category c ON mi.int_Category_Id = c.int_Category_Id
       JOIN tbl_unit u ON mi.int_Unit_Id = u.int_Unit_Id
       LEFT JOIN tbl_supplier s ON mi.int_Supplier_Id = s.int_Supplier_Id
       WHERE mi.int_Builder_Id = ? AND mi.txt_Status = 'ACTIVE'
       ORDER BY totalValuation DESC`,
      [builderId]
    );

    // 2. Project Consumption Report
    const [projectConsumption] = await pool.query(
      `SELECT prj.txt_Project_Name, prj.txt_Project_Code,
              COUNT(DISTINCT it.int_Inventory_Id) as distinctMaterialsUsed,
              COALESCE(SUM(it.num_Total_Cost), 0) as totalConsumedValue
       FROM tbl_project prj
       JOIN tbl_inventory_transaction it ON prj.int_Project_Id = it.int_Project_Id AND it.txt_Transaction_Type = 'STOCK_OUT'
       WHERE prj.int_Builder_Id = ?
       GROUP BY prj.int_Project_Id, prj.txt_Project_Name, prj.txt_Project_Code
       ORDER BY totalConsumedValue DESC`,
      [builderId]
    );

    // 3. Category Valuation
    const [categorySummary] = await pool.query(
      `SELECT c.txt_Category_Name, 
              COUNT(mi.int_Inventory_Id) as materialCount,
              COALESCE(SUM(mi.num_Current_Stock), 0) as totalUnits,
              COALESCE(SUM(mi.num_Current_Stock * mi.num_Unit_Price), 0) as valuation
       FROM tbl_category c
       LEFT JOIN tbl_material_inventory mi ON c.int_Category_Id = mi.int_Category_Id AND mi.int_Builder_Id = ? AND mi.txt_Status = 'ACTIVE'
       GROUP BY c.int_Category_Id, c.txt_Category_Name
       ORDER BY valuation DESC`,
      [builderId]
    );

    return sendSuccess(res, 'Inventory reports generated successfully', {
      materials,
      projectConsumption,
      categorySummary
    });
  } catch (error) {
    return sendError(res, 'Failed to generate inventory reports', error.message, 500);
  }
};

// ============================================================
// 6. PRESERVED LEGACY CONTROLLER HANDLERS
// ============================================================
const getProjectInventory = async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const [rows] = await pool.query(
      `SELECT pi.*, p.txt_Product_Name, p.txt_Product_Code, c.txt_Category_Name, u.txt_Unit_Name, u.txt_Abbreviation
       FROM tbl_project_inventory pi
       JOIN tbl_product p ON pi.int_Product_Id = p.int_Product_Id
       JOIN tbl_category c ON p.int_Category_Id = c.int_Category_Id
       JOIN tbl_unit u ON pi.int_Unit_Id = u.int_Unit_Id
       WHERE pi.int_Project_Id = ?
       ORDER BY pi.int_Project_Inv_Id DESC`,
      [projectId]
    );

    return sendSuccess(res, 'Project inventory retrieved successfully', { inventory: rows });
  } catch (error) {
    return sendError(res, 'Failed to fetch project inventory', error.message, 500);
  }
};

const getSupplierInventory = async (req, res) => {
  try {
    const supplierId = req.user.supplierId;
    const [rows] = await pool.query(
      `SELECT si.*, p.txt_Product_Name, p.txt_Product_Code, c.txt_Category_Name, u.txt_Unit_Name, u.txt_Abbreviation
       FROM tbl_supplier_inventory si
       JOIN tbl_product p ON si.int_Product_Id = p.int_Product_Id
       JOIN tbl_category c ON p.int_Category_Id = c.int_Category_Id
       JOIN tbl_unit u ON si.int_Unit_Id = u.int_Unit_Id
       WHERE si.int_Supplier_Id = ?
       ORDER BY si.int_Supplier_Inv_Id DESC`,
      [supplierId]
    );

    return sendSuccess(res, 'Supplier inventory retrieved successfully', { inventory: rows });
  } catch (error) {
    return sendError(res, 'Failed to fetch supplier inventory', error.message, 500);
  }
};

const getInventoryTransactions = async (req, res) => {
  try {
    const { projectId, supplierId, inventoryId, type } = req.query;

    let query = `
      SELECT it.*, 
             p.txt_Product_Name, 
             prj.txt_Project_Name, 
             s.txt_Supplier_Name,
             mi.txt_Material_Name, mi.txt_Material_Code
      FROM tbl_inventory_transaction it
      LEFT JOIN tbl_material_inventory mi ON it.int_Inventory_Id = mi.int_Inventory_Id
      LEFT JOIN tbl_product p ON it.int_Product_Id = p.int_Product_Id
      LEFT JOIN tbl_project prj ON it.int_Project_Id = prj.int_Project_Id
      LEFT JOIN tbl_supplier s ON it.int_Supplier_Id = s.int_Supplier_Id
      WHERE 1=1
    `;
    const params = [];

    if (projectId) {
      query += ' AND it.int_Project_Id = ?';
      params.push(projectId);
    }
    if (supplierId) {
      query += ' AND it.int_Supplier_Id = ?';
      params.push(supplierId);
    }
    if (inventoryId) {
      query += ' AND it.int_Inventory_Id = ?';
      params.push(inventoryId);
    }
    if (type) {
      query += ' AND it.txt_Transaction_Type = ?';
      params.push(type);
    }

    query += ' ORDER BY it.int_Transaction_Id DESC LIMIT 200';

    const [rows] = await pool.query(query, params);
    return sendSuccess(res, 'Inventory transaction history retrieved successfully', { transactions: rows });
  } catch (error) {
    return sendError(res, 'Failed to fetch inventory transactions', error.message, 500);
  }
};

module.exports = {
  getInventoryDashboard,
  getMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  recordStockIn,
  recordStockOut,
  getAllocations,
  createAllocation,
  recordAllocationIssue,
  recordSiteReturn,
  getInventoryReports,
  getProjectInventory,
  getSupplierInventory,
  getInventoryTransactions
};
