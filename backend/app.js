const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes Initialization
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const builderRoutes = require('./routes/builderRoutes');
const rfqRoutes = require('./routes/rfqRoutes');
const quotationRoutes = require('./routes/quotationRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const poRoutes = require('./routes/poRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/builders', builderRoutes);
app.use('/api/requirements', rfqRoutes);
app.use('/api/quotations', quotationRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/purchase-orders', poRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/dashboards', dashboardRoutes);

// Healthcheck Route
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'BuilderConnect Backend API is healthy and operational', timestamp: new Date() });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('[Central Server Error]', err.stack || err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : 'A server error occurred'
  });
});

module.exports = app;
