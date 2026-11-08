# Brew & Bean - Artisanal Coffee & Ceramic Store ☕

A modern, responsive e-commerce web application designed for artisanal specialty coffee, hand-thrown ceramics, and brewing accessories.

## 🌟 Features

- **Multi-Page Architecture:**
  - `index.html` - Homepage with Hero section, curated origins, artisanal collections, and roasting ethics.
  - `shop.html` - Product catalog with live category filtering, roast profiles, and grid/list view toggle.
  - `product.html` - Rich product detail page with dynamic grind selector, ceramic color swatches, image gallery switcher, and tabs.
  - `cart.html` - Shopping bag with real-time quantity controls (+ / -), preference editing modal, promo code discount calculation, and order summary.
  - `checkout.html` - Multi-step secure checkout with payment method tabs (Apple Pay, Google Pay, Cards), delivery options, and order placement modal.
  - `about.html` - Brand story, ethical sourcing philosophy, and roastery craft.
  - `contact.html` - Contact page with inquiries form, studio hours, and locations.

- **Interactive Capabilities (`app.js`):**
  - Live Cart state management synced across pages.
  - Inline toast notification system.
  - **✏️ Live Edit Mode:** Click any headline, description, product title, or price to edit it directly in the browser, with one-click save to localStorage.

- **Styling:**
  - Tailwind CSS with custom earthy, warm artisanal coffee palette (`Playfair Display` & `Plus Jakarta Sans`).

## 🚀 How to Run Locally

You can run this project with any local HTTP server:

### Option 1: PHP (Built-in Server)
```bash
php -S localhost:8000
```
Then visit `http://localhost:8000`.

### Option 2: Python
```bash
python -m http.server 8000
```

### Option 3: Double click
On Windows, simply double-click `start-server.bat`.

---
© 2025 Brew & Bean. All rights reserved.
