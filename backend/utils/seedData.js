const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

async function seedDatabase() {
  const connection = await pool.getConnection();
  try {
    console.log('🚀 Starting database seeding...');
    await connection.beginTransaction();

    // Disable Foreign Key checks for clean wipe
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    // Truncate existing operational tables
    const tablesToTruncate = [
      'tbl_audit_log',
      'tbl_notification',
      'tbl_supplier_review',
      'tbl_inventory_transaction',
      'tbl_project_inventory',
      'tbl_supplier_inventory',
      'tbl_payment',
      'tbl_purchase_order_item',
      'tbl_purchase_order',
      'tbl_quotation_item',
      'tbl_quotation',
      'tbl_requirement_item',
      'tbl_material_requirement',
      'tbl_project',
      'tbl_supplier_product',
      'tbl_product',
      'tbl_supplier_document',
      'tbl_supplier_kyc',
      'tbl_supplier',
      'tbl_builder',
      'tbl_admin',
      'tbl_user'
    ];

    for (const tbl of tablesToTruncate) {
      await connection.query(`TRUNCATE TABLE ${tbl}`);
    }

    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('🧹 Cleaned existing user & transaction data.');

    // Common Hashed Password for seed users
    const defaultPasswordHash = await bcrypt.hash('Password@123', 10);
    const adminPasswordHash = await bcrypt.hash('Admin@123', 10);

    // ==========================================
    // 1. SEED USERS & PROFILES
    // ==========================================

    // Admin
    const [adminUserRes] = await connection.query(
      `INSERT INTO tbl_user (txt_User_Code, txt_Username, txt_Email, txt_Password_Hash, txt_Role, txt_Status)
       VALUES ('USR-000001', 'admin', 'admin@builderconnect.com', ?, 'ADMIN', 'ACTIVE')`,
      [adminPasswordHash]
    );
    await connection.query(
      `INSERT INTO tbl_admin (int_User_Id, txt_Admin_Code, txt_Full_Name, txt_Phone, txt_Department)
       VALUES (?, 'ADM-000001', 'Platform Administrator', '+91 9876543210', 'System Operations')`,
      [adminUserRes.insertId]
    );

    // Builders (2 Builders)
    const [bld1UserRes] = await connection.query(
      `INSERT INTO tbl_user (txt_User_Code, txt_Username, txt_Email, txt_Password_Hash, txt_Role, txt_Status)
       VALUES ('USR-000002', 'builder_apex', 'apex.constructions@example.com', ?, 'BUILDER', 'ACTIVE')`,
      [defaultPasswordHash]
    );
    const [bld1ProfileRes] = await connection.query(
      `INSERT INTO tbl_builder (int_User_Id, txt_Builder_Code, txt_Company_Name, txt_Contact_Person, txt_Phone, txt_Address, txt_City, txt_State, txt_Pincode, txt_GSTIN, txt_Status)
       VALUES (?, 'BLD-000001', 'Apex Infrastructure & Developers Ltd', 'Rajesh Sharma', '+91 9820011223', 'Plot 45, BKC Commercial Complex', 'Mumbai', 'Maharashtra', '400051', '27AAACA12341Z5', 'ACTIVE')`,
      [bld1UserRes.insertId]
    );
    const bld1Id = bld1ProfileRes.insertId;

    const [bld2UserRes] = await connection.query(
      `INSERT INTO tbl_user (txt_User_Code, txt_Username, txt_Email, txt_Password_Hash, txt_Role, txt_Status)
       VALUES ('USR-000003', 'builder_blueprints', 'contact@blueprints.in', ?, 'BUILDER', 'ACTIVE')`,
      [defaultPasswordHash]
    );
    const [bld2ProfileRes] = await connection.query(
      `INSERT INTO tbl_builder (int_User_Id, txt_Builder_Code, txt_Company_Name, txt_Contact_Person, txt_Phone, txt_Address, txt_City, txt_State, txt_Pincode, txt_GSTIN, txt_Status)
       VALUES (?, 'BLD-000002', 'BluePrint Builders & Contractors', 'Vikram Verma', '+91 9845099887', 'Suite 102, Indiranagar Double Road', 'Bengaluru', 'Karnataka', '560038', '29BBBDB56782Z9', 'ACTIVE')`,
      [bld2UserRes.insertId]
    );
    const bld2Id = bld2ProfileRes.insertId;

    // Suppliers (3 Approved Suppliers)
    // Supplier 1: UltraBuild Materials
    const [sup1UserRes] = await connection.query(
      `INSERT INTO tbl_user (txt_User_Code, txt_Username, txt_Email, txt_Password_Hash, txt_Role, txt_Status)
       VALUES ('USR-000004', 'supplier_ultra', 'sales@ultrabuildmaterials.com', ?, 'SUPPLIER', 'ACTIVE')`,
      [defaultPasswordHash]
    );
    const [sup1ProfileRes] = await connection.query(
      `INSERT INTO tbl_supplier (int_User_Id, txt_Supplier_Code, txt_Supplier_Name, txt_Contact_Person, txt_Phone, txt_GSTIN, txt_Address, txt_City, txt_State, txt_Pincode, num_Delivery_Radius_KM, txt_Approval_Status, txt_Status)
       VALUES (?, 'SUP-000001', 'UltraBuild Materials & Hardware', 'Anil Agarwal', '+91 9711002233', '27CCCUL99881Z1', 'Warehouse 12, MIDC Industrial Area, Thane', 'Mumbai', 'Maharashtra', '400604', 75.00, 'APPROVED', 'ACTIVE')`,
      [sup1UserRes.insertId]
    );
    const sup1Id = sup1ProfileRes.insertId;

    await connection.query(
      `INSERT INTO tbl_supplier_kyc (int_Supplier_Id, txt_Business_Reg_No, txt_PAN, txt_GST_Status, txt_KYC_Status, txt_Remarks)
       VALUES (?, 'REG-MH-2018-9988', 'AAACU1234K', 'VERIFIED', 'APPROVED', 'Verified business documents & GST active.')`,
      [sup1Id]
    );

    // Supplier 2: InfraTech Steel & Cement
    const [sup2UserRes] = await connection.query(
      `INSERT INTO tbl_user (txt_User_Code, txt_Username, txt_Email, txt_Password_Hash, txt_Role, txt_Status)
       VALUES ('USR-000005', 'supplier_infra', 'info@infratechsteel.com', ?, 'SUPPLIER', 'ACTIVE')`,
      [defaultPasswordHash]
    );
    const [sup2ProfileRes] = await connection.query(
      `INSERT INTO tbl_supplier (int_User_Id, txt_Supplier_Code, txt_Supplier_Name, txt_Contact_Person, txt_Phone, txt_GSTIN, txt_Address, txt_City, txt_State, txt_Pincode, num_Delivery_Radius_KM, txt_Approval_Status, txt_Status)
       VALUES (?, 'SUP-000002', 'InfraTech Steel & Cement Traders', 'Suresh Patel', '+91 9900112244', '27DDDIN55443Z2', 'Gat 104, Chakan Industrial Phase 2', 'Pune', 'Maharashtra', '410501', 100.00, 'APPROVED', 'ACTIVE')`,
      [sup2UserRes.insertId]
    );
    const sup2Id = sup2ProfileRes.insertId;

    await connection.query(
      `INSERT INTO tbl_supplier_kyc (int_Supplier_Id, txt_Business_Reg_No, txt_PAN, txt_GST_Status, txt_KYC_Status, txt_Remarks)
       VALUES (?, 'REG-MH-2020-4411', 'BBBD15678L', 'VERIFIED', 'APPROVED', 'Verified distributor certificate.')`,
      [sup2Id]
    );

    // Supplier 3: Apex Pipes & Sanitary
    const [sup3UserRes] = await connection.query(
      `INSERT INTO tbl_user (txt_User_Code, txt_Username, txt_Email, txt_Password_Hash, txt_Role, txt_Status)
       VALUES ('USR-000006', 'supplier_apex', 'orders@apexplumbing.com', ?, 'SUPPLIER', 'ACTIVE')`,
      [defaultPasswordHash]
    );
    const [sup3ProfileRes] = await connection.query(
      `INSERT INTO tbl_supplier (int_User_Id, txt_Supplier_Code, txt_Supplier_Name, txt_Contact_Person, txt_Phone, txt_GSTIN, txt_Address, txt_City, txt_State, txt_Pincode, num_Delivery_Radius_KM, txt_Approval_Status, txt_Status)
       VALUES (?, 'SUP-000003', 'Apex Pipes & Building Solutions', 'Dinesh Kumar', '+91 9880112255', '29EEEAP77665Z3', 'Plot 88, Peenya Industrial Estate 3rd Stage', 'Bengaluru', 'Karnataka', '560058', 60.00, 'APPROVED', 'ACTIVE')`,
      [sup3UserRes.insertId]
    );
    const sup3Id = sup3ProfileRes.insertId;

    await connection.query(
      `INSERT INTO tbl_supplier_kyc (int_Supplier_Id, txt_Business_Reg_No, txt_PAN, txt_GST_Status, txt_KYC_Status, txt_Remarks)
       VALUES (?, 'REG-KA-2019-3322', 'CCCE9876M', 'VERIFIED', 'APPROVED', 'Verified wholesaler license.')`,
      [sup3Id]
    );

    console.log('✅ Users, Builders, and Suppliers seeded.');

    // ==========================================
    // 2. MASTER PRODUCTS
    // ==========================================
    // Get Unit and Category IDs
    const [catRows] = await connection.query('SELECT int_Category_Id, txt_Category_Name FROM tbl_category');
    const [unitRows] = await connection.query('SELECT int_Unit_Id, txt_Unit_Code FROM tbl_unit');

    const catMap = {};
    catRows.forEach(c => { catMap[c.txt_Category_Name] = c.int_Category_Id; });

    const unitMap = {};
    unitRows.forEach(u => { unitMap[u.txt_Unit_Code] = u.int_Unit_Id; });

    const productsData = [
      { code: 'PRD-000001', cat: 'Cement', name: 'UltraTech OPC 53 Grade Cement', desc: 'High strength Ordinary Portland Cement 50kg bag', spec: 'IS 12269 Compliant, 53 Grade', unit: 'UNT-001' },
      { code: 'PRD-000002', cat: 'Cement', name: 'Ambuja PPC Cement', desc: 'Portland Pozzolana Cement for heavy foundation & slab', spec: 'IS 1489 Part 1', unit: 'UNT-001' },
      { code: 'PRD-000003', cat: 'Steel / TMT', name: 'Tata Tiscon Fe500D TMT Rebars', desc: 'High ductility earthquake-resistant steel rebars', spec: 'IS 1786 Fe500D Grade, 12mm & 16mm', unit: 'UNT-002' },
      { code: 'PRD-000004', cat: 'Steel / TMT', name: 'JSW Neosteel Fe550D TMT Steel', desc: 'Premium grade high tensile structural TMT bars', spec: 'IS 1786 Fe550D, High Corrosion Resistance', unit: 'UNT-002' },
      { code: 'PRD-000005', cat: 'Bricks & Blocks', name: 'Autoclaved Aerated Concrete (AAC) Blocks', desc: 'Lightweight thermal insulation AAC masonry blocks', spec: '600mm x 200mm x 150mm', unit: 'UNT-003' },
      { code: 'PRD-000006', cat: 'Sand & Aggregates', name: 'Manufactured Sand (M-Sand) Fine Grade', desc: 'Washed engineered M-Sand for concrete mix', spec: 'Zone II Gradation IS 383', unit: 'UNT-009' },
      { code: 'PRD-000007', cat: 'Sand & Aggregates', name: '20mm Crushed Metal Aggregate', desc: 'Angular hard blue metal aggregate for RCC slab', spec: '20mm Nominal Size IS 383', unit: 'UNT-009' },
      { code: 'PRD-000008', cat: 'Pipes', name: 'Supreme 110mm Heavy Duty PVC Drainage Pipe', desc: 'SWR rigid PVC pipe 6 meter length', spec: 'IS 4985 Class 3 (6 kgf/cm²)', unit: 'UNT-005' },
      { code: 'PRD-000009', cat: 'Electrical', name: 'Finolex 2.5 sq mm Flame Retardant Copper Wire', desc: 'FR PVC insulated single core copper wire 90m box', spec: '1100V Grade IS 694', unit: 'UNT-007' },
      { code: 'PRD-000010', cat: 'Tiles', name: 'Kajaria 600x600mm Vitrified Floor Tiles', desc: 'Nano polished double charged vitrified tiles', spec: '600mm x 600mm x 9mm thickness', unit: 'UNT-004' }
    ];

    const prodIdMap = {};

    for (const p of productsData) {
      const catId = catMap[p.cat] || 1;
      const unitId = unitMap[p.unit] || 1;

      const [pRes] = await connection.query(
        `INSERT INTO tbl_product (txt_Product_Code, int_Category_Id, txt_Product_Name, txt_Description, txt_Default_Spec, int_Default_Unit_Id, txt_Status)
         VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')`,
        [p.code, catId, p.name, p.desc, p.spec, unitId]
      );
      prodIdMap[p.code] = pRes.insertId;
    }

    console.log('✅ Master products seeded.');

    // ==========================================
    // 3. SUPPLIER CATALOGUE & INVENTORIES
    // ==========================================
    const supplierProducts = [
      // Supplier 1 (UltraBuild Materials - Mumbai)
      { supId: sup1Id, code: 'SP-000001', prodCode: 'PRD-000001', customName: 'UltraTech Cement 50kg Bag', brand: 'UltraTech', price: 365.00, bulkPrice: 350.00, bulkThresh: 500, moq: 50, stock: 2500, unit: 'UNT-001' },
      { supId: sup1Id, code: 'SP-000002', prodCode: 'PRD-000003', customName: 'Tata Tiscon TMT Rebars 12mm/16mm', brand: 'Tata Steel', price: 62000.00, bulkPrice: 60500.00, bulkThresh: 10, moq: 2, stock: 120, unit: 'UNT-002' },
      { supId: sup1Id, code: 'SP-000003', prodCode: 'PRD-000005', customName: 'Ultralite AAC Blocks 600x200x150', brand: 'Ultralite', price: 65.00, bulkPrice: 60.00, bulkThresh: 1000, moq: 200, stock: 15000, unit: 'UNT-003' },
      { supId: sup1Id, code: 'SP-000004', prodCode: 'PRD-000006', customName: 'Clean Washed M-Sand', brand: 'RiverWash Gold', price: 42.00, bulkPrice: 38.00, bulkThresh: 1000, moq: 100, stock: 8000, unit: 'UNT-009' },

      // Supplier 2 (InfraTech Steel - Pune)
      { supId: sup2Id, code: 'SP-000005', prodCode: 'PRD-000001', customName: 'UltraTech OPC 53 Grade Cement Bulk', brand: 'UltraTech', price: 360.00, bulkPrice: 345.00, bulkThresh: 400, moq: 100, stock: 4000, unit: 'UNT-001' },
      { supId: sup2Id, code: 'SP-000006', prodCode: 'PRD-000003', customName: 'Tata Tiscon Fe500D TMT Bars', brand: 'Tata Tiscon', price: 61500.00, bulkPrice: 59800.00, bulkThresh: 5, moq: 1, stock: 200, unit: 'UNT-002' },
      { supId: sup2Id, code: 'SP-000007', prodCode: 'PRD-000004', customName: 'JSW Neosteel Fe550D TMT', brand: 'JSW Steel', price: 63500.00, bulkPrice: 62000.00, bulkThresh: 10, moq: 2, stock: 150, unit: 'UNT-002' },
      { supId: sup2Id, code: 'SP-000008', prodCode: 'PRD-000007', customName: 'Hard Blue Metal Aggregate 20mm', brand: 'InfraQuarry', price: 38.00, bulkPrice: 35.00, bulkThresh: 2000, moq: 200, stock: 12000, unit: 'UNT-009' },

      // Supplier 3 (Apex Pipes - Bengaluru)
      { supId: sup3Id, code: 'SP-000009', prodCode: 'PRD-000008', customName: 'Supreme SWR Drainage PVC Pipe 110mm', brand: 'Supreme', price: 780.00, bulkPrice: 720.00, bulkThresh: 50, moq: 5, stock: 600, unit: 'UNT-005' },
      { supId: sup3Id, code: 'SP-000010', prodCode: 'PRD-000009', customName: 'Finolex 2.5 sq mm Copper Wires Red/Black', brand: 'Finolex', price: 2150.00, bulkPrice: 1980.00, bulkThresh: 20, moq: 2, stock: 350, unit: 'UNT-007' },
      { supId: sup3Id, code: 'SP-000011', prodCode: 'PRD-000010', customName: 'Kajaria Double Charged Vitrified Tiles 600x600', brand: 'Kajaria', price: 58.00, bulkPrice: 52.00, bulkThresh: 2000, moq: 100, stock: 25000, unit: 'UNT-004' }
    ];

    for (const sp of supplierProducts) {
      const prodId = prodIdMap[sp.prodCode];
      const uId = unitMap[sp.unit] || 1;

      await connection.query(
        `INSERT INTO tbl_supplier_product 
         (txt_Supplier_Product_Code, int_Supplier_Id, int_Product_Id, txt_Custom_Product_Name, txt_Brand, txt_Specification, int_Unit_Id, num_Base_Price, num_Bulk_Price, num_Bulk_Threshold, num_MOQ, num_Current_Stock, num_Minimum_Stock, num_Delivery_Radius_KM, txt_Availability_Status, txt_Status)
         VALUES (?, ?, ?, ?, ?, 'Standard OEM grade specification', ?, ?, ?, ?, ?, ?, 20, 75.00, 'IN_STOCK', 'ACTIVE')`,
        [sp.code, sp.supId, prodId, sp.customName, sp.brand, uId, sp.price, sp.bulkPrice, sp.bulkThresh, sp.moq, sp.stock]
      );

      await connection.query(
        `INSERT INTO tbl_supplier_inventory 
         (int_Supplier_Id, int_Product_Id, num_Current_Stock, num_Minimum_Stock, int_Unit_Id, txt_Availability_Status)
         VALUES (?, ?, ?, 20, ?, 'IN_STOCK')
         ON DUPLICATE KEY UPDATE num_Current_Stock = VALUES(num_Current_Stock)`,
        [sp.supId, prodId, sp.stock, uId]
      );
    }

    console.log('✅ Supplier product catalogue & stock inventories seeded.');

    // ==========================================
    // 4. BUILDER PROJECTS
    // ==========================================
    const [proj1Res] = await connection.query(
      `INSERT INTO tbl_project 
       (txt_Project_Code, int_Builder_Id, txt_Project_Name, txt_Project_Type, txt_Description, txt_Address, txt_City, txt_State, txt_Pincode, num_Estimated_Budget, num_Procurement_Budget, dte_Start_Date, dte_Expected_Completion_Date, txt_Status)
       VALUES ('PRJ-000001', ?, 'Apex Horizon Luxury Towers', 'Residential High-Rise', '3 Towers of 24 Storeys Premium 3BHK Apartments', 'Plot 12, Off Eastern Express Highway, Chembur', 'Mumbai', 'Maharashtra', '400071', 45000000.00, 18000000.00, '2026-01-15', '2028-06-30', 'ACTIVE')`,
      [bld1Id]
    );
    const proj1Id = proj1Res.insertId;

    const [proj2Res] = await connection.query(
      `INSERT INTO tbl_project 
       (txt_Project_Code, int_Builder_Id, txt_Project_Name, txt_Project_Type, txt_Description, txt_Address, txt_City, txt_State, txt_Pincode, num_Estimated_Budget, num_Procurement_Budget, dte_Start_Date, dte_Expected_Completion_Date, txt_Status)
       VALUES ('PRJ-000002', ?, 'Apex Tech Park Phase 1', 'Commercial Office', 'IT Park Complex with 4 lakh sq.ft office space', 'Sector 5, Hinjewadi Phase 3', 'Pune', 'Maharashtra', '411057', 85000000.00, 32000000.00, '2026-03-01', '2028-12-31', 'ACTIVE')`,
      [bld1Id]
    );
    const proj2Id = proj2Res.insertId;

    const [proj3Res] = await connection.query(
      `INSERT INTO tbl_project 
       (txt_Project_Code, int_Builder_Id, txt_Project_Name, txt_Project_Type, txt_Description, txt_Address, txt_City, txt_State, txt_Pincode, num_Estimated_Budget, num_Procurement_Budget, dte_Start_Date, dte_Expected_Completion_Date, txt_Status)
       VALUES ('PRJ-000003', ?, 'Green Valley Gated Enclave', 'Villa Project', '50 Luxury eco-friendly smart villas', 'Near Sarjapur Main Road', 'Bengaluru', 'Karnataka', '560035', 30000000.00, 12000000.00, '2026-02-10', '2027-11-30', 'ACTIVE')`,
      [bld2Id]
    );
    const proj3Id = proj3Res.insertId;

    console.log('✅ Builder projects seeded.');

    // ==========================================
    // 5. RFQs / MATERIAL REQUIREMENTS & QUOTATIONS
    // ==========================================

    // RFQ 1 (Closed with Accepted Quote & PO)
    const [rfq1Res] = await connection.query(
      `INSERT INTO tbl_material_requirement 
       (txt_Requirement_Code, int_Project_Id, int_Builder_Id, txt_Requirement_Title, txt_Delivery_Location, txt_City, txt_Pincode, dte_Required_Delivery_Date, txt_Priority, txt_Status)
       VALUES ('REQ-000001', ?, ?, 'Slab Casting Foundation Cement & Steel Requirement', 'Apex Horizon Site, Chembur East', 'Mumbai', '400071', '2026-10-25', 'HIGH', 'CLOSED')`,
      [proj1Id, bld1Id]
    );
    const rfq1Id = rfq1Res.insertId;

    // Requirement Items for RFQ 1
    const [reqItem1] = await connection.query(
      `INSERT INTO tbl_requirement_item 
       (int_Requirement_Id, int_Product_Id, int_Category_Id, num_Quantity, int_Unit_Id, txt_Required_Spec, txt_Preferred_Brand, num_Max_Acceptable_Price)
       VALUES (?, ?, ?, 800, ?, 'OPC 53 Grade Fresh Batch', 'UltraTech', 380.00)`,
      [rfq1Id, prodIdMap['PRD-000001'], catMap['Cement'], unitMap['UNT-001']]
    );

    const [reqItem2] = await connection.query(
      `INSERT INTO tbl_requirement_item 
       (int_Requirement_Id, int_Product_Id, int_Category_Id, num_Quantity, int_Unit_Id, txt_Required_Spec, txt_Preferred_Brand, num_Max_Acceptable_Price)
       VALUES (?, ?, ?, 15, ?, 'Fe500D TMT Rebars 16mm', 'Tata Tiscon', 65000.00)`,
      [rfq1Id, prodIdMap['PRD-000003'], catMap['Steel / TMT'], unitMap['UNT-002']]
    );

    // Quote 1 for RFQ 1 from UltraBuild (ACCEPTED)
    const totalQuote1Amt = (800 * 350.00) + (15 * 60500.00); // 280,000 + 907,500 = 1,187,500
    const [quo1Res] = await connection.query(
      `INSERT INTO tbl_quotation 
       (txt_Quotation_Code, int_Requirement_Id, int_Supplier_Id, num_Total_Amount, num_Delivery_Days, txt_Payment_Terms, dte_Valid_Until, num_Coverage_Percent, txt_Status)
       VALUES ('QUO-000001', ?, ?, ?, 3, '30 Days Net Bank Transfer', '2026-11-15', 100.00, 'ACCEPTED')`,
      [rfq1Id, sup1Id, totalQuote1Amt]
    );
    const quo1Id = quo1Res.insertId;

    await connection.query(
      `INSERT INTO tbl_quotation_item 
       (int_Quotation_Id, int_Req_Item_Id, int_Product_Id, num_Quantity, int_Unit_Id, num_Unit_Price, num_Discount, num_Tax, num_Total_Price, num_Delivery_Estimate_Days)
       VALUES (?, ?, ?, 800, ?, 350.00, 0.00, 0.00, 280000.00, 3)`,
      [quo1Id, reqItem1.insertId, prodIdMap['PRD-000001'], unitMap['UNT-001']]
    );
    await connection.query(
      `INSERT INTO tbl_quotation_item 
       (int_Quotation_Id, int_Req_Item_Id, int_Product_Id, num_Quantity, int_Unit_Id, num_Unit_Price, num_Discount, num_Tax, num_Total_Price, num_Delivery_Estimate_Days)
       VALUES (?, ?, ?, 15, ?, 60500.00, 0.00, 0.00, 907500.00, 3)`,
      [quo1Id, reqItem2.insertId, prodIdMap['PRD-000003'], unitMap['UNT-002']]
    );

    // Quote 2 for RFQ 1 from InfraTech (REJECTED)
    const totalQuote2Amt = (800 * 360.00) + (15 * 61500.00); // 288,000 + 922,500 = 1,210,500
    const [quo2Res] = await connection.query(
      `INSERT INTO tbl_quotation 
       (txt_Quotation_Code, int_Requirement_Id, int_Supplier_Id, num_Total_Amount, num_Delivery_Days, txt_Payment_Terms, dte_Valid_Until, num_Coverage_Percent, txt_Status)
       VALUES ('QUO-000002', ?, ?, ?, 5, '15 Days Net', '2026-11-15', 100.00, 'REJECTED')`,
      [rfq1Id, sup2Id, totalQuote2Amt]
    );
    const quo2Id = quo2Res.insertId;

    await connection.query(
      `INSERT INTO tbl_quotation_item 
       (int_Quotation_Id, int_Req_Item_Id, int_Product_Id, num_Quantity, int_Unit_Id, num_Unit_Price, num_Discount, num_Tax, num_Total_Price, num_Delivery_Estimate_Days)
       VALUES (?, ?, ?, 800, ?, 360.00, 0.00, 0.00, 288000.00, 5)`,
      [quo2Id, reqItem1.insertId, prodIdMap['PRD-000001'], unitMap['UNT-001']]
    );
    await connection.query(
      `INSERT INTO tbl_quotation_item 
       (int_Quotation_Id, int_Req_Item_Id, int_Product_Id, num_Quantity, int_Unit_Id, num_Unit_Price, num_Discount, num_Tax, num_Total_Price, num_Delivery_Estimate_Days)
       VALUES (?, ?, ?, 15, ?, 61500.00, 0.00, 0.00, 922500.00, 5)`,
      [quo2Id, reqItem2.insertId, prodIdMap['PRD-000003'], unitMap['UNT-002']]
    );

    // RFQ 2 (Active OPEN with 2 Quotations Received ready for Builder evaluation)
    const [rfq2Res] = await connection.query(
      `INSERT INTO tbl_material_requirement 
       (txt_Requirement_Code, int_Project_Id, int_Builder_Id, txt_Requirement_Title, txt_Delivery_Location, txt_City, txt_Pincode, dte_Required_Delivery_Date, txt_Priority, txt_Status)
       VALUES ('REQ-000002', ?, ?, 'AAC Block & Aggregate Supply for Wall Masonry', 'Apex Tech Park Site, Hinjewadi', 'Pune', '411057', '2026-11-05', 'MEDIUM', 'QUOTATION_SUBMITTED')`,
      [proj2Id, bld1Id]
    );
    const rfq2Id = rfq2Res.insertId;

    const [reqItem3] = await connection.query(
      `INSERT INTO tbl_requirement_item 
       (int_Requirement_Id, int_Product_Id, int_Category_Id, num_Quantity, int_Unit_Id, txt_Required_Spec, txt_Preferred_Brand, num_Max_Acceptable_Price)
       VALUES (?, ?, ?, 3000, ?, '600x200x150mm First Class AAC Blocks', 'Ultralite', 70.00)`,
      [rfq2Id, prodIdMap['PRD-000005'], catMap['Bricks & Blocks'], unitMap['UNT-003']]
    );

    const [reqItem4] = await connection.query(
      `INSERT INTO tbl_requirement_item 
       (int_Requirement_Id, int_Product_Id, int_Category_Id, num_Quantity, int_Unit_Id, txt_Required_Spec, txt_Preferred_Brand, num_Max_Acceptable_Price)
       VALUES (?, ?, ?, 2500, ?, '20mm Aggregate Blue Metal', 'Any Standard', 40.00)`,
      [rfq2Id, prodIdMap['PRD-000007'], catMap['Sand & Aggregates'], unitMap['UNT-009']]
    );

    // UltraBuild Quote for RFQ 2 (SUBMITTED)
    const q3Total = (3000 * 62.00) + (2500 * 37.00); // 186,000 + 92,500 = 278,500
    const [quo3Res] = await connection.query(
      `INSERT INTO tbl_quotation 
       (txt_Quotation_Code, int_Requirement_Id, int_Supplier_Id, num_Total_Amount, num_Delivery_Days, txt_Payment_Terms, dte_Valid_Until, num_Coverage_Percent, txt_Status)
       VALUES ('QUO-000003', ?, ?, ?, 4, '30 Days Net', '2026-11-30', 100.00, 'SUBMITTED')`,
      [rfq2Id, sup1Id, q3Total]
    );
    await connection.query(
      `INSERT INTO tbl_quotation_item 
       (int_Quotation_Id, int_Req_Item_Id, int_Product_Id, num_Quantity, int_Unit_Id, num_Unit_Price, num_Total_Price)
       VALUES (?, ?, ?, 3000, ?, 62.00, 186000.00)`,
      [quo3Res.insertId, reqItem3.insertId, prodIdMap['PRD-000005'], unitMap['UNT-003']]
    );
    await connection.query(
      `INSERT INTO tbl_quotation_item 
       (int_Quotation_Id, int_Req_Item_Id, int_Product_Id, num_Quantity, int_Unit_Id, num_Unit_Price, num_Total_Price)
       VALUES (?, ?, ?, 2500, ?, 37.00, 92500.00)`,
      [quo3Res.insertId, reqItem4.insertId, prodIdMap['PRD-000007'], unitMap['UNT-009']]
    );

    // InfraTech Quote for RFQ 2 (SUBMITTED)
    const q4Total = (3000 * 60.00) + (2500 * 35.00); // 180,000 + 87,500 = 267,500
    const [quo4Res] = await connection.query(
      `INSERT INTO tbl_quotation 
       (txt_Quotation_Code, int_Requirement_Id, int_Supplier_Id, num_Total_Amount, num_Delivery_Days, txt_Payment_Terms, dte_Valid_Until, num_Coverage_Percent, txt_Status)
       VALUES ('QUO-000004', ?, ?, ?, 2, 'Direct Bank Transfer', '2026-11-30', 100.00, 'SUBMITTED')`,
      [rfq2Id, sup2Id, q4Total]
    );
    await connection.query(
      `INSERT INTO tbl_quotation_item 
       (int_Quotation_Id, int_Req_Item_Id, int_Product_Id, num_Quantity, int_Unit_Id, num_Unit_Price, num_Total_Price)
       VALUES (?, ?, ?, 3000, ?, 60.00, 180000.00)`,
      [quo4Res.insertId, reqItem3.insertId, prodIdMap['PRD-000005'], unitMap['UNT-003']]
    );
    await connection.query(
      `INSERT INTO tbl_quotation_item 
       (int_Quotation_Id, int_Req_Item_Id, int_Product_Id, num_Quantity, int_Unit_Id, num_Unit_Price, num_Total_Price)
       VALUES (?, ?, ?, 2500, ?, 35.00, 87500.00)`,
      [quo4Res.insertId, reqItem4.insertId, prodIdMap['PRD-000007'], unitMap['UNT-009']]
    );

    // RFQ 3 for Builder 2 (Green Valley - OPEN)
    const [rfq3Res] = await connection.query(
      `INSERT INTO tbl_material_requirement 
       (txt_Requirement_Code, int_Project_Id, int_Builder_Id, txt_Requirement_Title, txt_Delivery_Location, txt_City, txt_Pincode, dte_Required_Delivery_Date, txt_Priority, txt_Status)
       VALUES ('REQ-000003', ?, ?, 'Plumbing & Wiring Materials for Villa Phase 1', 'Sarjapur Road Villa Site', 'Bengaluru', '560035', '2026-11-10', 'URGENT', 'OPEN')`,
      [proj3Id, bld2Id]
    );
    const rfq3Id = rfq3Res.insertId;

    await connection.query(
      `INSERT INTO tbl_requirement_item 
       (int_Requirement_Id, int_Product_Id, int_Category_Id, num_Quantity, int_Unit_Id, txt_Required_Spec, txt_Preferred_Brand, num_Max_Acceptable_Price)
       VALUES (?, ?, ?, 100, ?, 'Supreme 110mm PVC SWR Pipes', 'Supreme', 800.00)`,
      [rfq3Id, prodIdMap['PRD-000008'], catMap['Pipes'], unitMap['UNT-005']]
    );
    await connection.query(
      `INSERT INTO tbl_requirement_item 
       (int_Requirement_Id, int_Product_Id, int_Category_Id, num_Quantity, int_Unit_Id, txt_Required_Spec, txt_Preferred_Brand, num_Max_Acceptable_Price)
       VALUES (?, ?, ?, 50, ?, 'Finolex 2.5 sq mm Wires', 'Finolex', 2200.00)`,
      [rfq3Id, prodIdMap['PRD-000009'], catMap['Electrical'], unitMap['UNT-007']]
    );

    console.log('✅ RFQs, Requirement items, and Quotations seeded.');

    // ==========================================
    // 6. PURCHASE ORDER, PAYMENT & INVENTORY SYNC
    // ==========================================

    // Purchase Order for RFQ 1 / Quote 1 (DELIVERED & PAID)
    const [po1Res] = await connection.query(
      `INSERT INTO tbl_purchase_order 
       (txt_PO_Code, int_Project_Id, int_Builder_Id, int_Supplier_Id, int_Quotation_Id, int_Requirement_Id, dte_PO_Date, txt_Delivery_Location, dte_Expected_Delivery_Date, num_Total_Amount, num_Tax, num_Discount, txt_Terms, txt_Status, txt_Payment_Status)
       VALUES ('PO-000001', ?, ?, ?, ?, ?, '2026-10-01', 'Apex Horizon Site, Chembur East, Mumbai', '2026-10-04', ?, 0.00, 0.00, 'Standard 30 days net terms', 'DELIVERED', 'PAID')`,
      [proj1Id, bld1Id, sup1Id, quo1Id, rfq1Id, totalQuote1Amt]
    );
    const po1Id = po1Res.insertId;

    await connection.query(
      `INSERT INTO tbl_purchase_order_item 
       (int_PO_Id, int_Product_Id, num_Quantity, int_Unit_Id, num_Unit_Price, num_Total)
       VALUES (?, ?, 800, ?, 350.00, 280000.00)`,
      [po1Id, prodIdMap['PRD-000001'], unitMap['UNT-001']]
    );
    await connection.query(
      `INSERT INTO tbl_purchase_order_item 
       (int_PO_Id, int_Product_Id, num_Quantity, int_Unit_Id, num_Unit_Price, num_Total)
       VALUES (?, ?, 15, ?, 60500.00, 907500.00)`,
      [po1Id, prodIdMap['PRD-000003'], unitMap['UNT-002']]
    );

    // Payment Record for PO 1
    await connection.query(
      `INSERT INTO tbl_payment 
       (txt_Payment_Code, int_PO_Id, num_Amount, dte_Payment_Date, txt_Payment_Mode, txt_Transaction_Reference, txt_Status)
       VALUES ('PAY-000001', ?, ?, '2026-10-05', 'Bank Transfer', 'NEFT-HDFC-9988776655', 'SUCCESSFUL')`,
      [po1Id, totalQuote1Amt]
    );

    // Sync Project Inventory (Builder 1 now has stock from delivered PO!)
    await connection.query(
      `INSERT INTO tbl_project_inventory 
       (int_Project_Id, int_Product_Id, num_Current_Stock, num_Minimum_Level, int_Unit_Id)
       VALUES (?, ?, 800, 100, ?)`,
      [proj1Id, prodIdMap['PRD-000001'], unitMap['UNT-001']]
    );
    await connection.query(
      `INSERT INTO tbl_project_inventory 
       (int_Project_Id, int_Product_Id, num_Current_Stock, num_Minimum_Level, int_Unit_Id)
       VALUES (?, ?, 15, 2, ?)`,
      [proj1Id, prodIdMap['PRD-000003'], unitMap['UNT-002']]
    );

    // Supplier Review for PO 1
    await connection.query(
      `INSERT INTO tbl_supplier_review 
       (int_Supplier_Id, int_Builder_Id, int_PO_Id, num_Overall_Rating, num_Price_Rating, num_Quality_Rating, num_Delivery_Rating, num_Communication_Rating, txt_Review_Text, txt_Status)
       VALUES (?, ?, ?, 4.80, 5, 5, 5, 4, 'Excellent delivery speed and genuine quality cement and steel rebars. Highly recommended supplier!', 'APPROVED')`,
      [sup1Id, bld1Id, po1Id]
    );

    console.log('✅ Purchase Orders, Payments, Project Inventories, and Reviews seeded.');

    await connection.commit();
    console.log('🎉 ALL DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    connection.release();
    process.exit(0);
  } catch (err) {
    await connection.rollback();
    connection.release();
    console.error('❌ Database Seeding Failed:', err);
    process.exit(1);
  }
}

seedDatabase();
