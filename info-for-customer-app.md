# TeBaz (Telegram Bazaar) - Customer App Implementation Guide

This document provides the architectural standards, patterns, and logic used in the TeBaz vendor app, which MUST be followed for the development of the separate Customer App to ensure consistency across the ecosystem.

## 1. Technical Stack
- **Framework:** Next.js (App Router)
- **Language:** JavaScript
- **Styling:** Tailwind CSS 4 (Mobile-First approach)
- **Database:** PostgreSQL (shared with vendor app)
- **Storage:** S3-compatible storage for images
- **Integration:** Telegram Web Apps API (`https://telegram.org/js/telegram-web-app.js`)

## 2. Core Standards & Constraints

### Mobile-First Design
The app is exclusively for Telegram Mini App usage. Use rounded corners (2xl/3xl), large touch targets (buttons should be `py-4` or `py-5`), and a clean, modern aesthetic (Zinc/Black palette).

### Telegram WebApp Initialization
All pages requiring user data must use `window.Telegram.WebApp`.
- Use `'use client'` for components accessing `window.Telegram`.
- Always call `tg.expand()` on initialization.
- **Username Constraint:** Access MUST be blocked if `tg.initDataUnsafe.user.username` is missing. Prompt the user to set a username in Telegram settings.

### Data Synchronization (Crucial)
Every time the user lands on the main page, their data must be synced with the database based on their `tg_id`:
1. Check `customers` table for `tg_id`.
2. If found, compare `username`, `first_name`, and `last_name`.
3. If any field differs, update the database record to match Telegram's current data.
4. If not found, create a new customer record.

## 3. Database Schema Overview (Relevant to Customers)
The database is already structured to support customers. Key tables:
- `customers`: Stores user profile and `tg_id`.
- `shops`: Stores shop details (Customer App will browse these).
- `products` & `product_prices`: Products have tiered pricing (e.g., "1kg - $10", "5kg - $45").
- `carts` & `cart_items`: One active cart per customer per shop.
- `orders` & `order_items`: Created when a customer checks out a cart.

## 4. Key Workflows for Customer App

### A. Shop Discovery
- Fetch all active shops from the `shops` table.
- Display shops with their `banner_url`, `name`, and `description`.

### B. Product Browsing
- View products by `shop_id`.
- Support category filtering (via `categories` table).
- Display tiered pricing for each product.

### C. Cart Management
- Carts are shop-specific. A customer can have multiple carts, but only one per shop.
- Use the `getCartByCustomerAndShop` logic.
- Adding to cart: Create cart if not exists, then add/update `cart_items`.

### D. Ordering
- Checkout process: Convert an active cart to an order.
- Status flow: `pending` (default) -> `confirmed`/`shipped`/`delivered` (updated by vendor).

## 5. UI/UX Guidelines
- **Loading States:** Use a centralized loading spinner (see `src/app/page.js` in vendor app).
- **Error States:** Use the standard error card with Amber/Red text for Telegram-related errors.
- **Buttons:** Use `bg-black` for primary actions and `bg-white` with `border-zinc-200` for secondary actions.
- **Dark Mode:** Support `dark:bg-black` and `dark:text-white` using Tailwind's standard classes.

## 6. Shared Utilities & Models
- **Database:** Use `@/lib/db.js` for the connection pool.
- **Images:** Use `getPublicImageUrl` from `@/lib/image-utils.js` to resolve S3 URLs.
- **Models:** Re-use or mirror logic from `src/models/customers.js`, `src/models/carts.js`, `src/models/products.js`, etc.

## 7. Security
- Never expose `access_pin_hash` to the client.
- Always use `tg_id` from the WebApp API as the source of truth for user identification.
