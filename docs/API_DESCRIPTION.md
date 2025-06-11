# E-Commerce API

A comprehensive REST API for managing online store operations including product catalog, user management, shopping cart, and order processing with role-based access control.

## 🛍️ Core Features

- **🛒 Product Catalog** - Manage products, categories, and inventory
- **👥 User Management** - Customer accounts and staff administration  
- **🛒 Shopping Cart** - Session-based cart functionality
- **💳 Order Processing** - Order creation, tracking, and management
- **🔐 Authentication** - Secure user authentication and authorization

## 🔐 Authentication

This API uses **JWT Bearer tokens** for secure authentication. All protected endpoints require proper authorization.

### Getting Started:

1. **Login** using the `POST /auth/signin` endpoint
2. **Include the token** in your requests:   
   ```
   Authorization: Bearer <your-access-token>
   ```
3. **Refresh tokens** when needed using `GET /auth/refresh`

## 👥 Roles & Permissions

| Role | Permissions | Access Level |
|------|-------------|--------------|
| **🔴 ADMIN** | Full system access | Full CRUD on all resources |
| **🟡 STAFF** | Operational access | Manage products, orders, view customer data |
| **🟢 CUSTOMER** | Customer access | View products, manage own cart and orders |

## 📖 API Usage

- **Base URL**: `http://localhost:8000/api/v1`
- **Documentation**: Available at `/docs`
- **Content-Type**: `application/json`
- **Authentication**: Bearer token in Authorization header
