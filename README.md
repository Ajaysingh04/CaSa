# CASA — Complete Full-Stack E-Commerce Marketplace

**CASA** is a professional, high-performance Indian online shopping marketplace inspired by commercial platforms like Amazon and Flipkart, featuring an original identity, responsive layout, multi-category catalog, Razorpay payments, and an administrative console.

---

## 🌟 Key Highlights

- **Original Brand Identity**: Clean backgrounds, professional navy and royal blue accents, refined typography, and smooth micro-interactions.
- **15 Department Categories**:
  1. *Electronics* (Smartphones, Laptops, Computers, Headphones, Cameras, Televisions, Speakers, Smartwatches, Accessories)
  2. *Women's Fashion* (Sarees, Kurtis, Dresses, Tops, Ethnic Wear, Lehengas, Salwar Suits, Handbags, Jewellery)
  3. *Men's Fashion* (T-shirts, Shirts, Jeans, Trousers, Jackets, Traditional Wear, Sneakers, Watches, Wallets)
  4. *Kids and Baby* (Kids' Clothing, Baby Products, Toys, School Bags, Baby Care, Footwear)
  5. *Home and Kitchen* (Cookware, Appliances, Bedsheets, Pillows, Curtains, Lamps, Organizers, Decor)
  6. *Beauty and Personal Care* (Makeup, Skincare, Haircare, Perfumes, Grooming Kits, Personal Care)
  7. *Footwear* (Sneakers, Sports Shoes, Formal Shoes, Sandals, Heels, Slippers)
  8. *Grocery and Daily Essentials* (Snacks, Packaged Foods, Beverages, Cleaning, Essentials)
  9. *Sports and Fitness* (Gym Equipment, Sportswear, Yoga Mats, Fitness Accessories)
  10. *Books and Stationery* (Books, Novels, Educational, Notebooks, Art Supplies)
  11. *Furniture* (Sofas, Chairs, Tables, Beds, Office Furniture)
  12. *Bags and Luggage* (Backpacks, Handbags, Laptop Bags, Travel Bags, Suitcases)
  13. *Watches and Jewellery* (Analog Watches, Smartwatches, Necklaces, Earrings, Bracelets)
  14. *Automotive Accessories* (Car Accessories, Bike Accessories, Cleaning Kits)
  15. *Pet Supplies* (Pet Food, Toys, Grooming and Accessories)
- **Multi-Category Homepage**: Promotional hero carousel, Category grid, Today's Best Deals with countdown timer, dedicated department showcases, Bestsellers, Trending items, and Recently Viewed items.
- **Search & Filtering**: Live debounced search suggestions, price range sliders, brand multi-select, rating filters, in-stock filter, and sorting (Price, Newest, Rating).
- **Product Details**: Multi-angle image gallery, variant selectors (size, color, storage), PIN code delivery check, stock urgency indicators, verified reviews, and related products.
- **Cart & Checkout**: Real-time server price calculations, coupon codes (`CASA200`, `FESTIVE15`, `WELCOME10`), free shipping threshold (₹499), guest cart with automatic post-login merge.
- **Payments**: Razorpay gateway integration with signature verification, test sandbox mode, and Cash on Delivery (COD).
- **Order Lifecycle Tracking**: Full tracking timeline (`Pending` → `Confirmed` → `Processing` → `Packed` → `Shipped` → `Out for delivery` → `Delivered`) with status transition rules and cancellation protection.
- **Enterprise Admin Console**: Revenue metrics, order status management, inventory CRUD, and user directory.
- **Resilient Database Fallback**: Built-in in-memory fallback store when MongoDB credentials are not yet configured, automatically switching to MongoDB when connected.

---

## 🛠 Technology Stack

### Frontend (`client/`)
- **React 19** with **Vite 6**
- **JavaScript (ES6+)**
- **React Router DOM v7**
- **Lucide React** (Modern iconography)
- **Axios** (With JWT interceptors)
- **Canvas-Confetti** (Order celebration animations)
- **Vanilla CSS & CSS Design System Tokens** (No bulky external CSS frameworks)

### Backend (`server/`)
- **Node.js** & **Express**
- **MongoDB** & **Mongoose 8**
- **JWT (JSON Web Tokens)** & **Cookie-Parser**
- **Bcryptjs** (Secure salt-based password hashing)
- **Zod** (Schema validation)
- **Razorpay SDK** (HMAC SHA-256 signature verification)
- **Helmet** (Security headers)
- **CORS** (Configured origins & credentials)
- **Express-Rate-Limit** (DDoS and brute-force protection)

---

## 📁 Project Architecture

```
casa/
├── package.json              # Root package with concurrent dev runner
├── README.md                 # Complete documentation
├── .gitignore
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/       # Header, Footer, CategoryNavbar, CartDrawer, etc.
│   │   │   ├── home/         # HeroCarousel, DealsSection, CategoryGrid, Showcases
│   │   │   ├── product/      # ProductCard
│   │   ├── context/          # AuthContext, CartContext, WishlistContext, ToastContext
│   │   ├── layouts/          # MainLayout, AdminLayout
│   │   ├── pages/            # Home, Products, ProductDetail, Cart, Checkout, Orders, Profile, Auth
│   │   │   └── admin/        # AdminDashboardPage, AdminOrdersPage, AdminProductsPage, AdminUsersPage
│   │   ├── services/         # Axios API clients
│   │   ├── styles/           # variables.css, index.css
│   │   ├── utils/            # formatters.js, constants.js
│   │   ├── App.jsx           # Application Router
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── .env.example
│   └── .env
└── server/
    ├── config/               # db.js, razorpay.js
    ├── controllers/          # auth, product, category, cart, order, payment, admin, etc.
    ├── data/                 # categoriesData.js, productsData.js, bannersData.js, couponsData.js
    ├── middleware/           # auth, errorHandler, rateLimiter, validate
    ├── models/               # User, Category, Product, Cart, Wishlist, Order, Payment, Review, Coupon, Banner
    ├── routes/               # Express REST routers
    ├── scripts/              # seed.js (MongoDB seeder)
    ├── services/             # dataStore.js, paymentService.js
    ├── validators/           # Zod schemas
    ├── app.js
    ├── server.js
    ├── package.json
    ├── .env.example
    └── .env
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18.0 or higher recommended)
- **npm** (v9.0 or higher)
- **MongoDB** (Local instance on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

### 2. Installation
Run the following from the root directory:
```bash
npm run install:all
```
*(This installs root, server, and client dependencies).*

### 3. Database Seeding
Populate the database with the initial 15 categories, 54 sample products, banners, coupons, and demo accounts:
```bash
npm run seed
```

### 4. Running the Development Servers
Start both the Express REST API (port 5000) and the Vite frontend (port 5173) simultaneously:
```bash
npm run dev
```

- **Frontend URL**: `http://localhost:5173`
- **Backend API URL**: `http://localhost:5000/api`
- **API Health Check**: `http://localhost:5000/api/health`

---

## 🔐 Demo Accounts

| Account Type | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@casa.in` | `Admin@Casa2026` | Enterprise Admin |
| **Customer** | `rajesh@casa.in` | `User@Casa2026` | Verified Shopper |

*(Quick-fill buttons are provided on the Login page for immediate one-click testing).*

---

## 🎟️ Active Promotional Coupons

- `CASA200` — Flat ₹200 off on orders above ₹1,499
- `FESTIVE15` — 15% off up to ₹1,200 on orders above ₹2,499
- `WELCOME10` — 10% off up to ₹500 on orders above ₹999

---

## 💳 Payment Gateway Configuration

The payment module is configured for **Razorpay India**.

### Environment Variables (`server/.env`):
```env
RAZORPAY_KEY_ID=rzp_test_placeholder_key
RAZORPAY_KEY_SECRET=rzp_test_placeholder_secret
```

- **Live / Test Mode**: If valid Razorpay test keys are provided in `.env`, the server uses the official Razorpay SDK to create payment orders and verify HMAC SHA-256 signatures.
- **Simulator Sandbox**: If placeholders are present, CASA runs in test sandbox mode, allowing complete checkout and order status transitions to be verified immediately.

---

## 📡 Key REST API Endpoints

### Authentication & Users
- `POST /api/auth/register` — Register a customer account
- `POST /api/auth/login` — Sign in and receive JWT token & HTTP-only cookie
- `GET /api/auth/me` — Get current user profile
- `PUT /api/auth/profile` — Update name, phone, or avatar
- `GET /api/user/addresses` — List saved delivery addresses
- `POST /api/user/addresses` — Add a new delivery address
- `GET /api/user/wishlist` — Get user's saved wishlist
- `POST /api/user/wishlist/toggle` — Add/remove item in wishlist

### Catalog & Categories
- `GET /api/categories` — List all 15 categories with subcategories
- `GET /api/products` — List products with filters (`category`, `subcategory`, `brand`, `minPrice`, `maxPrice`, `rating`, `inStock`, `sort`, `search`, `page`, `limit`)
- `GET /api/products/:slugOrId` — Get product details and reviews
- `GET /api/products/search/suggestions?q=...` — Live search auto-complete
- `POST /api/products/:id/reviews` — Submit verified customer review
- `GET /api/banners` — Get promotional hero banners

### Cart, Orders & Payments
- `GET /api/cart` — Get user's persistent cart and server totals
- `POST /api/cart/items` — Add product to cart with variants
- `PUT /api/cart/items/:itemId` — Update quantity
- `DELETE /api/cart/items/:itemId` — Remove item from cart
- `POST /api/cart/coupon` — Apply discount coupon
- `POST /api/orders` — Create new order with stock validation
- `GET /api/orders/myorders` — List user's orders
- `GET /api/orders/:id` — Get detailed order timeline
- `PUT /api/orders/:id/cancel` — Cancel eligible order
- `POST /api/payments/create-order` — Create Razorpay order
- `POST /api/payments/verify` — Verify cryptographic payment signature

### Admin Management (`/api/admin`)
- `GET /api/admin/stats` — Metrics overview (Revenue, Orders, Products, Users, Low-Stock)
- `GET /api/admin/orders` — List all customer orders with filters
- `PUT /api/admin/orders/:id/status` — Advance order status with lifecycle checks
- `POST /api/admin/products` — Create new product
- `PUT /api/admin/products/:id` — Update product details & inventory
- `DELETE /api/admin/products/:id` — Remove product from catalog
- `GET /api/admin/users` — Directory of registered customer accounts

### Vendor & Delivery Partner APIs
- `GET /api/vendor/products` — Manage seller-isolated catalog
- `GET /api/vendor/orders` — Manage seller-isolated order items
- `PUT /api/vendor/orders/:id/status` — Advance seller item to `Packed` / `Ready for pickup`
- `GET /api/delivery/my-deliveries` — List assigned shipments for courier
- `PUT /api/delivery/orders/:id/pickup` — Scan and confirm merchant hub pickup
- `PUT /api/delivery/orders/:id/status` — Update in-transit/out-for-delivery/delivery with 4-digit OTP

---

## 🧪 Automated Testing & Workflow Validation

CaSa includes an automated end-to-end validation suite executing all 18 lifecycle scenarios against MongoDB Atlas:
```powershell
node server/scripts/validateMarketplaceWorkflow.js
```

### Validated Test Scenarios:
1. Customer checkout with immutable purchase-time snapshots
2. Insufficient stock rejection
3. Multi-customer concurrency on last stock unit
4. Pending payment gateway verification
5. Cryptographic signature payment confirmation
6. Idempotent payment webhook processing
7. Strict multi-vendor tenant data isolation
8. Vendor packing and pickup requests
9. Admin delivery partner assignment and OTP issuance
10. Delivery partner barcode pickup scan confirmation
11. Real-time chronological tracking milestones
12. Doorstep 4-digit OTP delivery proof
13. Failed delivery reasons and next-day reattempts
14. Pre-dispatch cancellation with inventory re-crediting
15. 7-day doorstep return pickup and reverse logistics
16. Multi-vendor composite status recalculation
17. Real database queries for admin metrics
18. RBAC blocking unauthorized access with HTTP 403
19. Snapshot persistence and audit resilience across restarts

---

## 📖 Operational Documentation

For external gateway credential setup, courier dispatch configuration, and environment setup boundaries, see the [Integration and Setup Guide](docs/INTEGRATION_AND_SETUP.md).

---

## 📦 Production Build

To build the client for production deployment:
```bash
npm run build
```
The optimized assets will be generated in `client/dist/`.

---

## 📄 License
ISC License. Built for CASA E-Commerce Marketplace.
