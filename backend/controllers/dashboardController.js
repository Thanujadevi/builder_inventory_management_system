const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/responseHandler');

// GET /api/admin/dashboard
const getAdminDashboard = async (req, res) => {
  try {
    const [[builderCounts]] = await pool.query('SELECT COUNT(*) as totalBuilders FROM tbl_builder');
    const [[supplierCounts]] = await pool.query('SELECT COUNT(*) as totalSuppliers, SUM(CASE WHEN txt_Approval_Status = "PENDING" THEN 1 ELSE 0 END) as pendingSuppliers, SUM(CASE WHEN txt_Approval_Status = "APPROVED" THEN 1 ELSE 0 END) as approvedSuppliers FROM tbl_supplier');
    const [[projectCounts]] = await pool.query('SELECT COUNT(*) as totalProjects, SUM(CASE WHEN txt_Status = "ACTIVE" THEN 1 ELSE 0 END) as activeProjects FROM tbl_project');
    const [[rfqCounts]] = await pool.query('SELECT COUNT(*) as totalRFQs FROM tbl_material_requirement');
    const [[quoCounts]] = await pool.query('SELECT COUNT(*) as totalQuotations FROM tbl_quotation');
    const [[poStats]] = await pool.query('SELECT COUNT(*) as totalPOs, COALESCE(SUM(num_Total_Amount), 0) as totalProcurementValue, SUM(CASE WHEN txt_Status = "DELIVERED" THEN 1 ELSE 0 END) as completedDeliveries FROM tbl_purchase_order');
    const [[payStats]] = await pool.query('SELECT COALESCE(SUM(num_Amount), 0) as totalPaid FROM tbl_payment WHERE txt_Status = "SUCCESSFUL"');

    const totalValue = parseFloat(poStats.totalProcurementValue || 0);
    const totalPaid = parseFloat(payStats.totalPaid || 0);

    return sendSuccess(res, 'Admin dashboard metrics retrieved successfully', {
      stats: {
        totalBuilders: builderCounts.totalBuilders || 0,
        totalSuppliers: supplierCounts.totalSuppliers || 0,
        pendingSupplierApprovals: supplierCounts.pendingSuppliers || 0,
        approvedSuppliers: supplierCounts.approvedSuppliers || 0,
        totalProjects: projectCounts.totalProjects || 0,
        activeProjects: projectCounts.activeProjects || 0,
        totalRFQs: rfqCounts.totalRFQs || 0,
        totalQuotations: quoCounts.totalQuotations || 0,
        totalPurchaseOrders: poStats.totalPOs || 0,
        procurementValue: totalValue,
        totalPaid,
        pendingPayments: Math.max(0, totalValue - totalPaid),
        completedDeliveries: poStats.completedDeliveries || 0
      }
    });
  } catch (error) {
    return sendError(res, 'Failed to fetch admin dashboard metrics', error.message, 500);
  }
};

// GET /api/builder/dashboard
const getBuilderDashboard = async (req, res) => {
  try {
    const builderId = req.user.builderId;
    if (!builderId) return sendError(res, 'Builder profile not found', null, 404);

    const [[projectStats]] = await pool.query(
      'SELECT COUNT(*) as totalProjects, SUM(CASE WHEN txt_Status = "ACTIVE" THEN 1 ELSE 0 END) as activeProjects FROM tbl_project WHERE int_Builder_Id = ?',
      [builderId]
    );

    const [[rfqStats]] = await pool.query(
      'SELECT COUNT(*) as totalRFQs FROM tbl_material_requirement WHERE int_Builder_Id = ?',
      [builderId]
    );

    const [[quoStats]] = await pool.query(
      `SELECT COUNT(*) as pendingQuotations 
       FROM tbl_quotation q
       JOIN tbl_material_requirement r ON q.int_Requirement_Id = r.int_Requirement_Id
       WHERE r.int_Builder_Id = ? AND q.txt_Status IN ('SUBMITTED', 'UNDER_REVIEW')`,
      [builderId]
    );

    const [[poStats]] = await pool.query(
      'SELECT COUNT(*) as totalPOs, COALESCE(SUM(num_Total_Amount), 0) as totalProcurementValue FROM tbl_purchase_order WHERE int_Builder_Id = ?',
      [builderId]
    );

    const [[payStats]] = await pool.query(
      `SELECT COALESCE(SUM(p.num_Amount), 0) as amountPaid
       FROM tbl_payment p
       JOIN tbl_purchase_order po ON p.int_PO_Id = po.int_PO_Id
       WHERE po.int_Builder_Id = ? AND p.txt_Status = 'SUCCESSFUL'`,
      [builderId]
    );

    const [[invStats]] = await pool.query(
      `SELECT COALESCE(SUM(pi.num_Current_Stock), 0) as totalInventoryUnits
       FROM tbl_project_inventory pi
       JOIN tbl_project prj ON pi.int_Project_Id = prj.int_Project_Id
       WHERE prj.int_Builder_Id = ?`,
      [builderId]
    );

    const procurementVal = parseFloat(poStats.totalProcurementValue || 0);
    const paidVal = parseFloat(payStats.amountPaid || 0);

    return sendSuccess(res, 'Builder dashboard metrics retrieved successfully', {
      stats: {
        totalProjects: projectStats.totalProjects || 0,
        activeProjects: projectStats.activeProjects || 0,
        totalRFQs: rfqStats.totalRFQs || 0,
        pendingQuotations: quoStats.pendingQuotations || 0,
        totalPurchaseOrders: poStats.totalPOs || 0,
        totalProcurementValue: procurementVal,
        amountPaid: paidVal,
        pendingPayment: Math.max(0, procurementVal - paidVal),
        inventorySummaryUnits: invStats.totalInventoryUnits || 0
      }
    });
  } catch (error) {
    return sendError(res, 'Failed to fetch builder dashboard metrics', error.message, 500);
  }
};

// GET /api/supplier/dashboard
const getSupplierDashboard = async (req, res) => {
  try {
    const supplierId = req.user.supplierId;
    if (!supplierId) return sendError(res, 'Supplier profile not found', null, 404);

    const [[productStats]] = await pool.query(
      'SELECT COUNT(*) as totalProducts, SUM(CASE WHEN txt_Status = "ACTIVE" THEN 1 ELSE 0 END) as activeProducts, COALESCE(SUM(num_Current_Stock), 0) as currentStock FROM tbl_supplier_product WHERE int_Supplier_Id = ?',
      [supplierId]
    );

    const [[rfqCount]] = await pool.query(
      "SELECT COUNT(*) as rfqsReceived FROM tbl_material_requirement WHERE txt_Status IN ('OPEN', 'QUOTATION_RECEIVED', 'QUOTATION_SUBMITTED')"
    );

    const [[quoStats]] = await pool.query(
      'SELECT COUNT(*) as submittedQuotations, SUM(CASE WHEN txt_Status = "ACCEPTED" THEN 1 ELSE 0 END) as acceptedQuotations FROM tbl_quotation WHERE int_Supplier_Id = ?',
      [supplierId]
    );

    const [[poStats]] = await pool.query(
      `SELECT COUNT(*) as totalOrders, 
              SUM(CASE WHEN txt_Status IN ('ISSUED', 'ACCEPTED', 'PROCESSING', 'DISPATCHED') THEN 1 ELSE 0 END) as pendingDeliveries,
              SUM(CASE WHEN txt_Status = 'DELIVERED' THEN 1 ELSE 0 END) as completedOrders
       FROM tbl_purchase_order WHERE int_Supplier_Id = ?`,
      [supplierId]
    );

    const [[ratingStats]] = await pool.query(
      'SELECT COALESCE(AVG(num_Overall_Rating), 0) as avgRating, COUNT(*) as reviewCount FROM tbl_supplier_review WHERE int_Supplier_Id = ?',
      [supplierId]
    );

    return sendSuccess(res, 'Supplier dashboard metrics retrieved successfully', {
      stats: {
        totalProducts: productStats.totalProducts || 0,
        activeProducts: productStats.activeProducts || 0,
        currentStock: productStats.currentStock || 0,
        rfqsReceived: rfqCount.rfqsReceived || 0,
        quotationsSubmitted: quoStats.submittedQuotations || 0,
        acceptedQuotations: quoStats.acceptedQuotations || 0,
        purchaseOrders: poStats.totalOrders || 0,
        pendingDeliveries: poStats.pendingDeliveries || 0,
        completedOrders: poStats.completedOrders || 0,
        averageRating: Math.round(parseFloat(ratingStats.avgRating || 0) * 10) / 10,
        reviewCount: ratingStats.reviewCount || 0
      }
    });
  } catch (error) {
    return sendError(res, 'Failed to fetch supplier dashboard metrics', error.message, 500);
  }
};

module.exports = {
  getAdminDashboard,
  getBuilderDashboard,
  getSupplierDashboard
};
