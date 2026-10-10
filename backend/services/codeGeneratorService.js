const { pool } = require('../config/db');

/**
 * Generate formatted sequential business code
 * @param {string} prefix - Code prefix e.g., 'USR', 'BLD', 'SUP', 'PRJ', 'REQ', 'QUO', 'PO', 'PAY'
 * @param {string} tableName - Database table name
 * @param {string} columnName - Business code column name
 */
const generateBusinessCode = async (prefix, tableName, columnName) => {
  try {
    const query = `SELECT ${columnName} FROM ${tableName} WHERE ${columnName} LIKE ? ORDER BY int_${tableName.replace('tbl_', '').replace(/_/g, '')}_Id DESC LIMIT 1`;
    // Fallback search with regex if primary ID name pattern varies
    const fallbackQuery = `SELECT ${columnName} FROM ${tableName} WHERE ${columnName} LIKE ? ORDER BY 1 DESC LIMIT 1`;
    
    let rows;
    try {
      [rows] = await pool.query(fallbackQuery, [`${prefix}-%`]);
    } catch (e) {
      [rows] = await pool.query(query, [`${prefix}-%`]);
    }

    if (!rows || rows.length === 0) {
      return `${prefix}-000001`;
    }

    const lastCode = rows[0][columnName];
    const parts = lastCode.split('-');
    if (parts.length < 2) {
      return `${prefix}-000001`;
    }

    const nextNum = parseInt(parts[1], 10) + 1;
    return `${prefix}-${String(nextNum).padStart(6, '0')}`;
  } catch (error) {
    console.error(`Error generating business code for ${prefix}:`, error);
    // Return timestamp-backed fallback if query fails to avoid blocking entity creation
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    return `${prefix}-${randomSuffix}`;
  }
};

module.exports = {
  generateBusinessCode
};
