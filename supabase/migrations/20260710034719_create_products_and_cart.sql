/*
# Threadheads Clone - Products, Categories, and Cart Schema

1. New Tables
- `categories` — product categories (Oversized Tees, Classic Tees, Custom, etc.)
  - id (uuid, primary key)
  - name (text, not null)
  - slug (text, unique, not null)
  - description (text)
  - image_url (text)
  - created_at (timestamptz)
- `products` — individual products/tees
  - id (uuid, primary key)
  - name (text, not null)
  - slug (text, unique, not null)
  - description (text)
  - price (numeric, not null)
  - compare_at_price (numeric) — for sale items
  - category_id (uuid, references categories)
  - image_url (text, not null)
  - image_url_2 (text) — secondary/hover image
  - color (text)
  - sizes (text[]) — available sizes
  - tags (text[]) — e.g. ['new', 'bestseller']
  - rating (numeric, default 5)
  - review_count (integer, default 0)
  - created_at (timestamptz)
- `cart_items` — shopping cart for anonymous users
  - id (uuid, primary key)
  - product_id (uuid, references products)
  - size (text, not null)
  - quantity (integer, default 1)
  - created_at (timestamptz)

2. Security
- Enable RLS on all tables.
- All tables are public/shared (no auth) — use TO anon, authenticated with USING (true).
- This is a single-tenant storefront clone with no sign-in.

3. Notes
- Products use numeric price fields for accurate monetary values.
- The cart is anonymous (no user_id) since this is a storefront demo.
- Categories have slugs for URL-friendly routing.
*/

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_categories" ON categories;
CREATE POLICY "anon_select_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  price numeric(10,2) NOT NULL,
  compare_at_price numeric(10,2),
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  image_url text NOT NULL,
  image_url_2 text,
  color text,
  sizes text[] DEFAULT ARRAY['XS','S','M','L','XL','2XL','3XL','4XL'],
  tags text[] DEFAULT ARRAY[]::text[],
  rating numeric(2,1) DEFAULT 5.0,
  review_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_products" ON products;
CREATE POLICY "anon_select_products" ON products FOR SELECT
  TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size text NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_cart" ON cart_items;
CREATE POLICY "anon_select_cart" ON cart_items FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_cart" ON cart_items;
CREATE POLICY "anon_insert_cart" ON cart_items FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_cart" ON cart_items;
CREATE POLICY "anon_update_cart" ON cart_items FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_cart" ON cart_items;
CREATE POLICY "anon_delete_cart" ON cart_items FOR DELETE
  TO anon, authenticated USING (true);