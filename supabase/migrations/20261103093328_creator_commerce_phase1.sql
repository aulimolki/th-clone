/*
# Creator Commerce Phase 1: Store & Product Foundation

## Purpose
Transforms the existing single-tenant storefront into a creator marketplace.
Adds the database infrastructure for creator-linked auth, product publishing
with design data, and owner-scoped access control.

## Changes

### 1. creators table — link to auth
- Add `user_id` column (uuid, defaults to auth.uid()) linking each creator
  store to the authenticated user who owns it.
- Add `status` column (text, default 'active') for store lifecycle states.
- Add unique index on user_id so each user can only have one store.
- Tighten RLS: keep public SELECT (storefronts are browsable by anyone),
  add authenticated INSERT/UPDATE/DELETE scoped to the owner via auth.uid().
- Revoke write grants from anon.

### 2. products table — creator commerce columns
- Add `design_data` (jsonb) — the serialized design from the CustomizePage editor.
- Add `base_cost` (numeric) — production cost CCC charges the creator.
- Add `is_published` (boolean, default true) — draft vs published products.
- Add `blank_slug` (text) — which blank garment the design is printed on
  (e.g. 'custom-classic-tee').
- Tighten RLS: replace the open SELECT policy with one that shows published
  products to everyone and drafts only to the owning creator. Add
  authenticated INSERT/UPDATE/DELETE scoped through creators.user_id.
- Revoke write grants from anon.

### 3. profiles table — allow self-insert
- Add INSERT policy so a newly signed-up user can create their own profile row.
  Previously only SELECT/UPDATE existed, which meant profiles had to be created
  server-side; now the frontend can create them after signup.

## Security
- creators: public SELECT, owner-scoped write (auth.uid() = user_id)
- products: public SELECT on published rows, owner-scoped SELECT on drafts,
  owner-scoped write via creators join
- profiles: owner-scoped INSERT/SELECT/UPDATE
- anon role: SELECT only on creators, products (published), categories,
  collections, product_reviews, cart_items; no write access on creators/products
*/

-- ─── 1. creators: add user_id + status + tighten RLS ─────────────

ALTER TABLE creators
  ADD COLUMN IF NOT EXISTS user_id uuid DEFAULT auth.uid(),
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- Each user can own at most one creator store
CREATE UNIQUE INDEX IF NOT EXISTS creators_user_id_idx
  ON creators (user_id) WHERE user_id IS NOT NULL;

-- Revoke write from anon (keep SELECT)
REVOKE INSERT, UPDATE, DELETE ON creators FROM anon;

-- Drop old open SELECT policy and recreate
DROP POLICY IF EXISTS "anon_select_creators" ON creators;
CREATE POLICY "select_creators_public" ON creators FOR SELECT
  TO anon, authenticated USING (true);

-- Owner-scoped write policies
DROP POLICY IF EXISTS "insert_own_creator" ON creators;
CREATE POLICY "insert_own_creator" ON creators FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_creator" ON creators;
CREATE POLICY "update_own_creator" ON creators FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_creator" ON creators;
CREATE POLICY "delete_own_creator" ON creators FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ─── 2. products: add commerce columns + tighten RLS ────────────

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS design_data jsonb,
  ADD COLUMN IF NOT EXISTS base_cost numeric(10,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS blank_slug text;

-- Index for filtering by creator
CREATE INDEX IF NOT EXISTS products_creator_id_idx ON products (creator_id);
-- Index for filtering published products on the storefront
CREATE INDEX IF NOT EXISTS products_published_idx ON products (is_published) WHERE is_published = true;

-- Revoke write from anon (keep SELECT)
REVOKE INSERT, UPDATE, DELETE ON products FROM anon;

-- Replace open SELECT with published-or-owner policy
DROP POLICY IF EXISTS "anon_select_products" ON products;
CREATE POLICY "select_products" ON products FOR SELECT
  TO anon, authenticated
  USING (
    is_published = true
    OR EXISTS (
      SELECT 1 FROM creators c
      WHERE c.id = products.creator_id
        AND c.user_id = auth.uid()
    )
  );

-- Creator-scoped write: a user can insert/update/delete products for
-- creator stores they own
DROP POLICY IF EXISTS "insert_own_products" ON products;
CREATE POLICY "insert_own_products" ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    creator_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM creators c
      WHERE c.id = products.creator_id
        AND c.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "update_own_products" ON products;
CREATE POLICY "update_own_products" ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM creators c
      WHERE c.id = products.creator_id
        AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM creators c
      WHERE c.id = products.creator_id
        AND c.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "delete_own_products" ON products;
CREATE POLICY "delete_own_products" ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM creators c
      WHERE c.id = products.creator_id
        AND c.user_id = auth.uid()
    )
  );

-- ─── 3. profiles: allow self-insert ──────────────────────────────

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);