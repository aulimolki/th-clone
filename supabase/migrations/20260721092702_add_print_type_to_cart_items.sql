/*
# Add print_type column to cart_items

1. Changes
- Adds `print_type` (text) column to `cart_items`.
- Defaults to 'DTG' (Direct-to-Garment). The other valid value is 'DTF' (Direct-to-Film).
- This lets customers on custom tee product pages choose their preferred print method.
2. Security
- No RLS policy changes. cart_items already has anon+authenticated CRUD policies (single-tenant, no auth).
3. Notes
- Column is nullable for backward compatibility with existing cart rows.
- Frontend will always send a value for new custom-tee items.
*/

ALTER TABLE cart_items
  ADD COLUMN IF NOT EXISTS print_type text DEFAULT 'DTG';
