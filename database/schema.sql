-- ============================================================
-- BUILDERCONNECT DATABASE SCHEMA
-- DATABASE NAME: builderconnect_db
-- ENGINE: InnoDB | CHARSET: utf8mb4 | COLLATE: utf8mb4_unicode_ci
-- ============================================================

CREATE DATABASE IF NOT EXISTS builderconnect_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE builderconnect_db;

-- Disable foreign key checks for clean teardown/re-creation if needed
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS tbl_audit_log;
DROP TABLE IF EXISTS tbl_notification;
DROP TABLE IF EXISTS tbl_recommendation_weight;
DROP TABLE IF EXISTS tbl_supplier_review;
DROP TABLE IF EXISTS tbl_inventory_transaction;
DROP TABLE IF EXISTS tbl_project_inventory;
DROP TABLE IF EXISTS tbl_supplier_inventory;
DROP TABLE IF EXISTS tbl_payment;
DROP TABLE IF EXISTS tbl_purchase_order_item;
DROP TABLE IF EXISTS tbl_purchase_order;
DROP TABLE IF EXISTS tbl_quotation_item;
DROP TABLE IF EXISTS tbl_quotation;
DROP TABLE IF EXISTS tbl_requirement_item;
DROP TABLE IF EXISTS tbl_material_requirement;
DROP TABLE IF EXISTS tbl_project;
DROP TABLE IF EXISTS tbl_supplier_product;
DROP TABLE IF EXISTS tbl_product;
DROP TABLE IF EXISTS tbl_unit;
DROP TABLE IF EXISTS tbl_category;
DROP TABLE IF EXISTS tbl_supplier_document;
DROP TABLE IF EXISTS tbl_supplier_kyc;
DROP TABLE IF EXISTS tbl_supplier;
DROP TABLE IF EXISTS tbl_builder;
DROP TABLE IF EXISTS tbl_admin;
DROP TABLE IF EXISTS tbl_user;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- 1. CENTRAL AUTH & USERS
-- ============================================================

CREATE TABLE tbl_user (
  int_User_Id INT AUTO_INCREMENT PRIMARY KEY,
  txt_User_Code VARCHAR(30) UNIQUE NOT NULL,
  txt_Username VARCHAR(50) UNIQUE NOT NULL,
  txt_Email VARCHAR(100) UNIQUE NOT NULL,
  txt_Password_Hash VARCHAR(255) NOT NULL,
  txt_Role ENUM('ADMIN', 'BUILDER', 'SUPPLIER') NOT NULL,
  txt_Status ENUM('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED', 'ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  dte_Created_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  txt_Created_By VARCHAR(50) DEFAULT 'SYSTEM',
  dte_Updated_Date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  txt_Updated_By VARCHAR(50) DEFAULT 'SYSTEM',
  INDEX idx_user_role_status (txt_Role, txt_Status),
  INDEX idx_user_username (txt_Username),
  INDEX idx_user_email (txt_Email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 2. ROLE PROFILES
-- ============================================================

CREATE TABLE tbl_admin (
  int_Admin_Id INT AUTO_INCREMENT PRIMARY KEY,
  int_User_Id INT UNIQUE NOT NULL,
  txt_Admin_Code VARCHAR(30) UNIQUE NOT NULL,
  txt_Full_Name VARCHAR(100) NOT NULL,
  txt_Phone VARCHAR(20) NOT NULL,
  txt_Department VARCHAR(50) DEFAULT 'Operations',
  txt_Status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  dte_Created_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  txt_Created_By VARCHAR(50) DEFAULT 'SYSTEM',
  dte_Updated_Date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  txt_Updated_By VARCHAR(50) DEFAULT 'SYSTEM',
  CONSTRAINT fk_admin_user FOREIGN KEY (int_User_Id) REFERENCES tbl_user(int_User_Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tbl_builder (
  int_Builder_Id INT AUTO_INCREMENT PRIMARY KEY,
  int_User_Id INT UNIQUE NOT NULL,
  txt_Builder_Code VARCHAR(30) UNIQUE NOT NULL,
  txt_Company_Name VARCHAR(150) NOT NULL,
  txt_Contact_Person VARCHAR(100) NOT NULL,
  txt_Phone VARCHAR(20) NOT NULL,
  txt_Address TEXT NOT NULL,
  txt_City VARCHAR(50) NOT NULL,
  txt_State VARCHAR(50) NOT NULL,
  txt_Pincode VARCHAR(10) NOT NULL,
  txt_Country VARCHAR(50) DEFAULT 'India',
  txt_GSTIN VARCHAR(20),
  txt_Status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  dte_Created_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  txt_Created_By VARCHAR(50) DEFAULT 'SYSTEM',
  dte_Updated_Date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  txt_Updated_By VARCHAR(50) DEFAULT 'SYSTEM',
  CONSTRAINT fk_builder_user FOREIGN KEY (int_User_Id) REFERENCES tbl_user(int_User_Id) ON DELETE CASCADE,
  INDEX idx_builder_city (txt_City)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tbl_supplier (
  int_Supplier_Id INT AUTO_INCREMENT PRIMARY KEY,
  int_User_Id INT UNIQUE NOT NULL,
  txt_Supplier_Code VARCHAR(30) UNIQUE NOT NULL,
  txt_Supplier_Name VARCHAR(150) NOT NULL,
  txt_Contact_Person VARCHAR(100) NOT NULL,
  txt_Phone VARCHAR(20) NOT NULL,
  txt_GSTIN VARCHAR(20) NOT NULL,
  txt_Address TEXT NOT NULL,
  txt_City VARCHAR(50) NOT NULL,
  txt_State VARCHAR(50) NOT NULL,
  txt_Pincode VARCHAR(10) NOT NULL,
  txt_Country VARCHAR(50) DEFAULT 'India',
  num_Delivery_Radius_KM DECIMAL(8,2) DEFAULT 50.00,
  txt_Approval_Status ENUM('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED') NOT NULL DEFAULT 'PENDING',
  txt_Rejection_Reason TEXT,
  txt_Status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  dte_Created_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  txt_Created_By VARCHAR(50) DEFAULT 'SYSTEM',
  dte_Updated_Date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  txt_Updated_By VARCHAR(50) DEFAULT 'SYSTEM',
  CONSTRAINT fk_supplier_user FOREIGN KEY (int_User_Id) REFERENCES tbl_user(int_User_Id) ON DELETE CASCADE,
  INDEX idx_supplier_approval (txt_Approval_Status),
  INDEX idx_supplier_city (txt_City)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tbl_supplier_kyc (
  int_KYC_Id INT AUTO_INCREMENT PRIMARY KEY,
  int_Supplier_Id INT NOT NULL,
  txt_Business_Reg_No VARCHAR(50),
  txt_PAN VARCHAR(20),
  txt_GST_Status ENUM('UNVERIFIED', 'VERIFIED', 'FAILED') DEFAULT 'UNVERIFIED',
  txt_KYC_Status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
  txt_Remarks TEXT,
  dte_Created_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  txt_Created_By VARCHAR(50) DEFAULT 'SYSTEM',
  dte_Updated_Date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  txt_Updated_By VARCHAR(50) DEFAULT 'SYSTEM',
  CONSTRAINT fk_kyc_supplier FOREIGN KEY (int_Supplier_Id) REFERENCES tbl_supplier(int_Supplier_Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tbl_supplier_document (
  int_Doc_Id INT AUTO_INCREMENT PRIMARY KEY,
  int_Supplier_Id INT NOT NULL,
  txt_Doc_Type ENUM('GST_CERT', 'PAN_CARD', 'BUSINESS_PROOF', 'CANCELLED_CHEQUE', 'OTHER') NOT NULL,
  txt_Doc_Name VARCHAR(255) NOT NULL,
  txt_Doc_Path VARCHAR(255) NOT NULL,
  txt_Status VARCHAR(20) DEFAULT 'ACTIVE',
  dte_Created_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  txt_Created_By VARCHAR(50) DEFAULT 'SYSTEM',
  dte_Updated_Date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  txt_Updated_By VARCHAR(50) DEFAULT 'SYSTEM',
  CONSTRAINT fk_doc_supplier FOREIGN KEY (int_Supplier_Id) REFERENCES tbl_supplier(int_Supplier_Id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 3. MASTER DATA
-- ============================================================

CREATE TABLE tbl_category (
  int_Category_Id INT AUTO_INCREMENT PRIMARY KEY,
  txt_Category_Code VARCHAR(30) UNIQUE NOT NULL,
  txt_Category_Name VARCHAR(100) UNIQUE NOT NULL,
  txt_Description TEXT,
  txt_Image_Url VARCHAR(255),
  txt_Status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  dte_Created_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  txt_Created_By VARCHAR(50) DEFAULT 'SYSTEM',
  dte_Updated_Date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  txt_Updated_By VARCHAR(50) DEFAULT 'SYSTEM'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tbl_unit (
  int_Unit_Id INT AUTO_INCREMENT PRIMARY KEY,
  txt_Unit_Code VARCHAR(20) UNIQUE NOT NULL,
  txt_Unit_Name VARCHAR(50) UNIQUE NOT NULL,
  txt_Abbreviation VARCHAR(20) NOT NULL,
  txt_Status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  dte_Created_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  txt_Created_By VARCHAR(50) DEFAULT 'SYSTEM',
  dte_Updated_Date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  txt_Updated_By VARCHAR(50) DEFAULT 'SYSTEM'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tbl_product (
  int_Product_Id INT AUTO_INCREMENT PRIMARY KEY,
  txt_Product_Code VARCHAR(30) UNIQUE NOT NULL,
  int_Category_Id INT NOT NULL,
  txt_Product_Name VARCHAR(150) NOT NULL,
  txt_Description TEXT,
  txt_Default_Spec TEXT,
  int_Default_Unit_Id INT NOT NULL,
  txt_Status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  dte_Created_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  txt_Created_By VARCHAR(50) DEFAULT 'SYSTEM',
  dte_Updated_Date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  txt_Updated_By VARCHAR(50) DEFAULT 'SYSTEM',
  CONSTRAINT fk_product_category FOREIGN KEY (int_Category_Id) REFERENCES tbl_category(int_Category_Id),
  CONSTRAINT fk_product_unit FOREIGN KEY (int_Default_Unit_Id) REFERENCES tbl_unit(int_Unit_Id),
  INDEX idx_product_category (int_Category_Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 4. SUPPLIER PRODUCT OFFERINGS & CATALOGUE
-- ============================================================

CREATE TABLE tbl_supplier_product (
  int_Supplier_Product_Id INT AUTO_INCREMENT PRIMARY KEY,
  txt_Supplier_Product_Code VARCHAR(30) UNIQUE NOT NULL,
  int_Supplier_Id INT NOT NULL,
  int_Product_Id INT NOT NULL,
  txt_Custom_Product_Name VARCHAR(150),
  txt_Brand VARCHAR(100),
  txt_Specification TEXT,
  int_Unit_Id INT NOT NULL,
  num_Base_Price DECIMAL(12,2) NOT NULL,
  num_Bulk_Price DECIMAL(12,2),
  num_Bulk_Threshold INT DEFAULT 0,
  num_MOQ INT NOT NULL DEFAULT 1,
  num_Current_Stock INT NOT NULL DEFAULT 0,
  num_Minimum_Stock INT NOT NULL DEFAULT 10,
  num_Delivery_Radius_KM DECIMAL(8,2) DEFAULT 50.00,
  txt_Product_Image_Url VARCHAR(255),
  txt_Certification_Ref VARCHAR(100),
  txt_Availability_Status ENUM('IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK') DEFAULT 'IN_STOCK',
  txt_Status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  dte_Created_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  txt_Created_By VARCHAR(50) DEFAULT 'SYSTEM',
  dte_Updated_Date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  txt_Updated_By VARCHAR(50) DEFAULT 'SYSTEM',
  CONSTRAINT fk_sp_supplier FOREIGN KEY (int_Supplier_Id) REFERENCES tbl_supplier(int_Supplier_Id) ON DELETE CASCADE,
  CONSTRAINT fk_sp_product FOREIGN KEY (int_Product_Id) REFERENCES tbl_product(int_Product_Id),
  CONSTRAINT fk_sp_unit FOREIGN KEY (int_Unit_Id) REFERENCES tbl_unit(int_Unit_Id),
  UNIQUE KEY uq_supplier_product (int_Supplier_Id, int_Product_Id),
  INDEX idx_sp_product (int_Product_Id),
  INDEX idx_sp_supplier (int_Supplier_Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. BUILDER PROJECTS
-- ============================================================

CREATE TABLE tbl_project (
  int_Project_Id INT AUTO_INCREMENT PRIMARY KEY,
  txt_Project_Code VARCHAR(30) UNIQUE NOT NULL,
  int_Builder_Id INT NOT NULL,
  txt_Project_Name VARCHAR(150) NOT NULL,
  txt_Project_Type VARCHAR(50) NOT NULL,
  txt_Description TEXT,
  txt_Address TEXT NOT NULL,
  txt_City VARCHAR(50) NOT NULL,
  txt_State VARCHAR(50) NOT NULL,
  txt_Pincode VARCHAR(10) NOT NULL,
  num_Estimated_Budget DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  num_Procurement_Budget DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  dte_Start_Date DATE,
  dte_Expected_Completion_Date DATE,
  txt_Status ENUM('PLANNED', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE',
  txt_Remarks TEXT,
  dte_Created_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  txt_Created_By VARCHAR(50) DEFAULT 'SYSTEM',
  dte_Updated_Date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  txt_Updated_By VARCHAR(50) DEFAULT 'SYSTEM',
  CONSTRAINT fk_project_builder FOREIGN KEY (int_Builder_Id) REFERENCES tbl_builder(int_Builder_Id) ON DELETE CASCADE,
  INDEX idx_project_builder (int_Builder_Id),
  INDEX idx_project_status (txt_Status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. RFQ / MATERIAL REQUIREMENTS
-- ============================================================

CREATE TABLE tbl_material_requirement (
  int_Requirement_Id INT AUTO_INCREMENT PRIMARY KEY,
  txt_Requirement_Code VARCHAR(30) UNIQUE NOT NULL,
  int_Project_Id INT NOT NULL,
  int_Builder_Id INT NOT NULL,
  txt_Requirement_Title VARCHAR(150) NOT NULL,
  txt_Delivery_Location TEXT NOT NULL,
  txt_City VARCHAR(50) NOT NULL,
  txt_Pincode VARCHAR(10) NOT NULL,
  dte_Required_Delivery_Date DATE NOT NULL,
  txt_Priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM',
  txt_Status ENUM('DRAFT', 'SUBMITTED', 'OPEN', 'QUOTATION_RECEIVED', 'QUOTATION_SUBMITTED', 'CLOSED', 'CANCELLED') NOT NULL DEFAULT 'OPEN',
  txt_Remarks TEXT,
  dte_Created_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  txt_Created_By VARCHAR(50) DEFAULT 'SYSTEM',
  dte_Updated_Date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  txt_Updated_By VARCHAR(50) DEFAULT 'SYSTEM',
  CONSTRAINT fk_req_project FOREIGN KEY (int_Project_Id) REFERENCES tbl_project(int_Project_Id) ON DELETE CASCADE,
  CONSTRAINT fk_req_builder FOREIGN KEY (int_Builder_Id) REFERENCES tbl_builder(int_Builder_Id),
  INDEX idx_req_project (int_Project_Id),
  INDEX idx_req_status (txt_Status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tbl_requirement_item (
  int_Req_Item_Id INT AUTO_INCREMENT PRIMARY KEY,
  int_Requirement_Id INT NOT NULL,
  int_Product_Id INT NOT NULL,
  int_Category_Id INT NOT NULL,
  num_Quantity INT NOT NULL,
  int_Unit_Id INT NOT NULL,
  txt_Required_Spec TEXT,
  txt_Preferred_Brand VARCHAR(100),
  num_Max_Acceptable_Price DECIMAL(12,2),
  dte_Item_Delivery_Date DATE,
  txt_Remarks TEXT,
  txt_Status VARCHAR(20) DEFAULT 'ACTIVE',
  dte_Created_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  txt_Created_By VARCHAR(50) DEFAULT 'SYSTEM',
  dte_Updated_Date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  txt_Updated_By VARCHAR(50) DEFAULT 'SYSTEM',
  CONSTRAINT fk_ri_requirement FOREIGN KEY (int_Requirement_Id) REFERENCES tbl_material_requirement(int_Requirement_Id) ON DELETE CASCADE,
  CONSTRAINT fk_ri_product FOREIGN KEY (int_Product_Id) REFERENCES tbl_product(int_Product_Id),
  CONSTRAINT fk_ri_category FOREIGN KEY (int_Category_Id) REFERENCES tbl_category(int_Category_Id),
  CONSTRAINT fk_ri_unit FOREIGN KEY (int_Unit_Id) REFERENCES tbl_unit(int_Unit_Id),
  INDEX idx_ri_requirement (int_Requirement_Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. QUOTATIONS
-- ============================================================

CREATE TABLE tbl_quotation (
  int_Quotation_Id INT AUTO_INCREMENT PRIMARY KEY,
  txt_Quotation_Code VARCHAR(30) UNIQUE NOT NULL,
  int_Requirement_Id INT NOT NULL,
  int_Supplier_Id INT NOT NULL,
  num_Total_Amount DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  num_Delivery_Days INT NOT NULL,
  txt_Payment_Terms VARCHAR(150) DEFAULT '30 Days Net',
  dte_Valid_Until DATE NOT NULL,
  num_Coverage_Percent DECIMAL(5,2) DEFAULT 100.00,
  txt_Status ENUM('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'WITHDRAWN') NOT NULL DEFAULT 'SUBMITTED',
  txt_Remarks TEXT,
  dte_Submitted_Date DATETIME DEFAULT CURRENT_TIMESTAMP,
  dte_Created_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  txt_Created_By VARCHAR(50) DEFAULT 'SYSTEM',
  dte_Updated_Date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  txt_Updated_By VARCHAR(50) DEFAULT 'SYSTEM',
  CONSTRAINT fk_quotation_req FOREIGN KEY (int_Requirement_Id) REFERENCES tbl_material_requirement(int_Requirement_Id) ON DELETE CASCADE,
  CONSTRAINT fk_quotation_supplier FOREIGN KEY (int_Supplier_Id) REFERENCES tbl_supplier(int_Supplier_Id),
  UNIQUE KEY uq_supplier_rfq (int_Requirement_Id, int_Supplier_Id),
  INDEX idx_quotation_req (int_Requirement_Id),
  INDEX idx_quotation_supplier (int_Supplier_Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tbl_quotation_item (
  int_Quo_Item_Id INT AUTO_INCREMENT PRIMARY KEY,
  int_Quotation_Id INT NOT NULL,
  int_Req_Item_Id INT NOT NULL,
  int_Product_Id INT NOT NULL,
  num_Quantity INT NOT NULL,
  int_Unit_Id INT NOT NULL,
  num_Unit_Price DECIMAL(12,2) NOT NULL,
  num_Discount DECIMAL(12,2) DEFAULT 0.00,
  num_Tax DECIMAL(12,2) DEFAULT 0.00,
  num_Total_Price DECIMAL(15,2) NOT NULL,
  num_Delivery_Estimate_Days INT,
  txt_Specification TEXT,
  txt_Remarks TEXT,
  txt_Status VARCHAR(20) DEFAULT 'ACTIVE',
  dte_Created_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  txt_Created_By VARCHAR(50) DEFAULT 'SYSTEM',
  dte_Updated_Date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  txt_Updated_By VARCHAR(50) DEFAULT 'SYSTEM',
  CONSTRAINT fk_qi_quotation FOREIGN KEY (int_Quotation_Id) REFERENCES tbl_quotation(int_Quotation_Id) ON DELETE CASCADE,
  CONSTRAINT fk_qi_req_item FOREIGN KEY (int_Req_Item_Id) REFERENCES tbl_requirement_item(int_Req_Item_Id),
  CONSTRAINT fk_qi_product FOREIGN KEY (int_Product_Id) REFERENCES tbl_product(int_Product_Id),
  CONSTRAINT fk_qi_unit FOREIGN KEY (int_Unit_Id) REFERENCES tbl_unit(int_Unit_Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 8. PURCHASE ORDERS & DELIVERY
-- ============================================================

CREATE TABLE tbl_purchase_order (
  int_PO_Id INT AUTO_INCREMENT PRIMARY KEY,
  txt_PO_Code VARCHAR(30) UNIQUE NOT NULL,
  int_Project_Id INT NOT NULL,
  int_Builder_Id INT NOT NULL,
  int_Supplier_Id INT NOT NULL,
  int_Quotation_Id INT NOT NULL,
  int_Requirement_Id INT NOT NULL,
  dte_PO_Date DATE NOT NULL,
  txt_Delivery_Location TEXT NOT NULL,
  dte_Expected_Delivery_Date DATE NOT NULL,
  num_Total_Amount DECIMAL(15,2) NOT NULL,
  num_Tax DECIMAL(15,2) DEFAULT 0.00,
  num_Discount DECIMAL(15,2) DEFAULT 0.00,
  txt_Terms TEXT,
  txt_Remarks TEXT,
  txt_Status ENUM('DRAFT', 'ISSUED', 'ACCEPTED', 'REJECTED', 'PROCESSING', 'DISPATCHED', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'ISSUED',
  txt_Payment_Status ENUM('PENDING', 'PARTIALLY_PAID', 'PAID') NOT NULL DEFAULT 'PENDING',
  dte_Created_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  txt_Created_By VARCHAR(50) DEFAULT 'SYSTEM',
  dte_Updated_Date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  txt_Updated_By VARCHAR(50) DEFAULT 'SYSTEM',
  CONSTRAINT fk_po_project FOREIGN KEY (int_Project_Id) REFERENCES tbl_project(int_Project_Id),
  CONSTRAINT fk_po_builder FOREIGN KEY (int_Builder_Id) REFERENCES tbl_builder(int_Builder_Id),
  CONSTRAINT fk_po_supplier FOREIGN KEY (int_Supplier_Id) REFERENCES tbl_supplier(int_Supplier_Id),
  CONSTRAINT fk_po_quotation FOREIGN KEY (int_Quotation_Id) REFERENCES tbl_quotation(int_Quotation_Id),
  CONSTRAINT fk_po_requirement FOREIGN KEY (int_Requirement_Id) REFERENCES tbl_material_requirement(int_Requirement_Id),
  INDEX idx_po_builder (int_Builder_Id),
  INDEX idx_po_supplier (int_Supplier_Id),
  INDEX idx_po_status (txt_Status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tbl_purchase_order_item (
  int_PO_Item_Id INT AUTO_INCREMENT PRIMARY KEY,
  int_PO_Id INT NOT NULL,
  int_Product_Id INT NOT NULL,
  num_Quantity INT NOT NULL,
  int_Unit_Id INT NOT NULL,
  num_Unit_Price DECIMAL(12,2) NOT NULL,
  num_Discount DECIMAL(12,2) DEFAULT 0.00,
  num_Tax DECIMAL(12,2) DEFAULT 0.00,
  num_Total DECIMAL(15,2) NOT NULL,
  txt_Status VARCHAR(20) DEFAULT 'ACTIVE',
  dte_Created_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  txt_Created_By VARCHAR(50) DEFAULT 'SYSTEM',
  dte_Updated_Date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  txt_Updated_By VARCHAR(50) DEFAULT 'SYSTEM',
  CONSTRAINT fk_poi_po FOREIGN KEY (int_PO_Id) REFERENCES tbl_purchase_order(int_PO_Id) ON DELETE CASCADE,
  CONSTRAINT fk_poi_product FOREIGN KEY (int_Product_Id) REFERENCES tbl_product(int_Product_Id),
  CONSTRAINT fk_poi_unit FOREIGN KEY (int_Unit_Id) REFERENCES tbl_unit(int_Unit_Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 9. MANUAL PAYMENTS
-- ============================================================

CREATE TABLE tbl_payment (
  int_Payment_Id INT AUTO_INCREMENT PRIMARY KEY,
  txt_Payment_Code VARCHAR(30) UNIQUE NOT NULL,
  int_PO_Id INT NOT NULL,
  num_Amount DECIMAL(15,2) NOT NULL,
  dte_Payment_Date DATE NOT NULL,
  txt_Payment_Mode ENUM('Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Other') NOT NULL,
  txt_Transaction_Reference VARCHAR(100),
  txt_Remarks TEXT,
  txt_Status ENUM('SUCCESSFUL', 'PENDING', 'CANCELLED') DEFAULT 'SUCCESSFUL',
  dte_Created_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  txt_Created_By VARCHAR(50) DEFAULT 'SYSTEM',
  dte_Updated_Date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  txt_Updated_By VARCHAR(50) DEFAULT 'SYSTEM',
  CONSTRAINT fk_payment_po FOREIGN KEY (int_PO_Id) REFERENCES tbl_purchase_order(int_PO_Id) ON DELETE CASCADE,
  INDEX idx_payment_po (int_PO_Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 10. INVENTORY (SUPPLIER & PROJECT)
-- ============================================================

CREATE TABLE tbl_supplier_inventory (
  int_Supplier_Inv_Id INT AUTO_INCREMENT PRIMARY KEY,
  int_Supplier_Id INT NOT NULL,
  int_Product_Id INT NOT NULL,
  num_Current_Stock INT NOT NULL DEFAULT 0,
  num_Minimum_Stock INT NOT NULL DEFAULT 10,
  int_Unit_Id INT NOT NULL,
  txt_Availability_Status ENUM('IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK') DEFAULT 'IN_STOCK',
  dte_Last_Updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  txt_Status VARCHAR(20) DEFAULT 'ACTIVE',
  dte_Created_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  txt_Created_By VARCHAR(50) DEFAULT 'SYSTEM',
  dte_Updated_Date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  txt_Updated_By VARCHAR(50) DEFAULT 'SYSTEM',
  CONSTRAINT fk_si_supplier FOREIGN KEY (int_Supplier_Id) REFERENCES tbl_supplier(int_Supplier_Id) ON DELETE CASCADE,
  CONSTRAINT fk_si_product FOREIGN KEY (int_Product_Id) REFERENCES tbl_product(int_Product_Id),
  CONSTRAINT fk_si_unit FOREIGN KEY (int_Unit_Id) REFERENCES tbl_unit(int_Unit_Id),
  UNIQUE KEY uq_supplier_inventory (int_Supplier_Id, int_Product_Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tbl_project_inventory (
  int_Project_Inv_Id INT AUTO_INCREMENT PRIMARY KEY,
  int_Project_Id INT NOT NULL,
  int_Product_Id INT NOT NULL,
  num_Current_Stock INT NOT NULL DEFAULT 0,
  num_Minimum_Level INT NOT NULL DEFAULT 10,
  int_Unit_Id INT NOT NULL,
  dte_Last_Updated DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  txt_Status VARCHAR(20) DEFAULT 'ACTIVE',
  dte_Created_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  txt_Created_By VARCHAR(50) DEFAULT 'SYSTEM',
  dte_Updated_Date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  txt_Updated_By VARCHAR(50) DEFAULT 'SYSTEM',
  CONSTRAINT fk_pi_project FOREIGN KEY (int_Project_Id) REFERENCES tbl_project(int_Project_Id) ON DELETE CASCADE,
  CONSTRAINT fk_pi_product FOREIGN KEY (int_Product_Id) REFERENCES tbl_product(int_Product_Id),
  CONSTRAINT fk_pi_unit FOREIGN KEY (int_Unit_Id) REFERENCES tbl_unit(int_Unit_Id),
  UNIQUE KEY uq_project_inventory (int_Project_Id, int_Product_Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tbl_material_inventory (
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
  CONSTRAINT fk_mi_builder FOREIGN KEY (int_Builder_Id) REFERENCES tbl_builder(int_Builder_Id),
  CONSTRAINT fk_mi_category FOREIGN KEY (int_Category_Id) REFERENCES tbl_category(int_Category_Id),
  CONSTRAINT fk_mi_unit FOREIGN KEY (int_Unit_Id) REFERENCES tbl_unit(int_Unit_Id),
  INDEX idx_mi_builder (int_Builder_Id),
  INDEX idx_mi_project (int_Project_Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tbl_material_allocation (
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
  CONSTRAINT fk_ma_inventory FOREIGN KEY (int_Inventory_Id) REFERENCES tbl_material_inventory(int_Inventory_Id) ON DELETE CASCADE,
  CONSTRAINT fk_ma_project FOREIGN KEY (int_Project_Id) REFERENCES tbl_project(int_Project_Id),
  INDEX idx_ma_inventory (int_Inventory_Id),
  INDEX idx_ma_project (int_Project_Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE tbl_inventory_transaction (
  int_Transaction_Id INT AUTO_INCREMENT PRIMARY KEY,
  txt_Transaction_Code VARCHAR(30) UNIQUE NOT NULL,
  int_Inventory_Id INT,
  int_Product_Id INT,
  int_Project_Id INT,
  int_Supplier_Id INT,
  num_Quantity DECIMAL(12,2) NOT NULL,
  num_Unit_Cost DECIMAL(12,2) DEFAULT 0.00,
  num_Total_Cost DECIMAL(15,2) DEFAULT 0.00,
  txt_Transaction_Type VARCHAR(50) NOT NULL,
  txt_Reference VARCHAR(100),
  txt_Issued_To VARCHAR(100),
  txt_Storage_Location VARCHAR(100),
  txt_Remarks TEXT,
  dte_Transaction_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  dte_Created_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  txt_Created_By VARCHAR(50) DEFAULT 'SYSTEM',
  INDEX idx_it_inventory (int_Inventory_Id),
  INDEX idx_it_project (int_Project_Id),
  INDEX idx_it_supplier (int_Supplier_Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 11. SUPPLIER REVIEWS & RATINGS
-- ============================================================

CREATE TABLE tbl_supplier_review (
  int_Review_Id INT AUTO_INCREMENT PRIMARY KEY,
  int_Supplier_Id INT NOT NULL,
  int_Builder_Id INT NOT NULL,
  int_PO_Id INT UNIQUE NOT NULL,
  num_Overall_Rating DECIMAL(3,2) NOT NULL,
  num_Price_Rating INT NOT NULL,
  num_Quality_Rating INT NOT NULL,
  num_Delivery_Rating INT NOT NULL,
  num_Communication_Rating INT NOT NULL,
  txt_Review_Text TEXT,
  txt_Status VARCHAR(20) DEFAULT 'APPROVED',
  dte_Created_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  txt_Created_By VARCHAR(50) DEFAULT 'SYSTEM',
  dte_Updated_Date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  txt_Updated_By VARCHAR(50) DEFAULT 'SYSTEM',
  CONSTRAINT fk_review_supplier FOREIGN KEY (int_Supplier_Id) REFERENCES tbl_supplier(int_Supplier_Id),
  CONSTRAINT fk_review_builder FOREIGN KEY (int_Builder_Id) REFERENCES tbl_builder(int_Builder_Id),
  CONSTRAINT fk_review_po FOREIGN KEY (int_PO_Id) REFERENCES tbl_purchase_order(int_PO_Id),
  INDEX idx_review_supplier (int_Supplier_Id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 12. NOTIFICATIONS
-- ============================================================

CREATE TABLE tbl_notification (
  int_Notification_Id INT AUTO_INCREMENT PRIMARY KEY,
  int_User_Id INT NOT NULL,
  txt_Title VARCHAR(150) NOT NULL,
  txt_Message TEXT NOT NULL,
  txt_Type VARCHAR(50) DEFAULT 'GENERAL',
  int_Reference_Id INT,
  txt_Is_Read ENUM('YES', 'NO') DEFAULT 'NO',
  dte_Created_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  txt_Created_By VARCHAR(50) DEFAULT 'SYSTEM',
  CONSTRAINT fk_notification_user FOREIGN KEY (int_User_Id) REFERENCES tbl_user(int_User_Id) ON DELETE CASCADE,
  INDEX idx_notification_user_read (int_User_Id, txt_Is_Read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 13. RECOMMENDATION WEIGHT CONFIGURATION
-- ============================================================

CREATE TABLE tbl_recommendation_weight (
  int_Weight_Id INT AUTO_INCREMENT PRIMARY KEY,
  txt_Criterion_Key VARCHAR(50) UNIQUE NOT NULL,
  txt_Criterion_Name VARCHAR(100) NOT NULL,
  num_Weight_Percent DECIMAL(5,2) NOT NULL,
  txt_Description VARCHAR(255),
  dte_Updated_Date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  txt_Updated_By VARCHAR(50) DEFAULT 'SYSTEM'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 14. AUDIT LOG
-- ============================================================

CREATE TABLE tbl_audit_log (
  int_Audit_Id INT AUTO_INCREMENT PRIMARY KEY,
  int_User_Id INT,
  txt_Action VARCHAR(100) NOT NULL,
  txt_Entity VARCHAR(50) NOT NULL,
  int_Entity_Id INT,
  txt_Description TEXT,
  txt_IP_Address VARCHAR(45),
  dte_Created_Date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  txt_Created_By VARCHAR(50) DEFAULT 'SYSTEM'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- SEED DATA (MASTER DATA & SYSTEM DEFAULT WEIGHTS)
-- ============================================================

-- Master Categories
INSERT INTO tbl_category (txt_Category_Code, txt_Category_Name, txt_Description) VALUES
('CAT-001', 'Cement', 'Ordinary Portland Cement, Portland Pozzolana Cement, etc.'),
('CAT-002', 'Steel / TMT', 'Fe500, Fe550 TMT Rebars and Structural Steel'),
('CAT-003', 'Bricks & Blocks', 'Red Clay Bricks, AAC Blocks, Fly Ash Bricks'),
('CAT-004', 'Sand & Aggregates', 'M-Sand, P-Sand, 20mm Aggregates, 40mm Aggregates'),
('CAT-005', 'Pipes', 'PVC, CPVC, UPVC, HDPE, and GI Pipes'),
('CAT-006', 'Electrical', 'Wires, Cables, Switches, Conduits, Breakers'),
('CAT-007', 'Plumbing', 'Fittings, Valves, Taps, Sanitaryware'),
('CAT-008', 'Tiles', 'Vitrified Tiles, Ceramic Tiles, Granite, Marble'),
('CAT-009', 'Paints', 'Emulsions, Primers, Waterproof Coatings'),
('CAT-010', 'Doors & Windows', 'UPVC Windows, Wooden Doors, Flush Doors'),
('CAT-011', 'Hardware', 'Fasteners, Hinges, Locks, Nails'),
('CAT-012', 'Waterproofing', 'Chemicals, Membranes, Sealants'),
('CAT-013', 'Precast Products', 'Precast Slabs, Fencing Posts, Cover Blocks');

-- Master Units
INSERT INTO tbl_unit (txt_Unit_Code, txt_Unit_Name, txt_Abbreviation) VALUES
('UNT-001', 'Bags', 'Bags'),
('UNT-002', 'Metric Ton', 'MT'),
('UNT-003', 'Pieces', 'Pcs'),
('UNT-004', 'Square Feet', 'Sq.Ft'),
('UNT-005', 'Meters', 'm'),
('UNT-006', 'Liters', 'L'),
('UNT-007', 'Boxes', 'Box'),
('UNT-008', 'Bundles', 'Bdl'),
('UNT-009', 'Cubic Feet', 'CFT'),
('UNT-010', 'Kilograms', 'kg');

-- Recommendation Weights
INSERT INTO tbl_recommendation_weight (txt_Criterion_Key, txt_Criterion_Name, num_Weight_Percent, txt_Description) VALUES
('price', 'Price Score', 30.00, 'Normalized price relative to lowest quote'),
('delivery', 'Delivery Speed', 20.00, 'Speed of delivery relative to required date'),
('rating', 'Supplier Rating', 15.00, 'Historical average review score'),
('stock', 'Stock Availability', 15.00, 'Sufficient stock for requested quantities'),
('moq', 'MOQ Fulfillment', 10.00, 'Compliance with Minimum Order Quantity'),
('location', 'Location Radius', 5.00, 'Project within supplier delivery radius'),
('quality', 'Quality / Spec Match', 5.00, 'Specification and certification match');

-- Initial Admin Account Seed (Default Password: Admin@123 -> hashed with bcrypt)
-- Note: Admin credentials below are Username: admin | Password: Admin@123
INSERT INTO tbl_user (txt_User_Code, txt_Username, txt_Email, txt_Password_Hash, txt_Role, txt_Status) VALUES
('USR-000001', 'admin', 'admin@builderconnect.com', '$2a$10$wB5M6lG1pP4gKxQ1P2eRde6Y8m9w3g9l8X7z6v5c4b3a2m1k0j9i8', 'ADMIN', 'ACTIVE');

INSERT INTO tbl_admin (int_User_Id, txt_Admin_Code, txt_Full_Name, txt_Phone, txt_Department) VALUES
(1, 'ADM-000001', 'Platform Administrator', '+91 9876543210', 'System Administration');

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
