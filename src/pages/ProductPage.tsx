import { useEffect, useState } from 'react';
import {
  Star, ShoppingBag, Truck, RefreshCw, Globe, ChevronRight,
  Minus, Plus, Check,
} from 'lucide-react';
import { supabase, type Product } from '../supabase';
import { useCart } from '../cart';
import ProductCard from '../components/ProductCard';

type Props = {
  slug: string;
  onNavigate: (path: string) => void;
};

export default function ProductPage({ slug, onNavigate }: Props) {
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [sizeError, setSizeError] = useState(false);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    (async () => {
      setLoading(true);
      setActiveImage(0);
      setSelectedSize(null);
      setQuantity(1);
      const { data } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('slug', slug)
        .maybeSingle();
      if (data) {
        setProduct(data as unknown as Product);
        const { data: rel } = await supabase
          .from('products')
          .select('*, category:categories(*)')
          .eq('category_id', (data as unknown as Product).category_id)
          .neq('id', (data as unknown as Product).id)
          .limit(4);
        setRelated((rel as unknown as Product[]) ?? []);
      }
      setLoading(false);
      window.scrollTo(0, 0);
    })();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product) return;
    if (!selectedSize) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    await addToCart(product, selectedSize, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 3000);
  };

  if (loading) {
    return (
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-[3/4] bg-gray-100 animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-100 animate-pulse w-3/4" />
            <div className="h-6 bg-gray-100 animate-pulse w-1/4" />
            <div className="h-32 bg-gray-100 animate-pulse" />
            <div className="h-12 bg-gray-100 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-[1600px] mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 mb-4">Product not found.</p>
        <button
          onClick={() => onNavigate('#/')}
          className="underline font-medium"
        >
          Back to home
        </button>
      </div>
    );
  }

  const images = [product.image_url, product.image_url_2].filter(
    (x): x is string => !!x,
  );
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-4">
        <nav className="flex items-center gap-1 text-xs text-gray-500">
          <button onClick={() => onNavigate('#/')} className="hover:opacity-60">
            Home
          </button>
          <ChevronRight size={12} />
          {product.category && (
            <>
              <button
                onClick={() => onNavigate(`#/collections/${product.category!.slug}`)}
                className="hover:opacity-60"
              >
                {product.category.name}
              </button>
              <ChevronRight size={12} />
            </>
          )}
          <span className="text-black truncate">{product.name}</span>
        </nav>
      </div>

      {/* Product section */}
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 pb-12">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <div>
            <div className="aspect-[3/4] bg-gray-100 overflow-hidden mb-3">
              <img
                src={images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-24 overflow-hidden border-2 transition-colors ${
                      activeImage === i ? 'border-black' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="md:pt-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < Math.round(product.rating)
                        ? 'fill-black text-black'
                        : 'fill-gray-200 text-gray-200'
                    }
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {product.rating} ({product.review_count} reviews)
              </span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-3">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-gray-400 line-through">
                    ${product.compare_at_price!.toFixed(2)}
                  </span>
                  <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5">
                    SAVE ${(product.compare_at_price! - product.price).toFixed(2)}
                  </span>
                </>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Size selector */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold uppercase tracking-wide">
                  Select Size
                </span>
                <button className="text-xs underline text-gray-500">
                  Size Guide
                </button>
              </div>
              {sizeError && (
                <p className="text-xs text-red-600 mb-2">Please select a size</p>
              )}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {product.sizes?.map((size) => (
                  <button
                    key={size}
                    onClick={() => {
                      setSelectedSize(size);
                      setSizeError(false);
                    }}
                    className={`py-3 text-sm font-medium border transition-all ${
                      selectedSize === size
                        ? 'border-black bg-black text-white'
                        : 'border-gray-200 hover:border-black'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <span className="text-sm font-bold uppercase tracking-wide mb-2 block">
                Quantity
              </span>
              <div className="flex items-center border border-gray-200 w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-3 hover:bg-gray-50"
                >
                  <Minus size={16} />
                </button>
                <span className="px-6 text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-3 hover:bg-gray-50"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              className={`w-full py-4 text-sm font-bold uppercase tracking-wide transition-all flex items-center justify-center gap-2 mb-3 ${
                added
                  ? 'bg-green-600 text-white'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {added ? (
                <>
                  <Check size={18} /> Added to Cart
                </>
              ) : (
                <>
                  <ShoppingBag size={18} /> Add to Cart — $
                  {(product.price * quantity).toFixed(2)}
                </>
              )}
            </button>
            <button className="w-full py-4 text-sm font-bold uppercase tracking-wide border-2 border-black hover:bg-black hover:text-white transition-colors">
              Buy It Now
            </button>

            {/* Features */}
            <div className="mt-8 space-y-3 border-t border-gray-100 pt-6">
              {[
                { icon: Truck, text: 'Free US shipping over $90' },
                { icon: RefreshCw, text: 'Exchanges or store credit within 60 days' },
                { icon: Globe, text: 'Printed in Australia, US & Europe — ships in 2-3 days' },
              ].map((f) => (
                <div key={f.text} className="flex items-center gap-3">
                  <f.icon size={20} strokeWidth={1.5} />
                  <span className="text-sm text-gray-600">{f.text}</span>
                </div>
              ))}
            </div>

            {/* Details accordion */}
            <div className="mt-8 space-y-2">
              <details className="border-b border-gray-100 pb-3" open>
                <summary className="text-sm font-bold uppercase tracking-wide cursor-pointer py-2">
                  Product Details
                </summary>
                <ul className="text-sm text-gray-600 space-y-1 mt-2 ml-1">
                  <li>Designed by Threadheads</li>
                  <li>100% combed cotton</li>
                  <li>Heavyweight 275gsm fabric</li>
                  <li>90s-inspired boxy fit with dropped shoulders</li>
                  <li>Unisex fit</li>
                  <li>Made to order, printed in-house</li>
                  {product.color && <li>Color: {product.color}</li>}
                </ul>
              </details>
              <details className="border-b border-gray-100 pb-3">
                <summary className="text-sm font-bold uppercase tracking-wide cursor-pointer py-2">
                  Shipping & Returns
                </summary>
                <p className="text-sm text-gray-600 mt-2">
                  Every order is made to order and printed in 2-3 business days from
                  local facilities in Australia, the US and Europe. We offer exchanges
                  or store credit on unworn items for up to 60 days after purchase.
                </p>
              </details>
            </div>
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="max-w-[1600px] mx-auto px-4 lg:px-8 py-12 border-t border-gray-100">
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight mb-8">
            You May Also Like
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
