import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  category_id: string | null;
  image_url: string;
  image_url_2: string | null;
  color: string | null;
  sizes: string[];
  tags: string[];
  rating: number;
  review_count: number;
  created_at: string;
  category?: Category;
};

export type CartItem = {
  id: string;
  product_id: string;
  size: string;
  quantity: number;
  created_at: string;
  product?: Product;
};
