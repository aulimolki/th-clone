import { useState } from 'react';
import { Star, ShoppingBag } from 'lucide-react';
import { type Product } from '../supabase';
import { useCart } from '../cart';

type Props = {
  product: Product;
  onNavigate: (path: string) => void;
};

export default function ProductCard({ product, onNavigate }: Props) {
  const { addToCart } = useCart();
  const [hovered, setHovered] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.sizes || product.sizes.length === 0) return;
    setAdding(true);
    await addToCart(product, product.sizes.find((s) => s === 'M') ?? product.sizes[0]);
    setAdding(false);
  };

  const isNew = product.tags?.includes('new');
  const isBestseller = product.tags?.includes('bestseller');
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
    : 0;

  return (
    <div
      className="group cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onNavigate(`#/product/${product.slug}`)}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden mb-3">
        <img
          src={hovered && product.image_url_2 ? product.image_url_2 : product.image_url}
          alt={product.name}
          className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = product.image_url;
          }}
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {isNew && (
            <span className="bg-white text-black text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
              New
            </span>
          )}
          {isBestseller && (
            <span className="bg-black text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
              Bestseller
            </span>
          )}
          {hasDiscount && (
            <span className="bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
              -{discountPct}%
            </span>
          )}
        </div>

        {/* Quick add */}
        <button
          onClick={handleQuickAdd}
          disabled={adding}
          className={`absolute bottom-3 left-3 right-3 bg-white text-black text-xs font-bold uppercase tracking-wide py-2.5 flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-all duration-200 ${
            hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}
        >
          <ShoppingBag size={14} />
          {adding ? 'Adding...' : 'Quick Add'}
        </button>
      </div>

      {/* Info */}
      <div className="space-y-1">
        <div className="flex items-center gap-1">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={11}
                className={
                  i < Math.round(product.rating)
                    ? 'fill-black text-black'
                    : 'fill-gray-200 text-gray-200'
                }
              />
            ))}
          </div>
          <span className="text-[11px] text-gray-400">({product.review_count})</span>
        </div>

        <h3 className="text-sm font-medium leading-tight truncate">
          {product.name}
        </h3>

        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">${product.price.toFixed(2)}</span>
          {hasDiscount && (
            <span className="text-sm text-gray-400 line-through">
              ${product.compare_at_price!.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
