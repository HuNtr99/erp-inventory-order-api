# ERP Inventory & Order Management REST API

A lightweight, scalable backend REST API for **Enterprise Resource Planning (ERP)** inventory tracking and automated sales order processing, built with **Node.js**, **Express.js**, and **Supabase (PostgreSQL)**.

---

## ⚡ Core Features

- **Product Inventory Management:** Full CRUD operations for product catalogs, SKU tracking, category management, and unit pricing.
- **Automated Sales Order Processing:**
  - Multi-item checkout handling with relational line items.
  - Automatic stock validation: Rejects orders when requested quantity exceeds available stock.
  - Real-time stock decrement: Automatically deducts purchased inventory upon order placement.
  - Total amount calculation computed server-side.
- **Relational Cloud Database:** Backed by Supabase PostgreSQL with relational joins (`orders` $\\leftrightarrow$ `order_items`).
- **CORS-Enabled:** Ready for seamless integration with frontend dashboards (React, Vue, mobile apps).

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js 5
- **Database & Cloud:** Supabase (PostgreSQL)
- **Client Library:** `@supabase/supabase-js`
- **Security:** `dotenv` configuration, environment secrets isolation

---

## 📖 API Endpoints

### Products (`/products`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/products` | Retrieve all inventory products |
| `POST` | `/products` | Create a new product (`sku`, `name`, `unit_price`, `quantity`, etc.) |
| `PUT` | `/products/:id` | Update product details or stock count |
| `DELETE` | `/products/:id` | Remove a product from inventory |

### Orders & Sales (`/orders`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/orders` | Place order, validate stock, compute total, and decrement inventory |
| `GET` | `/orders` | Retrieve order history with joined order items |

#### Example Order Request Body
```json
{
  "customer_name": "Alice Johnson",
  "items": [
    { "product_id": "prod_101", "quantity": 2 },
    { "product_id": "prod_204", "quantity": 1 }
  ]
}
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- A **Supabase** account and project

### 2. Installation
```bash
git clone https://github.com/HuNtr99/erp-inventory-order-api.git
cd erp-inventory-order-api
npm install
```

### 3. Configure Environment Variables
Copy the sample environment file and provide your Supabase credentials:
```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-key
```

### 4. Run the Server
```bash
npm start
```
Server runs on: `http://localhost:3000`
