# Footwear Shop Management System

A complete shop management system for footwear stores with inventory tracking, billing, and brand management.

## System Overview

This application runs 100% locally in your browser using localStorage for data persistence. No internet connection required after initial load.

## Features

### 1. Dashboard
- Real-time stock overview
- Total brands count
- Low stock alerts (items with ≤5 quantity)
- Daily sales summary
- Today's bills count

### 2. Stock Management
- Add new footwear with complete details
- Update existing stock
- Delete items
- Search by brand, size, color, or location
- Filter by category (Men/Women/Kids)
- Track location (Section/Rack/Shelf)

### 3. Billing / POS
- Quick item search and selection
- Shopping cart management
- Automatic GST calculation (adjustable %)
- Discount support
- Real-time stock reduction on bill generation
- Printable invoice generation

### 4. Brand Management
- Add/Edit/Delete brands
- View all categories and types
- Prevents deletion of brands with associated items

## Login Credentials

```
Username: admin
Password: admin123
```

## Data Storage

All data is stored locally in your browser's localStorage:
- Footwear inventory
- Brands
- Bills
- User authentication

**Important:** Data persists between sessions but is tied to your browser. Clearing browser data will erase all information.

## Categories & Types

**Categories:**
- Men
- Women
- Kids

**Types:**
- Sports
- Casual
- Formal
- Sandals
- Slippers

## Sample Data

The system comes with:
- 5 default brands (Nike, Adidas, Puma, Reebok, Bata)
- 3 sample footwear items
- 1 admin user

## Keyboard-Friendly Billing

The billing screen is optimized for fast POS operations:
- Tab navigation between fields
- Quick search with keyboard
- Enter to add items to cart

## Printing Invoices

Click "Print" on any invoice to print directly from your browser. The system automatically formats the invoice for printing.

## Browser Compatibility

Works on all modern browsers:
- Chrome
- Firefox
- Safari
- Edge

## Backup Your Data

To backup your data:
1. Open browser Developer Tools (F12)
2. Go to Application/Storage tab
3. Select Local Storage
4. Export the data

## Notes for Spring Boot Backend Integration

If you want to integrate with a Java Spring Boot backend later:

### Backend API Endpoints Needed:

```
GET    /api/footwear          - Get all footwear
POST   /api/footwear          - Add new footwear
PUT    /api/footwear/{id}     - Update footwear
DELETE /api/footwear/{id}     - Delete footwear

GET    /api/brands            - Get all brands
POST   /api/brands            - Add new brand
PUT    /api/brands/{id}       - Update brand
DELETE /api/brands/{id}       - Delete brand

GET    /api/bills             - Get all bills
POST   /api/bills             - Create new bill

POST   /api/auth/login        - User login
```

### PostgreSQL Schema:

```sql
CREATE TABLE brands (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE footwear (
    id VARCHAR(50) PRIMARY KEY,
    brand_id VARCHAR(50) REFERENCES brands(id),
    brand_name VARCHAR(100),
    category VARCHAR(20),
    type VARCHAR(20),
    size VARCHAR(10),
    color VARCHAR(50),
    section VARCHAR(10),
    rack VARCHAR(10),
    shelf VARCHAR(10),
    cost_price DECIMAL(10,2),
    selling_price DECIMAL(10,2),
    quantity INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE bills (
    id VARCHAR(50) PRIMARY KEY,
    bill_number VARCHAR(50) UNIQUE,
    subtotal DECIMAL(10,2),
    gst_percent DECIMAL(5,2),
    gst_amount DECIMAL(10,2),
    discount_percent DECIMAL(5,2),
    discount_amount DECIMAL(10,2),
    final_amount DECIMAL(10,2),
    created_at TIMESTAMP,
    created_by VARCHAR(100)
);

CREATE TABLE bill_items (
    id VARCHAR(50) PRIMARY KEY,
    bill_id VARCHAR(50) REFERENCES bills(id),
    footwear_id VARCHAR(50),
    brand_name VARCHAR(100),
    category VARCHAR(20),
    type VARCHAR(20),
    size VARCHAR(10),
    color VARCHAR(50),
    quantity INTEGER,
    price DECIMAL(10,2),
    total DECIMAL(10,2)
);

CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(255),
    name VARCHAR(100)
);
```

### Frontend Integration:

Replace the `storageService` calls with REST API calls to your Spring Boot backend. The data structures are already compatible with JSON serialization.

## Support

This is a local-first application designed for single-user shop management. All features work offline and data is stored locally for maximum speed and reliability.
