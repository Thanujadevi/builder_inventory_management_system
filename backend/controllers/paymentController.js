const { pool } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/responseHandler');
const { generateBusinessCode } = require('../services/codeGeneratorService');
const { logAudit } = require('../services/auditService');

// POST /api/payments (Record manual payment against PO)
const recordPayment = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { poId, amount, paymentDate, paymentMode, transactionReference, remarks } = req.body;

    if (!poId || !amount || !paymentDate || !paymentMode) {
      connection.release();
      return sendError(res, 'PO ID, Amount, Payment Date, and Payment Mode are required');
    }

    const payAmount = parseFloat(amount);
    if (isNaN(payAmount) || payAmount <= 0) {
      connection.release();
      return sendError(res, 'Payment amount must be a positive numeric value');
    }

    // 1. Fetch Purchase Order and previous payments
    const [pos] = await connection.query('SELECT * FROM tbl_purchase_order WHERE int_PO_Id = ?', [poId]);
    if (pos.length === 0) {
      connection.release();
      return sendError(res, 'Purchase Order not found', null, 404);
    }

    const po = pos[0];
    const totalPoAmount = parseFloat(po.num_Total_Amount);

    const [payments] = await connection.query(
      'SELECT COALESCE(SUM(num_Amount), 0) as total_paid FROM tbl_payment WHERE int_PO_Id = ? AND txt_Status = "SUCCESSFUL"',
      [poId]
    );

    const previousPaid = parseFloat(payments[0].total_paid);
    const outstandingAmount = Math.max(0, totalPoAmount - previousPaid);

    // Business validation: Payment amount cannot exceed outstanding balance
    if (payAmount > outstandingAmount + 0.01) { // 0.01 tolerance for rounding
      connection.release();
      return sendError(
        res,
        `Payment amount (₹${payAmount.toLocaleString('en-IN')}) exceeds remaining outstanding balance (₹${outstandingAmount.toLocaleString('en-IN')}).`
      );
    }

    const payCode = await generateBusinessCode('PAY', 'tbl_payment', 'txt_Payment_Code');

    // 2. Insert Payment Record
    const [payResult] = await connection.query(
      `INSERT INTO tbl_payment 
       (txt_Payment_Code, int_PO_Id, num_Amount, dte_Payment_Date, txt_Payment_Mode, txt_Transaction_Reference, txt_Remarks, txt_Status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'SUCCESSFUL')`,
      [payCode, poId, payAmount, paymentDate, paymentMode, transactionReference || '', remarks || '']
    );

    const newTotalPaid = previousPaid + payAmount;
    let newPaymentStatus = 'PARTIALLY_PAID';
    if (newTotalPaid >= totalPoAmount - 0.01) {
      newPaymentStatus = 'PAID';
    }

    // Update PO payment status
    await connection.query('UPDATE tbl_purchase_order SET txt_Payment_Status = ? WHERE int_PO_Id = ?', [newPaymentStatus, poId]);

    await connection.commit();
    connection.release();

    await logAudit(req.user.int_User_Id, 'RECORD_PAYMENT', 'tbl_payment', payResult.insertId, `Recorded payment of ₹${payAmount} for PO ${po.txt_PO_Code}`);

    return sendSuccess(res, 'Payment recorded successfully', {
      paymentId: payResult.insertId,
      paymentCode: payCode,
      amountPaid: payAmount,
      totalPaid: newTotalPaid,
      outstandingAmount: Math.max(0, totalPoAmount - newTotalPaid),
      paymentStatus: newPaymentStatus
    }, 201);
  } catch (error) {
    await connection.rollback();
    connection.release();
    return sendError(res, 'Failed to record payment', error.message, 500);
  }
};

// GET /api/payments/po/:poId (List all payments for a PO)
const getPaymentsByPO = async (req, res) => {
  try {
    const poId = req.params.poId;
    const [rows] = await pool.query('SELECT * FROM tbl_payment WHERE int_PO_Id = ? ORDER BY int_Payment_Id DESC', [poId]);
    return sendSuccess(res, 'Payments retrieved successfully', { payments: rows });
  } catch (error) {
    return sendError(res, 'Failed to fetch payments', error.message, 500);
  }
};

module.exports = {
  recordPayment,
  getPaymentsByPO
};
