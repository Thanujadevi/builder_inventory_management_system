const app = require('./app');
const { testConnection, pool } = require('./config/db');
const bcrypt = require('bcryptjs');

const PORT = process.env.PORT || 5000;

const ensureAdminUser = async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('Admin@123', salt);

    const [users] = await pool.query('SELECT int_User_Id FROM tbl_user WHERE txt_Username = "admin"');
    if (users.length === 0) {
      const [res] = await pool.query(
        `INSERT INTO tbl_user (txt_User_Code, txt_Username, txt_Email, txt_Password_Hash, txt_Role, txt_Status)
         VALUES ('USR-000001', 'admin', 'admin@builderconnect.com', ?, 'ADMIN', 'ACTIVE')`,
        [hash]
      );
      await pool.query(
        `INSERT INTO tbl_admin (int_User_Id, txt_Admin_Code, txt_Full_Name, txt_Phone, txt_Department)
         VALUES (?, 'ADM-000001', 'Platform Administrator', '+91 9876543210', 'System Administration')`,
        [res.insertId]
      );
      console.log('✅ Admin user auto-created (Username: admin | Password: Admin@123)');
    } else {
      await pool.query(
        'UPDATE tbl_user SET txt_Password_Hash = ?, txt_Status = "ACTIVE" WHERE txt_Username = "admin"',
        [hash]
      );
      console.log('✅ Admin user password hash verified & set to Admin@123');
    }
  } catch (error) {
    console.error('Auto admin seed notice:', error.message);
  }
};

const ensureSchemaUpdates = async () => {
  try {
    await pool.query("ALTER TABLE tbl_material_requirement MODIFY COLUMN txt_Status VARCHAR(50) NOT NULL DEFAULT 'OPEN'");
    await pool.query("UPDATE tbl_material_requirement SET txt_Status = 'QUOTATION_SUBMITTED' WHERE txt_Status = 'QUOTATION_RECEIVED'");

    // 1. Create tbl_material_inventory
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tbl_material_inventory (
        int_Inventory_Id INT AUTO_INCREMENT PRIMARY KEY,
        txt_Material_Code VARCHAR(30) UNIQUE NOT NULL,
        int_Builder_Id INT NOT NULL,
        int_Project_Id INT NULL,
        int_Product_Id INT NULL,
        txt_Material_Name VARCHAR(150) NOT NULL,
        int_Category_Id INT NOT NULL,
        int_Unit_Id INT NOT NULL,
        num_Current_Stock DECIMAL(12,2) NOT NULL DEFAULT 0.00,
        num_Minimum_Level DECIMAL(12,2) NOT NULL DEFAULT 10.00,
        num_Unit_Price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
        int_Supplier_Id INT NULL,
        txt_Storage_Location VARCHAR(100) DEFAULT 'Central Warehouse - Bay A',
        txt_Status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
        dte_Created_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        dte_Last_Updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_mi_builder (int_Builder_Id),
        INDEX idx_mi_project (int_Project_Id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 2. Create tbl_material_allocation
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tbl_material_allocation (
        int_Allocation_Id INT AUTO_INCREMENT PRIMARY KEY,
        txt_Allocation_Code VARCHAR(30) UNIQUE NOT NULL,
        int_Inventory_Id INT NOT NULL,
        int_Project_Id INT NOT NULL,
        num_Allocated_Qty DECIMAL(12,2) NOT NULL DEFAULT 0.00,
        num_Issued_Qty DECIMAL(12,2) NOT NULL DEFAULT 0.00,
        num_Returned_Qty DECIMAL(12,2) NOT NULL DEFAULT 0.00,
        txt_Status VARCHAR(20) DEFAULT 'ACTIVE',
        dte_Allocation_Date DATE NOT NULL,
        txt_Remarks TEXT,
        dte_Created_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        dte_Updated_Date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_ma_inventory (int_Inventory_Id),
        INDEX idx_ma_project (int_Project_Id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 3. Update columns on tbl_inventory_transaction safely
    try { await pool.query("ALTER TABLE tbl_inventory_transaction ADD COLUMN int_Inventory_Id INT NULL AFTER txt_Transaction_Code"); } catch (e) {}
    try { await pool.query("ALTER TABLE tbl_inventory_transaction ADD COLUMN num_Unit_Cost DECIMAL(12,2) DEFAULT 0.00 AFTER num_Quantity"); } catch (e) {}
    try { await pool.query("ALTER TABLE tbl_inventory_transaction ADD COLUMN num_Total_Cost DECIMAL(15,2) DEFAULT 0.00 AFTER num_Unit_Cost"); } catch (e) {}
    try { await pool.query("ALTER TABLE tbl_inventory_transaction ADD COLUMN txt_Issued_To VARCHAR(100) NULL AFTER txt_Reference"); } catch (e) {}
    try { await pool.query("ALTER TABLE tbl_inventory_transaction ADD COLUMN txt_Storage_Location VARCHAR(100) NULL AFTER txt_Issued_To"); } catch (e) {}
    try { await pool.query("ALTER TABLE tbl_inventory_transaction MODIFY COLUMN txt_Transaction_Type VARCHAR(50) NOT NULL"); } catch (e) {}
    try { await pool.query("ALTER TABLE tbl_inventory_transaction MODIFY COLUMN num_Quantity DECIMAL(12,2) NOT NULL"); } catch (e) {}

    // 4. Seed initial construction materials if empty
    const [[invCount]] = await pool.query("SELECT COUNT(*) as cnt FROM tbl_material_inventory");
    if (invCount.cnt === 0) {
      const [builders] = await pool.query("SELECT int_Builder_Id FROM tbl_builder LIMIT 1");
      const bldId = builders.length > 0 ? builders[0].int_Builder_Id : 1;

      const [projects] = await pool.query("SELECT int_Project_Id FROM tbl_project WHERE int_Builder_Id = ? LIMIT 2", [bldId]);
      const p1 = projects[0]?.int_Project_Id || null;
      const p2 = projects[1]?.int_Project_Id || null;

      const initialMaterials = [
        ['MAT-000001', bldId, null, 1, 'UltraTech 53 Grade Ordinary Portland Cement', 1, 1, 850.00, 100.00, 380.00, 1, 'Central Warehouse - Bay A'],
        ['MAT-000002', bldId, null, 3, 'Tata Tiscon Fe500D TMT Rebars 16mm', 2, 2, 28.00, 5.00, 64000.00, 2, 'Central Yard - Steel Depot'],
        ['MAT-000003', bldId, null, 5, 'Standard First-Class Red Kiln Bricks', 3, 3, 18500.00, 2500.00, 12.00, 1, 'Central Yard - Masonry Bay'],
        ['MAT-000004', bldId, null, 7, 'River Plastering M-Sand (Washed)', 4, 9, 140.00, 20.00, 1850.00, 2, 'Central Stockpile - Silo 2'],
        ['MAT-000005', bldId, null, 7, '20mm Blue Metal Coarse Aggregate', 4, 9, 85.00, 15.00, 1250.00, 2, 'Central Stockpile - Silo 1'],
        ['MAT-000006', bldId, null, 8, 'Supreme 110mm Heavy Duty PVC SWR Pipes', 5, 5, 450.00, 60.00, 280.00, 3, 'Central Warehouse - Rack B1'],
        ['MAT-000007', bldId, null, 9, 'Finolex 2.5 sq mm Flame Retardant Copper Wire', 6, 7, 1200.00, 150.00, 35.00, 3, 'Central Warehouse - Rack C2'],
        ['MAT-000008', bldId, p2, 5, 'Ultralite 600x200x150mm AAC Blocks', 3, 3, 20.00, 500.00, 68.00, 1, 'Apex Tech Park Site Yard'],
        ['MAT-000009', bldId, null, 1, 'Asian Paints Apex Weatherproof Exterior White', 7, 6, 0.00, 40.00, 450.00, 1, 'Central Warehouse - Paint Store']
      ];

      for (const m of initialMaterials) {
        await pool.query(
          `INSERT INTO tbl_material_inventory
           (txt_Material_Code, int_Builder_Id, int_Project_Id, int_Product_Id, txt_Material_Name, int_Category_Id, int_Unit_Id, num_Current_Stock, num_Minimum_Level, num_Unit_Price, int_Supplier_Id, txt_Storage_Location)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          m
        );
      }

      // Seed initial transactions
      await pool.query(`
        INSERT INTO tbl_inventory_transaction 
        (txt_Transaction_Code, int_Inventory_Id, int_Product_Id, int_Project_Id, int_Supplier_Id, num_Quantity, num_Unit_Cost, num_Total_Cost, txt_Transaction_Type, txt_Reference, txt_Issued_To, txt_Storage_Location, txt_Remarks)
        VALUES 
        ('TXN-000001', 1, 1, NULL, 1, 1000.00, 380.00, 380000.00, 'STOCK_IN', 'PO-000001', NULL, 'Central Warehouse - Bay A', 'Initial purchase delivery from UltraBuild Materials'),
        ('TXN-000002', 1, 1, ${p1 || 'NULL'}, NULL, 150.00, 380.00, 57000.00, 'STOCK_OUT', 'REQ-000001', 'Er. Rajesh Sharma', 'Apex Horizon Site', 'Issued for Tower A Foundation Raft Casting'),
        ('TXN-000003', 2, 3, NULL, 2, 35.00, 64000.00, 2240000.00, 'STOCK_IN', 'PO-000002', NULL, 'Central Yard - Steel Depot', 'Bulk consignment received from InfraTech Steel'),
        ('TXN-000004', 2, 3, ${p1 || 'NULL'}, NULL, 7.00, 64000.00, 448000.00, 'STOCK_OUT', 'REQ-000001', 'Subcontractor - Steel Works', 'Apex Horizon Site', 'Issued for Foundation Pile Cap Fabrication')
      `);

      // Seed initial project allocation
      if (p1) {
        await pool.query(`
          INSERT INTO tbl_material_allocation
          (txt_Allocation_Code, int_Inventory_Id, int_Project_Id, num_Allocated_Qty, num_Issued_Qty, num_Returned_Qty, txt_Status, dte_Allocation_Date, txt_Remarks)
          VALUES
          ('ALC-000001', 1, ${p1}, 300.00, 150.00, 0.00, 'ACTIVE', '2026-10-01', 'Foundation cement batch allocation'),
          ('ALC-000002', 2, ${p1}, 15.00, 7.00, 0.00, 'ACTIVE', '2026-10-02', 'Basement rebars allocation')
        `);
      }

      console.log('✅ Seeded initial construction material inventory & audit movements.');
    }

    console.log('✅ Synchronized inventory database tables & statuses.');
  } catch (err) {
    console.error('Schema sync notice:', err.message);
  }
};

const startServer = async () => {
  const connected = await testConnection();
  if (connected) {
    await ensureAdminUser();
    await ensureSchemaUpdates();
  }
  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(`🚀 BuilderConnect API Server running on port ${PORT}`);
    console.log(`🌐 Base URL: http://localhost:${PORT}`);
    console.log(`==================================================`);
  });
};

startServer();
