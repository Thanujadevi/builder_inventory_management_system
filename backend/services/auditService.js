const { pool } = require('../config/db');

const logAudit = async (userId, action, entity, entityId, description, ipAddress = '127.0.0.1') => {
  try {
    const query = `
      INSERT INTO tbl_audit_log (int_User_Id, txt_Action, txt_Entity, int_Entity_Id, txt_Description, txt_IP_Address)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await pool.query(query, [userId || null, action, entity, entityId || null, description || '', ipAddress]);
  } catch (error) {
    console.error('Audit log insertion failed silently:', error.message);
  }
};

module.exports = {
  logAudit
};
