/*
# Add color and design_data columns to cart_items

1. Changes
- Adds `color` (text) column to `cart_items` — stores the tee color name chosen during customization.
- Adds `design_data` (jsonb) column to `cart_items` — stores the full custom design (text, fonts, colors, sticker, background, uploaded image references).
2. Security
- No RLS policy changes. cart_items already has anon+authenticated CRUD policies.
3. Notes
- Both columns are nullable for backward compatibility with existing cart rows.
- Frontend sends these for custom-tee items; regular items leave them null.
*/

ALTER TABLE cart_items
  ADD COLUMN IF NOT EXISTS color text,
  ADD COLUMN IF NOT EXISTS design_data jsonb;
