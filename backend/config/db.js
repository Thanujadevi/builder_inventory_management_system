const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'builderconnect_db',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  timezone: '+00:00',
  dateStrings: true
});

// Utility helper to test pool connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log(`[MySQL DB] Successfully connected to database: ${process.env.DB_NAME || 'builderconnect_db'}`);
    connection.release();
    return true;
  } catch (error) {
    console.error(`[MySQL DB Error] Failed to connect to MySQL database: ${error.message}`);
    return false;
  }
};

module.exports = {
  pool,
  testConnection
};
