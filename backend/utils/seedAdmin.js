const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

const seedAdmin = async () => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('Admin@123', salt);

    const [existing] = await pool.query('SELECT int_User_Id FROM tbl_user WHERE txt_Username = "admin"');
    if (existing.length === 0) {
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
      console.log('✅ Admin user created successfully.');
    } else {
      await pool.query('UPDATE tbl_user SET txt_Password_Hash = ?, txt_Status = "ACTIVE" WHERE txt_Username = "admin"', [hash]);
      console.log('✅ Admin password updated to Admin@123.');
    }
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err.message);
    process.exit(1);
  }
};

seedAdmin();
