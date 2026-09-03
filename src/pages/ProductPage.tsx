import { useEffect, useState } from 'react';
import { Star, Truck, RefreshCw, Globe, ChevronRight, Sparkles, Pencil, CheckCircle2, ThumbsUp, ThumbsDown, Play, ChevronDown } from 'lucide-react';
import { supabase, type Product, type PrintType } from '../supabase';
import ProductCard from '../components/ProductCard';

type Props = {
  slug: string;
  onNavigate: (path: string) => void;
};

const TEE_COLORS = [
  { name: 'White', hex: '#ffffff' },
  { name: 'Black', hex: '#111111' },
  { name: 'Navy', hex: '#1e2a4a' },
  { name: 'Gray', hex: '#9ca3af' },
  { name: 'Red', hex: '#c8312b' },
  { name: 'Blue', hex: '#2563eb' },
  { name: 'Green', hex: '#1f8a4c' },
];

export default function ProductPage({ slug, onNavigate }: Props) {
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [printType, setPrintType] = useState<PrintType>('DTG');
  const [color, setColor] = useState('White');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setActiveImage(0);
      setColor('White');
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

  const handleCustomize = () => {
    onNavigate(`#/customize/${slug}`);
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
        <button onClick={() => onNavigate('#/')} className="underline font-medium">Back to home</button>
      </div>
    );
  }

  const images = [product.image_url, product.image_url_2].filter((x): x is string => !!x);
  const hasDiscount = product.compare_at_price && product.compare_at_price > product.price;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-4">
        <nav className="flex items-center gap-1 text-xs text-gray-500">
          <button onClick={() => onNavigate('#/')} className="hover:opacity-60">Home</button>
          <ChevronRight size={12} />
          {product.category && (
            <>
              <button onClick={() => onNavigate(`#/collections/${product.category!.slug}`)} className="hover:opacity-60">
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
              <img src={images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-24 overflow-hidden border-2 transition-colors ${activeImage === i ? 'border-black' : 'border-transparent'}`}
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
                  <Star key={i} size={14} className={i < Math.round(product.rating) ? 'fill-black text-black' : 'fill-gray-200 text-gray-200'} />
                ))}
              </div>
              <span className="text-sm text-gray-500">{product.rating} ({product.review_count} reviews)</span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-3">{product.name}</h1>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl font-bold">${product.price.toFixed(2)}</span>
              {hasDiscount && (
                <>
                  <span className="text-lg text-gray-400 line-through">${product.compare_at_price!.toFixed(2)}</span>
                  <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5">SAVE ${(product.compare_at_price! - product.price).toFixed(2)}</span>
                </>
              )}
            </div>

            <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

            {/* Print type selector */}
            <div className="mb-6">
              <span className="text-sm font-bold uppercase tracking-wide mb-2 block">Print Type</span>
              <div className="grid grid-cols-2 gap-2">
                {(['DTG', 'DTF'] as PrintType[]).map((pt) => (
                  <button
                    key={pt}
                    onClick={() => setPrintType(pt)}
                    className={`py-3 text-sm font-medium border transition-all ${printType === pt ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-black'}`}
                  >
                    <div className="font-bold">{pt}</div>
                    <div className="text-[10px] font-normal opacity-80 mt-0.5">{pt === 'DTG' ? 'Direct-to-Garment' : 'Direct-to-Film'}</div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {printType === 'DTG' ? 'DTG prints water-based ink directly into the fabric for a soft, breathable feel.' : 'DTF uses a printed film transferred with heat for vibrant colors and works on any fabric.'}
              </p>
            </div>

            {/* Color selector */}
            <div className="mb-6">
              <span className="text-sm font-bold uppercase tracking-wide mb-3 block">Color — <span className="font-normal normal-case">{color}</span></span>
              <div className="flex flex-wrap gap-3">
                {TEE_COLORS.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setColor(c.name)}
                    title={c.name}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${color === c.name ? 'border-black ring-2 ring-black ring-offset-2' : 'border-gray-200 hover:border-gray-400'}`}
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
              </div>
            </div>

            <button onClick={handleCustomize} className="w-full py-4 text-sm font-bold uppercase tracking-wide bg-black text-white hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 mb-3">
              <Sparkles size={18} /> Customize Now
            </button>

            {/* Features */}
            <div className="mt-8 space-y-3 border-t border-gray-100 pt-6">
              {[
                { icon: Truck, text: 'Free US shipping over $90' },
                { icon: RefreshCw, text: 'Exchanges or store credit within 60 days' },
                { icon: Globe, text: 'Printed in Australia, US & Europe — ships in 2-3 days' },
              ].map((f) => (
                <div key={f.text} className="flex items-center gap-3"><f.icon size={20} strokeWidth={1.5} /><span className="text-sm text-gray-600">{f.text}</span></div>
              ))}
            </div>

            {/* Details accordion */}
            <div className="mt-8 space-y-2">
              <details className="border-b border-gray-100 pb-3" open>
                <summary className="text-sm font-bold uppercase tracking-wide cursor-pointer py-2">Product Details</summary>
                <ul className="text-sm text-gray-600 space-y-1 mt-2 ml-1">
                  <li>Designed by Cool Clothing Company</li>
                  <li>100% combed cotton</li>
                  <li>Heavyweight 275gsm fabric</li>
                  <li>90s-inspired boxy fit with dropped shoulders</li>
                  <li>Unisex fit</li>
                  <li>Made to order, printed in-house</li>
                  {product.color && <li>Color: {product.color}</li>}
                </ul>
              </details>
              <details className="border-b border-gray-100 pb-3">
                <summary className="text-sm font-bold uppercase tracking-wide cursor-pointer py-2">Shipping & Returns</summary>
                <p className="text-sm text-gray-600 mt-2">Every order is made to order and printed in 2-3 business days from local facilities in Australia, the US and Europe. We offer exchanges or store credit on unworn items for up to 60 days after purchase.</p>
              </details>
            </div>
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="max-w-[1600px] mx-auto px-4 lg:px-8 py-12 border-t border-gray-100">
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
            {related.map((p) => <ProductCard key={p.id} product={p} onNavigate={onNavigate} />)}
          </div>
        </section>
      )}

      <ReviewsSection product={product} />
    </div>
  );
}

type Review = {
  name: string;
  location: string;
  title: string;
  body: string;
  daysAgo: number;
  size: string;
  color: string;
  image?: string;
  rating: number;
  sizing: number;
};

const REVIEW_COPY: Omit<Review, 'image'>[] = [
  {
    name: 'Marcos S.', location: 'Verified customer', title: 'Custom champs',
    body: 'I bought a custom one from here and the design came out fantastic. The quality is great and it feels even better in person.',
    daysAgo: 2, size: 'L', color: 'Black', rating: 5, sizing: 4,
  },
  {
    name: 'Hollie J.', location: 'Verified customer', title: 'Perfect picture clarity',
    body: 'The images printed with perfect clarity and the material is lovely quality. I want to order more.',
    daysAgo: 3, size: 'M', color: 'Natural', rating: 5, sizing: 4,
  },
  {
    name: 'Shannon M.', location: 'Verified customer', title: 'Love!',
    body: 'This is my sixth custom t-shirt and I have recommended many friends. Such good quality and plenty of wear out of them.',
    daysAgo: 4, size: 'XL', color: 'Black', rating: 5, sizing: 3,
  },
];

function ReviewsSection({ product }: { product: Product }) {
  const [showAll, setShowAll] = useState(false);
  const [helpful, setHelpful] = useState<Record<string, 'up' | 'down'>>({});
  const reviewCount = product.review_count || 0;
  const displayedReviews = showAll ? REVIEW_COPY : REVIEW_COPY.slice(0, 2);
  const reviewImages = [product.image_url, product.image_url_2].filter((image): image is string => !!image);
  const ratingBreakdown = [
    { stars: 5, count: Math.max(reviewCount - 21, 0), width: 98 },
    { stars: 4, count: Math.min(21, reviewCount), width: 3 },
    { stars: 3, count: 0, width: 0 },
    { stars: 2, count: 0, width: 0 },
    { stars: 1, count: 0, width: 0 },
  ];

  const toggleHelpful = (name: string, value: 'up' | 'down') => {
    setHelpful((previous) => ({ ...previous, [name]: previous[name] === value ? undefined as never : value }));
  };

  return (
    <section className="border-t border-gray-200 bg-white">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10 pb-12 border-b border-gray-200">
          <div className="min-w-[250px]">
            <p className="text-xs uppercase tracking-[0.18em] font-bold text-gray-500 mb-4">Customer reviews</p>
            <div className="flex items-center gap-3">
              <span className="text-5xl font-black tracking-tight">{product.rating.toFixed(1)}</span>
              <div>
                <Stars rating={product.rating} size={20} />
                <p className="text-sm text-gray-500 mt-1">Based on {reviewCount.toLocaleString()} reviews</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-7">
              <span className="text-2xl font-black">100%</span>
              <span className="text-sm text-gray-500">would recommend this product</span>
            </div>
          </div>

          <div className="flex-1 max-w-xl space-y-2">
            {ratingBreakdown.map((row) => (
              <div key={row.stars} className="flex items-center gap-3 text-sm">
                <span className="w-7 text-gray-600">{row.stars} <Star size={12} className="inline fill-lime-300 text-gray-700" /></span>
                <div className="h-2 flex-1 rounded-full bg-gray-100 overflow-hidden"><div className="h-full rounded-full bg-gray-400" style={{ width: `${row.width}%` }} /></div>
                <span className="w-9 text-right text-xs text-gray-500">{row.count > 999 ? `${(row.count / 1000).toFixed(1)}k` : row.count}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-stretch lg:items-end gap-5 lg:min-w-[210px]">
            <button className="inline-flex items-center justify-center gap-2 bg-black text-white px-6 py-3.5 text-sm font-bold hover:bg-gray-800 transition-colors">
              <Pencil size={16} /> Write a Review
            </button>
            <div className="flex gap-2 overflow-hidden max-w-full">
              {reviewImages.map((image, index) => (
                <div key={`${image}-${index}`} className="relative w-16 h-16 flex-shrink-0 overflow-hidden bg-gray-100">
                  <img src={image} alt="Customer product review" className="w-full h-full object-cover" />
                  {index === 1 && <span className="absolute inset-0 flex items-center justify-center bg-black/35 text-white"><Play size={18} fill="white" /></span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between py-6 border-b border-gray-200">
          <span className="text-sm text-gray-500">{reviewCount.toLocaleString()} reviews</span>
          <button className="flex items-center gap-3 text-sm font-medium">Sort <span className="text-gray-500">Most Recent</span> <ChevronDown size={16} /></button>
        </div>

        <div>
          {displayedReviews.map((review, index) => (
            <ReviewCard
              key={review.name}
              review={{ ...review, image: reviewImages[index % Math.max(reviewImages.length, 1)] }}
              helpful={helpful[review.name]}
              onHelpful={(value) => toggleHelpful(review.name, value)}
            />
          ))}
        </div>

        <button
          onClick={() => setShowAll((current) => !current)}
          className="mt-8 w-full border border-gray-300 py-3.5 text-sm font-bold hover:border-black transition-colors"
        >
          {showAll ? 'Show fewer reviews' : 'View all reviews'}
        </button>
      </div>
    </section>
  );
}

function ReviewCard({
  review,
  helpful,
  onHelpful,
}: {
  review: Review;
  helpful?: 'up' | 'down';
  onHelpful: (value: 'up' | 'down') => void;
}) {
  return (
    <article className="grid lg:grid-cols-[250px_1fr_auto] gap-6 lg:gap-10 py-7 border-b border-gray-200">
      <div className="border border-gray-300 bg-gray-50 p-4 self-start">
        <div className="flex items-center gap-2 font-bold text-sm"><span>{review.name}</span><span className="h-4 w-4 rounded-full bg-blue-600 text-white text-[9px] flex items-center justify-center">✓</span></div>
        <div className="flex items-center gap-1 text-[11px] font-semibold text-gray-700 mt-2"><CheckCircle2 size={13} fill="black" className="text-white" /> Verified Buyer</div>
        <div className="flex gap-3 mt-5">
          {review.image && <img src={review.image} alt="Reviewed product" className="w-14 h-14 object-cover bg-white" />}
          <div className="text-[11px] min-w-0">
            <p className="font-bold">Reviewing</p>
            <p className="text-gray-600 mt-1 truncate">{review.title}</p>
            <p className="text-gray-500 mt-1">{review.color} / {review.size}</p>
          </div>
        </div>
        <p className="flex items-center gap-2 text-sm mt-6"><ThumbsUp size={14} fill="black" /> I recommend this product</p>
      </div>

      <div className="min-w-0">
        <div className="flex items-center justify-between gap-4"><Stars rating={review.rating} size={20} /><span className="text-sm text-gray-500">{review.daysAgo} days ago</span></div>
        <h3 className="text-lg font-bold mt-4">{review.title}</h3>
        <p className="text-gray-700 leading-relaxed mt-3 max-w-3xl">{review.body}</p>
        <div className="max-w-xs mt-7">
          <p className="text-sm font-medium mb-3">Sizing</p>
          <div className="relative h-1 bg-gray-300"><div className="absolute left-0 top-0 h-1 bg-gray-500" style={{ width: `${(review.sizing / 5) * 100}%` }} /><span className="absolute -top-1.5 h-4 w-4 rounded-full border-2 border-gray-800 bg-white" style={{ left: `calc(${(review.sizing / 5) * 100}% - 8px)` }} /></div>
          <div className="flex justify-between text-[10px] text-gray-500 mt-3"><span>Runs Small</span><span>True to Size</span><span>Runs Large</span></div>
        </div>
      </div>

      <div className="lg:self-end flex items-center justify-end gap-4 text-sm text-gray-400 whitespace-nowrap">
        <span>Was this helpful?</span>
        <button onClick={() => onHelpful('up')} className={helpful === 'up' ? 'text-black' : 'hover:text-black'}><ThumbsUp size={16} fill={helpful === 'up' ? 'currentColor' : 'none'} /></button>
        <span>0</span>
        <button onClick={() => onHelpful('down')} className={helpful === 'down' ? 'text-black' : 'hover:text-black'}><ThumbsDown size={16} fill={helpful === 'down' ? 'currentColor' : 'none'} /></button>
        <span>0</span>
      </div>
    </article>
  );
}

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} size={size} className={index < Math.round(rating) ? 'fill-lime-300 text-gray-800' : 'fill-gray-100 text-gray-300'} />
      ))}
    </div>
  );
}
