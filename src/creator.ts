import { supabase, type Creator, type Product } from './supabase';

export type StoreStatus = 'not_registered' | 'draft' | 'pending_review' | 'active' | 'rejected' | 'suspended';

export const BLANK_PRODUCTS = [
  { slug: 'custom-classic-tee', name: 'Classic Tee', baseCost: 90000 },
  { slug: 'custom-oversized-tee', name: 'Oversized Tee', baseCost: 105000 },
  { slug: 'custom-bootleg-tee', name: 'Bootleg Tee', baseCost: 110000 },
] as const;

export const PLATFORM_FEE_RATE = 0.05;
export const PAYMENT_FEE_RATE = 0.022;
export const PACKAGING_COST = 5000;

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30);
}

export function isSlugAvailable(slug: string): Promise<boolean> {
  return supabase
    .from('creators')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()
    .then(({ data }) => !data);
}

export async function getCreatorByUserId(userId: string): Promise<Creator | null> {
  const { data } = await supabase
    .from('creators')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  return data as Creator | null;
}

export async function getCreatorBySlug(slug: string): Promise<Creator | null> {
  const { data } = await supabase
    .from('creators')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  return data as Creator | null;
}

export async function getCreatorProducts(creatorId: string): Promise<Product[]> {
  const { data } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('creator_id', creatorId)
    .order('created_at', { ascending: false });
  return (data ?? []) as unknown as Product[];
}

export async function getPublishedCreatorProducts(creatorId: string): Promise<Product[]> {
  const { data } = await supabase
    .from('products')
    .select('*, category:categories(*)')
    .eq('creator_id', creatorId)
    .eq('is_published', true)
    .order('created_at', { ascending: false });
  return (data ?? []) as unknown as Product[];
}

export type PriceBreakdown = {
  retailPrice: number;
  baseCost: number;
  packagingCost: number;
  paymentFee: number;
  platformFee: number;
  creatorEarnings: number;
};

export function calculateEarnings(retailPrice: number, baseCost: number): PriceBreakdown {
  const packagingCost = PACKAGING_COST;
  const paymentFee = Math.round(retailPrice * PAYMENT_FEE_RATE);
  const platformFee = Math.round((retailPrice - baseCost - packagingCost) * PLATFORM_FEE_RATE);
  const creatorEarnings = Math.max(0, retailPrice - baseCost - packagingCost - paymentFee - platformFee);
  return { retailPrice, baseCost, packagingCost, paymentFee, platformFee, creatorEarnings };
}

export type CreatorStats = {
  totalProducts: number;
  publishedProducts: number;
  totalSales: number;
  totalRevenue: number;
  totalEarnings: number;
};

export async function getCreatorStats(creatorId: string): Promise<CreatorStats> {
  const { data: products } = await supabase
    .from('products')
    .select('id, price, base_cost, is_published')
    .eq('creator_id', creatorId);

  const allProducts = products ?? [];
  const published = allProducts.filter((p) => p.is_published);

  return {
    totalProducts: allProducts.length,
    publishedProducts: published.length,
    totalSales: 0,
    totalRevenue: 0,
    totalEarnings: 0,
  };
}
