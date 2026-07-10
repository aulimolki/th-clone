import { useEffect, useState } from 'react';
import { ArrowRight, Truck, Globe, Star, Shirt } from 'lucide-react';
import { supabase, type Product } from '../supabase';
import ProductCard from '../components/ProductCard';
import CategoryGrid from '../components/CategoryGrid';

type Props = { onNavigate: (path: string) => void };

export default function HomePage({ onNavigate }: Props) {
  const [bestsellers, setBestsellers] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [best, newP] = await Promise.all([
        supabase
          .from('products')
          .select('*, category:categories(*)')
          .contains('tags', ['bestseller'])
          .limit(8),
        supabase
          .from('products')
          .select('*, category:categories(*)')
          .contains('tags', ['new'])
          .limit(4),
      ]);
      if (best.data) setBestsellers(best.data as unknown as Product[]);
      if (newP.data) setNewArrivals(newP.data as unknown as Product[]);
      setLoading(false);
    })();
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[70vh] min-h-[500px] bg-black overflow-hidden">
        <img
          src="https://images.pexels.com/photos/2703202/pexels-photo-2703202.jpeg"
          alt="Threadheads"
          className="w-full h-full object-cover opacity-70"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
          <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4 opacity-80">
            Since 2018 — Designed in Melbourne
          </p>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6">
            Chaotic clothing
            <br />
            for chaotic people
          </h1>
          <p className="text-lg md:text-xl max-w-xl mb-8 opacity-90">
            Premium oversized graphic tees, heavyweight blanks, and custom designs.
            Made to order, printed in-house.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => onNavigate('#/collections/oversized-tees')}
              className="bg-white text-black px-8 py-4 text-sm font-bold uppercase tracking-wide hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
            >
              Shop Oversized Tees <ArrowRight size={16} />
            </button>
            <button
              onClick={() => onNavigate('#/collections/custom')}
              className="bg-transparent border-2 border-white text-white px-8 py-4 text-sm font-bold uppercase tracking-wide hover:bg-white hover:text-black transition-colors"
            >
              Design Your Own
            </button>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-b border-gray-100">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: 'Free Shipping', sub: 'On US orders over $90' },
              { icon: Shirt, title: 'Premium Cotton', sub: '275gsm heavyweight combed cotton' },
              { icon: Globe, title: 'Worldwide Delivery', sub: 'Printed in AU, US & EU' },
              { icon: Star, title: '700K+ Customers', sub: 'Rated Excellent on Trustpilot' },
            ].map((badge) => (
              <div key={badge.title} className="flex items-center gap-3">
                <badge.icon size={28} strokeWidth={1.5} />
                <div>
                  <h3 className="text-sm font-bold">{badge.title}</h3>
                  <p className="text-xs text-gray-500">{badge.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bestsellers */}
      <section className="max-w-[1600px] mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">
              Most Popular
            </p>
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight">
              Bestsellers
            </h2>
          </div>
          <button
            onClick={() => onNavigate('#/collections/oversized-tees')}
            className="text-sm font-bold uppercase tracking-wide hover:opacity-60 flex items-center gap-2"
          >
            View All <ArrowRight size={16} />
          </button>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-[3/4] bg-gray-100 animate-pulse mb-3" />
                <div className="h-4 bg-gray-100 animate-pulse mb-2 w-3/4" />
                <div className="h-4 bg-gray-100 animate-pulse w-1/3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
            {bestsellers.map((product) => (
              <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </section>

      {/* Banner CTA */}
      <section className="relative h-[400px] bg-gray-900 overflow-hidden">
        <img
          src="https://images.pexels.com/photos/6311392/pexels-photo-6311392.jpeg"
          alt="Heavyweight"
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
          <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4 opacity-80">
            New Collection
          </p>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">
            Heavyweight
          </h2>
          <p className="text-lg max-w-lg mb-6 opacity-90">
            Extra thick, extra heavy, extra good. Built to last from 400gsm brushed fleece.
          </p>
          <button
            onClick={() => onNavigate('#/collections/heavyweight')}
            className="bg-white text-black px-8 py-4 text-sm font-bold uppercase tracking-wide hover:bg-gray-200 transition-colors flex items-center gap-2"
          >
            Shop Heavyweight <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="max-w-[1600px] mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">
              Fresh Drops
            </p>
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight">
              New Arrivals
            </h2>
          </div>
          <button
            onClick={() => onNavigate('#/new')}
            className="text-sm font-bold uppercase tracking-wide hover:opacity-60 flex items-center gap-2"
          >
            View All <ArrowRight size={16} />
          </button>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-[3/4] bg-gray-100 animate-pulse mb-3" />
                <div className="h-4 bg-gray-100 animate-pulse mb-2 w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </section>

      {/* Shop by Category */}
      <section className="max-w-[1600px] mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">
            Browse
          </p>
          <h2 className="text-3xl lg:text-4xl font-black tracking-tight">
            Shop by Category
          </h2>
        </div>
        <CategoryGrid onNavigate={onNavigate} />
      </section>

      {/* Custom CTA */}
      <section className="bg-black text-white">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-16 lg:py-24">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.3em] mb-4 opacity-60">
                Made to Order
              </p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
                Design your
                <br />
                own custom tee
              </h2>
              <p className="text-lg opacity-80 mb-6 max-w-md">
                Upload a photo, your own design or a line of text, and we'll print it sharp
                on premium combed cotton. Printed in 2-3 business days.
              </p>
              <button
                onClick={() => onNavigate('#/collections/custom')}
                className="bg-white text-black px-8 py-4 text-sm font-bold uppercase tracking-wide hover:bg-gray-200 transition-colors inline-flex items-center gap-2"
              >
                Start Designing <ArrowRight size={16} />
              </button>
            </div>
            <div className="aspect-[4/3] bg-gray-800 overflow-hidden">
              <img
                src="https://images.pexels.com/photos/5380642/pexels-photo-5380642.jpeg"
                alt="Custom tees"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Reviews strip */}
      <section className="border-t border-gray-100">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-12 lg:py-16">
          <div className="text-center mb-10">
            <div className="flex justify-center gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={24} className="fill-black text-black" />
              ))}
            </div>
            <p className="text-2xl font-bold">4.6 / 5 — Excellent</p>
            <p className="text-sm text-gray-500 mt-1">
              Based on 760+ reviews on Trustpilot
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Sarah M.',
                review: 'The quality is unreal. The oversized fit is perfect and the print is so crisp. Have ordered 5 times now.',
                location: 'Melbourne, AU',
              },
              {
                name: 'Jake T.',
                review: 'Best tees I own, hands down. Heavyweight cotton that actually holds its shape after washing.',
                location: 'Austin, US',
              },
              {
                name: 'Emma L.',
                review: 'Custom tee came out exactly like the preview. Fast shipping and brilliant print quality.',
                location: 'London, UK',
              },
            ].map((r) => (
              <div key={r.name} className="bg-gray-50 p-6 rounded-lg">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className="fill-black text-black" />
                  ))}
                </div>
                <p className="text-sm text-gray-700 mb-4 leading-relaxed">"{r.review}"</p>
                <p className="text-sm font-bold">{r.name}</p>
                <p className="text-xs text-gray-400">{r.location}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
