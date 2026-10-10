const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { generateBusinessCode } = require('../services/codeGeneratorService');

// GET /api/builders/projects
const getProjects = async (req, res) => {
  try {
    const builderId = req.user.builderId;
    const [rows] = await pool.query(
      `SELECT p.*,
              (SELECT COUNT(*) FROM tbl_material_requirement WHERE int_Project_Id = p.int_Project_Id) as rfq_count,
              (SELECT COUNT(*) FROM tbl_purchase_order WHERE int_Project_Id = p.int_Project_Id) as po_count,
              (SELECT COALESCE(SUM(num_Total_Amount), 0) FROM tbl_purchase_order WHERE int_Project_Id = p.int_Project_Id) as total_procurement_value
       FROM tbl_project p
       WHERE p.int_Builder_Id = ?
       ORDER BY p.int_Project_Id DESC`,
      [builderId]
    );

    return sendSuccess(res, 'Builder projects retrieved successfully', { projects: rows });
  } catch (error) {
    return sendError(res, 'Failed to fetch builder projects', error.message, 500);
  }
};

// POST /api/builders/projects
const createProject = async (req, res) => {
  try {
    const builderId = req.user.builderId;
    const { projectName, projectType, description, address, city, state, pincode, estimatedBudget, procurementBudget, startDate, expectedCompletionDate } = req.body;

    if (!projectName || !projectType || !address || !city || !state || !pincode) {
      return sendError(res, 'Project Name, Type, Address, City, State, and Pincode are required');
    }

    const projectCode = await generateBusinessCode('PRJ', 'tbl_project', 'txt_Project_Code');

    const [result] = await pool.query(
      `INSERT INTO tbl_project 
       (txt_Project_Code, int_Builder_Id, txt_Project_Name, txt_Project_Type, txt_Description, txt_Address, txt_City, txt_State, txt_Pincode, num_Estimated_Budget, num_Procurement_Budget, dte_Start_Date, dte_Expected_Completion_Date, txt_Status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')`,
      [projectCode, builderId, projectName, projectType, description || '', address, city, state, pincode, estimatedBudget || 0.0, procurementBudget || 0.0, startDate || null, expectedCompletionDate || null]
    );

    return sendSuccess(res, 'Construction project created successfully', { projectId: result.insertId, projectCode, projectName }, 201);
  } catch (error) {
    return sendError(res, 'Failed to create project', error.message, 500);
  }
};

module.exports = {
  getProjects,
  createProject
};
