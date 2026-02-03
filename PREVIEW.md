# Broastify - Preview Guide 🍔

**"Midnight Crimson" Premium QR Ordering System**

## 🚀 Quick Start (One Command)
To start the application and automatically open the Customer Menu:

```bash
npm run dev
```

> The browser should open automatically to: http://localhost:3000/menu/1

**IMPORTANT**: This is a Next.js application. There are NO `.html` files in the source code. The HTML is generated dynamically. Do not look for `index.html`.

---

## 📱 Page Guide

### 1. Customer Menu (Guest View)
**URL**: `http://localhost:3000/menu/1`
- **What to test**:
    - Browse "Midnight Smash Burger" and other items.
    - Filter by categories (Burger, Broast, Shake).
    - Add items to cart (watch the FAB counter update).
    - Open Cart (FAB) and "Place Order".
- **Note**: `tableId` is dynamic. Try `/menu/2` to simulate another table!

### 2. Admin Command Center (Kitchen View)
**URL**: `http://localhost:3000/admin`
- **What to test**:
   - View live order cards.
   - **Color logic**:
     - 🟢 Green: New Order (<10m)
     - 🟡 Yellow: Warning (>10m)
     - 🔴 Red: Critical (>20m)
   - Cards simulate "Time Elapsed" to show this color shift.

### 3. Landing Page
**URL**: `http://localhost:3000`
- A portal to easily navigate between the Guest Menu and Admin Dashboard.

---

## 🛠 Project Structure
- `src/components/menu`: Customer-facing components (ProductCard).
- `src/components/admin`: Admin dashboard components.
- `src/components/cart`: Shopping cart logic.
- `src/lib/data.ts`: Mock database (edit this to change menu items).
