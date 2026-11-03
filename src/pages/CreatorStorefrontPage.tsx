import { useState, useEffect } from 'react';
import { Store, Loader2, Instagram, Youtube, Twitter, ArrowLeft, Package } from 'lucide-react';
import { getCreatorBySlug, getPublishedCreatorProducts } from '../creator';
import { formatIdr } from '../currency';
import type { Creator, Product } from '../supabase';
import ProductCard from '../components/ProductCard';

export default function CreatorStorefrontPage({
  slug,
  onNavigate,
}: {
  slug: string;
  onNavigate: (path: string) => void;
}) {
  const [creator, setCreator] = useState<Creator | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const c = await getCreatorBySlug(slug);
      if (cancelled) return;
      if (!c) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setCreator(c);
      const prods = await getPublishedCreatorProducts(c.id);
      if (cancelled) return;
      setProducts(prods);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  if (notFound || !creator) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <Store size={48} className="mx-auto text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Store not found</h1>
          <p className="text-gray-500 mb-6">The store "{slug}" doesn't exist or hasn't been published yet.</p>
          <button
            onClick={() => onNavigate('#/')}
            className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const socialLinks = creator.social_links ?? {};

  return (
    <div className="min-h-screen bg-white">
      {/* Banner */}
      <div className="relative h-48 sm:h-64 lg:h-80 bg-gray-900 overflow-hidden">
        {creator.cover_url ? (
          <img src={creator.cover_url} alt={creator.name} className="w-full h-full object-cover opacity-90" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-800 via-gray-900 to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      {/* Store info */}
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16 sm:-mt-20 relative z-10">
          {/* Logo */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-4 border-white bg-gray-100 shadow-lg flex-shrink-0">
            {creator.avatar_url ? (
              <img src={creator.avatar_url} alt={creator.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-black flex items-center justify-center">
                <Store size={36} className="text-white" />
              </div>
            )}
          </div>

          {/* Name + meta */}
          <div className="flex-1 pb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{creator.name}</h1>
            {creator.bio && <p className="text-sm text-gray-500 mt-1 max-w-2xl">{creator.bio}</p>}
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <span>{creator.total_products} products</span>
              <span>{creator.followers} followers</span>
              <span>Member since {new Date(creator.member_since).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
            </div>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-2 pb-2">
            {socialLinks.instagram && (
              <a
                href={`https://instagram.com/${socialLinks.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-900 hover:text-white flex items-center justify-center transition-colors"
              >
                <Instagram size={16} />
              </a>
            )}
            {socialLinks.tiktok && (
              <a
                href={`https://tiktok.com/${socialLinks.tiktok.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-900 hover:text-white flex items-center justify-center transition-colors"
              >
                <Youtube size={16} />
              </a>
            )}
            {socialLinks.website && (
              <a
                href={socialLinks.website}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-900 hover:text-white flex items-center justify-center transition-colors"
              >
                <Twitter size={16} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Products grid */}
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-10">
        <h2 className="text-lg font-bold text-gray-900 mb-6">All Products</h2>
        {products.length === 0 ? (
          <div className="text-center py-16">
            <Package size={48} className="mx-auto text-gray-200 mb-3" />
            <p className="text-sm text-gray-400">This store doesn't have any published products yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </div>

      {/* Back to home */}
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 pb-12">
        <button
          onClick={() => onNavigate('#/')}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={16} /> Back to CCC
        </button>
      </div>
    </div>
  );
}
