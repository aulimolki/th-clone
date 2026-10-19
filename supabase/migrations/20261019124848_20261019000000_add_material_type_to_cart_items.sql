/*
# Add material type to custom tee cart items

1. Modified Tables
- `cart_items`
- Adds `material_type` (text, nullable) to store the selected blank tee material for custom tee orders.
- Existing cart rows remain valid because the new column is optional and has no default.

2. Application Behavior
- New custom tee selections can be saved alongside the existing print type, color, and design data.
- The two supported storefront options are Premium Heavyweight and Standard; validation remains in the application UI.

3. Security
- No new tables or policies are introduced.
- Existing anonymous and authenticated cart CRUD policies continue to cover the new column.

4. Data Safety
- This migration only adds a nullable column and does not alter or remove existing data.
*/

ALTER TABLE cart_items
  ADD COLUMN IF NOT EXISTS material_type text;
