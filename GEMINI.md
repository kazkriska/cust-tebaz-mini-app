# GEMINI.md - TeBaz Customer Mini App Foundations

This document contains foundational mandates and architectural standards for the TeBaz Customer Mini App. These instructions take absolute precedence over general defaults.

## 1. Technical Mandates
- **Framework:** Next.js (App Router), JavaScript, Tailwind CSS 4.
- **Styling:** Mobile-First. Use rounded corners (`2xl`/`3xl`), large touch targets (`py-4`/`py-5`), and a Zinc/Black palette.
- **Telegram Integration:**
  - Use `https://telegram.org/js/telegram-web-app.js`.
  - Use `'use client'` for components accessing `window.Telegram`.
  - Always call `tg.expand()` on initialization.
  - **Mandatory Username:** Access MUST be blocked if `tg.initDataUnsafe.user.username` is missing. Prompt user to set a username.
- **Identity:** `tg_id` from Telegram WebApp API is the source of truth.

## 2. Core Logic & Data Sync
- **Data Synchronization:** Every landing on the main page MUST sync the `customers` table using `tg_id`:
  1. Check `customers` table for `tg_id`.
  2. If found, compare `username`, `first_name`, and `last_name`.
  3. If any field differs, update the database record.
  4. If not found, create a new customer record.
- **Cart Management:** One active cart per customer per shop. Carts are shop-specific. Use `getCartByCustomerAndShop` logic.

## 3. Database & Shared Utilities
- **Database:** Use `@/lib/db.js` for the connection pool.
- **Images:** Use `getPublicImageUrl` from `@/lib/image-utils.js` for S3 URLs.
- **Models:** Re-use or mirror logic from: `src/models/customers.js`, `src/models/carts.js`, `src/models/products.js`, etc.

## 4. UI/UX Standards
- **Loading:** Centralized loading spinner (see `src/app/page.js` in vendor app).
- **Errors:** Standard error card with Amber/Red text for Telegram-related errors.
- **Buttons:** `bg-black` (primary), `bg-white` + `border-zinc-200` (secondary).
- **Dark Mode:** Support `dark:bg-black` and `dark:text-white` using Tailwind classes.

## 5. Security
- Never expose `access_pin_hash` to the client.
- Always use `tg_id` as the source of truth for identification.
