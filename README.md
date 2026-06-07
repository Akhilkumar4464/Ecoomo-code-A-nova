# Ecoomo | Premium E-Commerce Platform

A premium full-stack E-Commerce application with a responsive React (Vite) frontend, Node.js + Express backend, and an intelligent database layer that supports both MongoDB and a self-contained local JSON file-based database fallback for instant execution.

## Features

- **Premium Design System**: Vanilla CSS styling with a sleek dark-themed layout, backdrop glassmorphism (`backdrop-filter`), smooth hover transitions, and customized scrollbars.
- **Dynamic Product Catalog**: Search, filter by category (All, Electronics, Accessories, Home Decors), and sort products (by Popularity, Price, or Rating) in real-time.
- **Interactive Sliding Cart**: Quantity controls, visual indicators, subtotal calculations, and item removals.
- **Real-time 3D Credit Card Simulation**: An interactive checkout form where input values (card number, holder name, expiry date, CVV) render dynamically onto a luxury mock card with glowing accents.
- **Confetti Payments Reward**: Celebrates order placement with an instant canvas-confetti blast on successful checkout.
- **Comprehensive Administration**: Admin panel allowing authorized users to create/delete products from the catalog and dispatch orders (mark as delivered).
- **User Order History**: Lists all orders placed, showing timestamps, statuses (Payment/Delivery), and items purchased.

---

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** (v9 or higher)

### Setup & Installation

1. **Install All Dependencies**:
   From the root of the project directory, run:
   ```bash
   npm run install-all
   ```
   This will install all dependencies in the root, the `backend`, and the `frontend` workspaces.

2. **Seed the Database**:
   Populate the database with initial products and user accounts:
   ```bash
   npm run seed --prefix backend
   ```
   *Note: If no `MONGODB_URI` is provided in `backend/.env`, it will automatically create and seed local files under `backend/data/`.*

3. **Start the Application**:
   Start both the backend server and frontend development server concurrently:
   ```bash
   npm run dev
   ```
   - Frontend client: [http://localhost:5173](http://localhost:5173)
   - Backend API: [http://localhost:5000](http://localhost:5000)

---

## Demo Credentials

You can test the application using the following pre-configured user credentials:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Customer** | `john@example.com` | `user123` | Browse, Add to Cart, Checkout, View Orders |
| **Administrator** | `admin@example.com` | `admin123` | All customer actions + Manage Catalog & Dispatch Orders |

---

## Database Fallback Architecture

To ensure zero setup, the backend includes a database adapter layer (`backend/src/config/db.js`).

- **With MongoDB**: Provide a `MONGODB_URI` in `backend/.env` (e.g. `MONGODB_URI=mongodb://localhost:27017/ecoomo`). The backend will automatically connect and use standard Mongoose schemas.
- **Without MongoDB (Default)**: Comment out or omit the `MONGODB_URI` variable. The backend uses a local file storage model (`backend/data/*.json`) with matching Mongoose API wrapper methods (`find`, `findOne`, `create`, `findByIdAndUpdate`, etc.), allowing full functionality right out-of-the-box.
