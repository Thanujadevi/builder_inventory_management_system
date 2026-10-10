const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { logAudit } = require('../services/auditService');

// POST /api/reviews (Builder submits supplier review for a completed PO)
const submitReview = async (req, res) => {
  try {
    const builderId = req.user.builderId;
    const { poId, overallRating, priceRating, qualityRating, deliveryRating, communicationRating, reviewText } = req.body;

    if (!poId || !overallRating || !priceRating || !qualityRating || !deliveryRating || !communicationRating) {
      return sendError(res, 'PO ID and ratings (Overall, Price, Quality, Delivery, Communication) are required');
    }

    // Check PO existence & status
    const [pos] = await pool.query('SELECT * FROM tbl_purchase_order WHERE int_PO_Id = ?', [poId]);
    if (pos.length === 0) return sendError(res, 'Purchase Order not found', null, 404);

    const po = pos[0];
    if (po.int_Builder_Id !== builderId) {
      return sendError(res, 'Unauthorized to review this Purchase Order', null, 403);
    }

    if (po.txt_Status !== 'DELIVERED') {
      return sendError(res, 'Reviews can only be submitted after the Purchase Order is marked DELIVERED.');
    }

    // Check duplicate review
    const [existing] = await pool.query('SELECT int_Review_Id FROM tbl_supplier_review WHERE int_PO_Id = ?', [poId]);
    if (existing.length > 0) {
      return sendError(res, 'You have already submitted a review for this Purchase Order.');
    }

    const [result] = await pool.query(
      `INSERT INTO tbl_supplier_review 
       (int_Supplier_Id, int_Builder_Id, int_PO_Id, num_Overall_Rating, num_Price_Rating, num_Quality_Rating, num_Delivery_Rating, num_Communication_Rating, txt_Review_Text, txt_Status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'APPROVED')`,
      [po.int_Supplier_Id, builderId, poId, overallRating, priceRating, qualityRating, deliveryRating, communicationRating, reviewText || '']
    );

    await logAudit(req.user.int_User_Id, 'SUBMIT_REVIEW', 'tbl_supplier_review', result.insertId, `Submitted review for supplier ${po.int_Supplier_Id}`);

    return sendSuccess(res, 'Supplier review submitted successfully', { reviewId: result.insertId, overallRating }, 201);
  } catch (error) {
    return sendError(res, 'Failed to submit review', error.message, 500);
  }
};

// GET /api/reviews/supplier/:supplierId (Get all reviews for a supplier)
const getSupplierReviews = async (req, res) => {
  try {
    const supplierId = req.params.supplierId;
    const [rows] = await pool.query(
      `SELECT r.*, b.txt_Company_Name as builder_company_name, po.txt_PO_Code
       FROM tbl_supplier_review r
       JOIN tbl_builder b ON r.int_Builder_Id = b.int_Builder_Id
       JOIN tbl_purchase_order po ON r.int_PO_Id = po.int_PO_Id
       WHERE r.int_Supplier_Id = ?
       ORDER BY r.int_Review_Id DESC`,
      [supplierId]
    );

    // Calculate aggregated average ratings dynamically
    let avgOverall = 0, avgPrice = 0, avgQuality = 0, avgDelivery = 0, avgComm = 0;
    if (rows.length > 0) {
      avgOverall = rows.reduce((acc, curr) => acc + parseFloat(curr.num_Overall_Rating), 0) / rows.length;
      avgPrice = rows.reduce((acc, curr) => acc + parseInt(curr.num_Price_Rating, 10), 0) / rows.length;
      avgQuality = rows.reduce((acc, curr) => acc + parseInt(curr.num_Quality_Rating, 10), 0) / rows.length;
      avgDelivery = rows.reduce((acc, curr) => acc + parseInt(curr.num_Delivery_Rating, 10), 0) / rows.length;
      avgComm = rows.reduce((acc, curr) => acc + parseInt(curr.num_Communication_Rating, 10), 0) / rows.length;
    }

    return sendSuccess(res, 'Supplier reviews retrieved successfully', {
      reviews: rows,
      summary: {
        totalReviews: rows.length,
        avgOverallRating: Math.round(avgOverall * 10) / 10,
        avgPriceRating: Math.round(avgPrice * 10) / 10,
        avgQualityRating: Math.round(avgQuality * 10) / 10,
        avgDeliveryRating: Math.round(avgDelivery * 10) / 10,
        avgCommunicationRating: Math.round(avgComm * 10) / 10
      }
    });
  } catch (error) {
    return sendError(res, 'Failed to fetch supplier reviews', error.message, 500);
  }
};

module.exports = {
  submitReview,
  getSupplierReviews
};
