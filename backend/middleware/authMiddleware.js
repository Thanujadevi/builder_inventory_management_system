const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/responseHandler');
const { pool } = require('../config/db');

const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication token missing or invalid format', null, 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'builderconnect_super_secret_jwt_key_2026_change_in_production');

    // Verify active user in DB
    const [users] = await pool.query(
      'SELECT int_User_Id, txt_User_Code, txt_Username, txt_Email, txt_Role, txt_Status FROM tbl_user WHERE int_User_Id = ?',
      [decoded.userId]
    );

    if (!users || users.length === 0) {
      return sendError(res, 'User account no longer exists', null, 401);
    }

    const user = users[0];

    if (user.txt_Status === 'SUSPENDED' || user.txt_Status === 'INACTIVE' || user.txt_Status === 'REJECTED') {
      return sendError(res, `Account is currently ${user.txt_Status}. Access denied.`, null, 403);
    }

    // Attach role-specific profile ID if available
    if (user.txt_Role === 'ADMIN') {
      const [admins] = await pool.query('SELECT int_Admin_Id FROM tbl_admin WHERE int_User_Id = ?', [user.int_User_Id]);
      user.adminId = admins.length > 0 ? admins[0].int_Admin_Id : null;
    } else if (user.txt_Role === 'BUILDER') {
      const [builders] = await pool.query('SELECT int_Builder_Id, txt_Company_Name, txt_City FROM tbl_builder WHERE int_User_Id = ?', [user.int_User_Id]);
      user.builderId = builders.length > 0 ? builders[0].int_Builder_Id : null;
      user.companyName = builders.length > 0 ? builders[0].txt_Company_Name : '';
    } else if (user.txt_Role === 'SUPPLIER') {
      const [suppliers] = await pool.query('SELECT int_Supplier_Id, txt_Supplier_Name, txt_Approval_Status, txt_City FROM tbl_supplier WHERE int_User_Id = ?', [user.int_User_Id]);
      if (suppliers.length > 0) {
        user.supplierId = suppliers[0].int_Supplier_Id;
        user.supplierName = suppliers[0].txt_Supplier_Name;
        user.approvalStatus = suppliers[0].txt_Approval_Status;

        // Strict check: Non-approved suppliers cannot access protected APIs
        if (suppliers[0].txt_Approval_Status !== 'APPROVED') {
          return sendError(res, `Supplier account is ${suppliers[0].txt_Approval_Status}. Access restricted until Admin approval.`, null, 403);
        }
      }
    }

    // Attach normalized aliases for frontend & controller convenience
    user.userId = user.int_User_Id;
    user.userCode = user.txt_User_Code;
    user.username = user.txt_Username;
    user.email = user.txt_Email;
    user.role = user.txt_Role;
    user.status = user.txt_Status;

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Session expired. Please log in again.', null, 401);
    }
    return sendError(res, 'Invalid authentication token', error.message, 401);
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user && req.user.txt_Role === 'ADMIN') {
    return next();
  }
  return sendError(res, 'Access denied. Admin role required.', null, 403);
};

const requireBuilder = (req, res, next) => {
  if (req.user && req.user.txt_Role === 'BUILDER') {
    return next();
  }
  return sendError(res, 'Access denied. Builder role required.', null, 403);
};

const requireSupplier = (req, res, next) => {
  if (req.user && req.user.txt_Role === 'SUPPLIER') {
    return next();
  }
  return sendError(res, 'Access denied. Supplier role required.', null, 403);
};

module.exports = {
  authenticateUser,
  requireAdmin,
  requireBuilder,
  requireSupplier
};
