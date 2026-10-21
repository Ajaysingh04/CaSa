# CaSa Marketplace — Integration, Setup & Operating Guide

This document defines the deployment, integration boundaries, database lifecycle, security controls, and operational validation procedures for the **CaSa Multi-Vendor Marketplace**.

---

## 1. System Architecture & Workflows

CaSa connects Customers, Sellers (Vendors), Delivery Partners (Couriers), and Administrators into one server-controlled lifecycle backed by MongoDB Atlas and real-time Socket.IO synchronization.

```
                          ┌───────────────────────────┐
                          │   CaSa Admin Dashboard    │
                          │ (Super-Admin / Ops Admin) │
                          └─────────────┬─────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ▼                            ▼                            ▼
┌────────────────────┐       ┌────────────────────┐       ┌────────────────────┐
│   Customer Store   │       │    Vendor Panel    │       │   Delivery Panel   │
│ (Catalog/Checkout) │       │ (Products/Orders)  │       │ (Pickups/Delivery) │
└──────────┬─────────┘       └──────────┬─────────┘       └──────────┬─────────┘
           │                            │                            │
           └────────────────────────────┼────────────────────────────┘
                                        │
                                        ▼
                         ┌─────────────────────────────┐
                         │    Express REST Services    │
                         │  (Auth, Orders, Shipments,  │
                         │   Payments, Notifications)  │
                         └──────────────┬──────────────┘
                                        │
                    ┌───────────────────┴───────────────────┐
                    ▼                                       ▼
     ┌─────────────────────────────┐         ┌─────────────────────────────┐
     │    MongoDB Data Platform    │         │  Real-Time Socket.IO Hub    │
     │  (Snapshots, Audit Logs,    │         │  (Order Alerts, Milestones, │
     │   Shipments, Ledger Events) │         │   Delivery Task Broadcasts) │
     └─────────────────────────────┘         └─────────────────────────────┘
```

---

## 2. External Service Integration Boundaries

CaSa is designed with **transparent service boundaries**. When third-party API credentials are not provided in `server/.env`, CaSa operates in a **deterministic simulation mode** rather than falsely claiming external third parties are active.

### A. Payment Gateway (Razorpay India)
- **Active Provider**: [Razorpay](https://razorpay.com/)
- **Integration Layer**: `server/config/razorpay.js`, `server/controllers/paymentController.js`
- **Required Production Credentials**:
  - `RAZORPAY_KEY_ID`: Live Razorpay Key ID (e.g., `rzp_live_...`)
  - `RAZORPAY_KEY_SECRET`: Live Razorpay Key Secret
  - `RAZORPAY_WEBHOOK_SECRET`: Webhook verification secret configured on Razorpay Dashboard
- **Simulation Mode Behavior**:
  - If placeholder values (`rzp_test_placeholder...`) are present, the backend falls back to sandbox payment flow, allowing orders, payment verification, and idempotency tests to execute deterministically without charging real accounts.

### B. Courier / Logistics Gateway (Shiprocket / Delhivery API)
- **Integration Layer**: Canonical `Shipment` model (`server/models/Shipment.js`) and `server/controllers/deliveryController.js`.
- **Supported Providers**: Shiprocket API, Delhivery One, Shadowfax, or in-house express courier fleet.
- **Configurable Credentials**:
  - `COURIER_API_ENDPOINT`: REST endpoint of logistics aggregator (e.g., `https://apiv2.shiprocket.in/v1/external`)
  - `COURIER_API_TOKEN`: Bearer token for automated AWB generation and courier allocation.
- **Simulation / In-House Mode Behavior**:
  - CaSa natively supports **in-house dedicated delivery fleets**. Admins assign authorized courier partners from the Delivery Partner directory, generate a secure 4-digit verification OTP, and couriers track pickups and deliveries using mobile-optimized scan interfaces.

### C. SMS / Doorstep OTP Gateway
- **Integration Layer**: Doorstep delivery OTP verification (`server/controllers/deliveryController.js`).
- **Supported Providers**: Twilio, Fast2SMS, MSG91.
- **Configurable Credentials**:
  - `SMS_PROVIDER`: `twilio` | `msg91` | `fast2sms`
  - `SMS_API_KEY`: API authentication key
  - `SMS_SENDER_ID`: Registered DLT sender ID (e.g., `CASAIN`)
- **Fallback Behavior**:
  - In development and sandbox environments, OTPs are safely recorded on the server order document (`deliveryProofOtp`) and visible in authorized customer/admin views for immediate verification.

### D. Transactional Email Gateway
- **Supported Providers**: Nodemailer (SMTP), Amazon SES, SendGrid, Resend.
- **Configurable Credentials**:
  - `SMTP_HOST`: `smtp.sendgrid.net` or `email-smtp.us-east-1.amazonaws.com`
  - `SMTP_PORT`: `587`
  - `SMTP_USER`: SMTP username
  - `SMTP_PASS`: SMTP secret key
  - `EMAIL_FROM`: `no-reply@casa.in`
- **Fallback Behavior**:
  - Notifications are persisted directly in MongoDB (`Notification` collection) and delivered to connected clients via Socket.IO events.

---

## 3. Environment Configuration Guide

Do **NOT** overwrite `.env` with production keys directly. Copy `server/.env.example` to `server/.env` and update the required credentials.

```env
# Server Runtime
PORT=5000
NODE_ENV=production
CLIENT_URL=https://casa.in

# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/casa?retryWrites=true&w=majority

# Security
JWT_SECRET=generate_a_cryptographically_secure_256_bit_secret_key_here

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

# Logistics & SMS (Optional for third-party courier dispatch)
COURIER_API_TOKEN=
SMS_API_KEY=
```

---

## 4. Role-Based Access Control (RBAC)

CaSa enforces strict data isolation and principle of least privilege:

| Role | Access Scope | Protected Endpoints |
|---|---|---|
| `user` | Self orders, profile, saved addresses, wishlist, reviews | `/api/orders/myorders`, `/api/user/*` |
| `vendor` | Vendor store products, assigned order items, earnings ledger | `/api/vendor/*` |
| `delivery` | Assigned parcel shipments, pickup/delivery updates with OTP | `/api/delivery/*` |
| `admin` | Operations management, order dispatch, refund approvals | `/api/admin/*` |
| `super_admin` | Full operational control, destructive action approvals, audit logs | Complete system |

---

## 5. Non-Destructive Seeding & Validation

### Seeding Initial Data
Populate categories, catalog items, and administrative accounts without destroying production tables:
```powershell
npm run seed
```

### Executing Full Marketplace Validation Suite
Run the automated end-to-end test suite covering all 18 business lifecycle scenarios:
```powershell
node server/scripts/validateMarketplaceWorkflow.js
```

---

## 6. Production Deployment Checklist
1. [ ] Confirm MongoDB Atlas connection string and network whitelist.
2. [ ] Set production `JWT_SECRET` (minimum 32 random characters).
3. [ ] Register Razorpay webhook endpoint: `POST https://api.casa.in/api/payments/webhook`.
4. [ ] Build optimized client bundle: `npm run build` inside `client/`.
5. [ ] Configure reverse proxy (Nginx or Cloudflare) with SSL termination and WebSocket upgrade support for Socket.IO (`/socket.io/`).
