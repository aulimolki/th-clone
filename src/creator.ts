import { supabase, type Creator, type DesignData, type Product } from './supabase';

export type StoreStatus = 'not_registered' | 'draft' | 'pending_review' | 'active' | 'rejected' | 'suspended';

export const BLANK_PRODUCTS = [
  { slug: 'custom-classic-tee', name: 'Classic Tee', baseCost: 90000, desc: 'Regular fit cotton tee' },
  { slug: 'custom-oversized-tee', name: 'Oversized Tee', baseCost: 105000, desc: 'Drop shoulder oversized fit' },
  { slug: 'custom-bootleg-tee', name: 'Bootleg Tee', baseCost: 110000, desc: 'Boxy heavyweight tee' },
] as const;

export const PLATFORM_FEE_RATE = 0.05;
export const PAYMENT_FEE_RATE = 0.022;
export const PACKAGING_COST = 5000;
export const MIN_CREATOR_EARNINGS = 10000;

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

export async function isSlugAvailable(slug: string): Promise<boolean> {
  const { data } = await supabase
    .from('creators')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();
  return !data;
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

export function getBaseCost(blankSlug: string): number | null {
  const blank = BLANK_PRODUCTS.find((b) => b.slug === blankSlug);
  return blank ? blank.baseCost : null;
}

export function getMinimumRetailPrice(baseCost: number): number {
  const fixedCosts = baseCost + PACKAGING_COST;
  const raw =
    (MIN_CREATOR_EARNINGS + fixedCosts * (1 - PLATFORM_FEE_RATE)) /
    (1 - PAYMENT_FEE_RATE - PLATFORM_FEE_RATE);
  return Math.ceil(raw / 1000) * 1000;
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
  const creatorEarnings = retailPrice - baseCost - packagingCost - paymentFee - platformFee;
  return { retailPrice, baseCost, packagingCost, paymentFee, platformFee, creatorEarnings };
}

export type CreatorProductInput = {
  name: string;
  description: string;
  price: number;
  isPublished: boolean;
};

function generateProductSlug(name: string): string {
  const base = slugify(name) || 'product';
  return `${base}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function createCreatorProduct(params: {
  creator: Creator;
  blank: Product;
  baseCost: number;
  design: DesignData;
  input: CreatorProductInput;
}): Promise<{ error: string | null }> {
  const { creator, blank, baseCost, design, input } = params;
  const { error } = await supabase.from('products').insert({
    name: input.name,
    slug: generateProductSlug(input.name),
    description: input.description || null,
    price: input.price,
    compare_at_price: null,
    category_id: null,
    image_url: blank.image_url,
    image_url_2: null,
    color: design.color,
    sizes: blank.sizes,
    tags: [],
    rating: 0,
    review_count: 0,
    material: design.materialType ?? null,
    creator_id: creator.id,
    design_data: design,
    base_cost: baseCost,
    is_published: input.isPublished,
    blank_slug: blank.slug,
  });
  return { error: error?.message ?? null };
}

export async function updateCreatorProduct(
  productId: string,
  input: CreatorProductInput,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('products')
    .update({
      name: input.name,
      description: input.description || null,
      price: input.price,
      is_published: input.isPublished,
    })
    .eq('id', productId);
  return { error: error?.message ?? null };
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
