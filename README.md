# BuilderConnect – Construction Procurement & Inventory Management Platform

> **Tagline**: Smart Construction Procurement. Better Suppliers. Better Decisions.

BuilderConnect is an enterprise-grade B2B web application connecting **Admins**, **Builders / Contractors**, and **Suppliers**. It streamlines construction procurement by allowing Builders to submit multi-item **Material Requirements (RFQs)**, receive competitive supplier quotations, and execute a dynamic **Smart Supplier Recommendation Engine** to determine the optimal supplier.

---

## 🌟 Key Features & Core Highlights

### 1. Smart Supplier Recommendation Engine
- Dynamic multi-criteria scoring algorithm (`backend/services/recommendationService.js`):
  - **Price Score (30%)**: Relative normalization against minimum quote total.
  - **Delivery Speed (20%)**: Target delivery days compliance.
  - **Supplier Rating (15%)**: Aggregated review score from past deliveries.
  - **Stock Availability (15%)**: Active warehouse stock matching RFQ items.
  - **MOQ Fulfillment (10%)**: Compliance with minimum order quantities.
  - **Location Radius (5%)**: Project proximity to supplier service area.
  - **Specification Match (5%)**: Certification and brand alignment.
- **Partial RFQ Coverage Handling**: Prevents partial quotes from being unfairly ranked above complete fulfillments.
- **Explainable Output**: Generates human-readable bullet points detailing why the supplier was recommended.
- **Decision Support**: Recommendation is assistance; Builder can override and select any supplier.

### 2. Normalized MySQL 8+ Database Architecture
- Unified audit trail (`dte_Created_Date`, `txt_Created_By`, `dte_Updated_Date`, `txt_Updated_By`, `txt_Status`).
- Separate human-readable business codes (`USR-000001`, `PRJ-000001`, `REQ-000001`, `QUO-000001`, `PO-000001`, `PAY-000001`).
- Multi-supplier master product support (`tbl_supplier_product`).
- Automatic inventory sync upon Purchase Order `DELIVERED` status.

### 3. Role-Based Access Control (RBAC) & Single Login
- Roles: `ADMIN`, `BUILDER`, `SUPPLIER`.
- Single unified login page with automated role-based navigation.
- Supplier registration requires Admin KYC/GST approval before login access is enabled.
- JWT bearer token authentication with server-side role enforcement middleware.

### 4. Dynamic Dashboard & Zero-Data Experience
- Admin, Builder, and Supplier dashboards calculated dynamically from MySQL queries.
- Clean empty states when the database contains 0 business records.

---

## 📁 Repository Structure

```
c:\Builder_Inventory/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/       # StatCard, StatusBadge, RecommendedCard, Sidebar, Header
│   │   ├── layouts/          # MainLayout, AuthLayout
│   │   ├── pages/
│   │   │   ├── auth/         # Login, RegisterBuilder, RegisterSupplier
│   │   │   ├── admin/        # AdminDashboard, SupplierApprovals, Categories, MasterProducts
│   │   │   ├── builder/      # BuilderDashboard, Projects, CreateRFQ, Recommendation UI, POs, Payments, Inventory
│   │   │   └── supplier/     # SupplierDashboard, Catalogue, SupplierRFQs, SubmitQuotation, Orders
│   │   ├── routes/           # AppRoutes, ProtectedRoute
│   │   ├── services/         # Axios API service
│   │   ├── context/          # AuthContext
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css         # B2B Vanilla CSS Design System
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── backend/
│   ├── config/               # db.js (mysql2/promise pool)
│   ├── controllers/          # Auth, Admin, Builder, Supplier, RFQ, Quotation, PO, Payment, Inventory, Review, Dashboard
│   ├── middleware/           # authMiddleware (JWT & RBAC), uploadMiddleware
│   ├── routes/               # Express API endpoints
│   ├── services/             # recommendationService, codeGeneratorService, auditService
│   ├── utils/                # responseHandler
│   ├── uploads/              # Local uploaded documents/images
│   ├── app.js
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── Dockerfile
├── database/
│   └── schema.sql            # Executable MySQL DDL schema + Seed master data
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 🚀 Quick Setup & Installation

### Option A: Local Development Setup

#### 1. Database Setup
1. Ensure MySQL 8+ is running on `localhost:3306`.
2. Import the schema and seed data into MySQL:
   ```bash
   mysql -u root -p < database/schema.sql
   ```

#### 2. Backend Setup
1. Navigate to `backend/`:
   ```bash
   cd backend
   npm install
   ```
2. Configure `.env` file (copy from `.env.example` if needed):
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=yourpassword
   DB_NAME=builderconnect_db
   JWT_SECRET=builderconnect_super_secret_jwt_key_2026_change_in_production
   ```
3. Start backend API server:
   ```bash
   npm run dev
   ```
   *(Server starts at http://localhost:5000)*

#### 3. Frontend Setup
1. Navigate to `frontend/`:
   ```bash
   cd frontend
   npm install
   ```
2. Start Vite development server:
   ```bash
   npm run dev
   ```
   *(Application opens at http://localhost:3000)*

---

### Option B: Docker Container Deployment

Run with a single command using Docker Compose:
```bash
docker-compose up --build
```
- **Frontend App**: `http://localhost:3000`
- **Backend REST API**: `http://localhost:5000`
- **MySQL Container**: `localhost:3306`

---

## 🔑 Initial Default Accounts

| Role | Username / Email | Default Password | Initial Approval Status |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin` / `admin@builderconnect.com` | `Admin@123` | Active / Pre-seeded |
| **BUILDER** | Register via UI (`/register-builder`) | User Choice | Active upon registration |
| **SUPPLIER** | Register via UI (`/register-supplier`) | User Choice | **Pending** (Approve via Admin Panel) |

---

## 🔒 Security & Architecture Standards

- **Parameterisation**: All SQL queries use parameterized placeholders (`?`) to prevent SQL Injection.
- **Password Security**: Passwords are encrypted using `bcryptjs` with salt rounds = 10.
- **Authorization**: Protected endpoints require standard `Authorization: Bearer <JWT_TOKEN>` header.
- **Transaction Safety**: Multi-step business operations (e.g. Quotation accept $\rightarrow$ PO generation $\rightarrow$ Status update) are executed inside MySQL transactions with auto-rollback on failure.
