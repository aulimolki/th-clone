import { useEffect, useState, useMemo } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { supabase, type Product, type Category } from '../supabase';
import ProductCard from '../components/ProductCard';

type Props = {
  slug?: string;
  onNavigate: (path: string) => void;
};

type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'newest';

export default function CollectionPage({ slug, onNavigate }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortOption>('featured');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      if (slug) {
        const { data: cat } = await supabase
          .from('categories')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();
        setCategory(cat as Category | null);
        const { data } = await supabase
          .from('products')
          .select('*, category:categories(*)')
          .eq('category_id', cat?.id)
          .order('created_at', { ascending: false });
        setProducts((data as unknown as Product[]) ?? []);
      } else {
        setCategory(null);
        const { data } = await supabase
          .from('products')
          .select('*, category:categories(*)')
          .order('created_at', { ascending: false });
        setProducts((data as unknown as Product[]) ?? []);
      }
      setLoading(false);
    })();
  }, [slug]);

  const allColors = useMemo(() => {
    const colors = new Set<string>();
    products.forEach((p) => p.color && colors.add(p.color));
    return Array.from(colors);
  }, [products]);

  const filtered = useMemo(() => {
    let result = [...products];
    if (selectedColors.length > 0) {
      result = result.filter((p) => p.color && selectedColors.includes(p.color));
    }
    if (selectedTags.length > 0) {
      result = result.filter((p) =>
        p.tags?.some((t) => selectedTags.includes(t)),
      );
    }
    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1],
    );
    switch (sort) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        break;
    }
    return result;
  }, [products, selectedColors, selectedTags, priceRange, sort]);

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color],
    );
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const title = category?.name ?? 'All Products';

  return (
    <div>
      {/* Banner */}
      <div className="relative h-[200px] bg-gray-900 overflow-hidden">
        <img
          src={category?.image_url ?? 'https://images.pexels.com/photos/2703202/pexels-photo-2703202.jpeg'}
          alt={title}
          className="w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter">{title}</h1>
          {category?.description && (
            <p className="text-sm md:text-base mt-2 max-w-2xl opacity-90">
              {category.description}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2 text-sm font-medium uppercase tracking-wide hover:opacity-60"
          >
            <SlidersHorizontal size={16} />
            Filters
            {(selectedColors.length > 0 || selectedTags.length > 0) && (
              <span className="bg-black text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                {selectedColors.length + selectedTags.length}
              </span>
            )}
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden md:block">
              {filtered.length} products
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="text-sm border border-gray-200 px-3 py-2 outline-none cursor-pointer hover:border-gray-400"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Active filters */}
        {(selectedColors.length > 0 || selectedTags.length > 0) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedColors.map((c) => (
              <button
                key={c}
                onClick={() => toggleColor(c)}
                className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 text-xs font-medium hover:bg-gray-200"
              >
                {c} <X size={12} />
              </button>
            ))}
            {selectedTags.map((t) => (
              <button
                key={t}
                onClick={() => toggleTag(t)}
                className="flex items-center gap-1 bg-gray-100 px-3 py-1.5 text-xs font-medium hover:bg-gray-200 capitalize"
              >
                {t} <X size={12} />
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-8">
          {/* Sidebar filters */}
          {filterOpen && (
            <aside className="w-56 flex-shrink-0 hidden md:block">
              <div className="space-y-6 sticky top-24">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-3">Color</h3>
                  <div className="space-y-2">
                    {allColors.map((color) => (
                      <label key={color} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedColors.includes(color)}
                          onChange={() => toggleColor(color)}
                          className="accent-black"
                        />
                        <span className="text-sm">{color}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-3">Tags</h3>
                  <div className="space-y-2">
                    {['new', 'bestseller', 'custom'].map((tag) => (
                      <label key={tag} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedTags.includes(tag)}
                          onChange={() => toggleTag(tag)}
                          className="accent-black"
                        />
                        <span className="text-sm capitalize">{tag}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider mb-3">
                    Price Range
                  </h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) =>
                        setPriceRange([Number(e.target.value), priceRange[1]])
                      }
                      className="w-20 border border-gray-200 px-2 py-1 text-sm"
                      min={0}
                    />
                    <span>-</span>
                    <input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) =>
                        setPriceRange([priceRange[0], Number(e.target.value)])
                      }
                      className="w-20 border border-gray-200 px-2 py-1 text-sm"
                      min={0}
                    />
                  </div>
                </div>
              </div>
            </aside>
          )}

          {/* Product grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i}>
                    <div className="aspect-[3/4] bg-gray-100 animate-pulse mb-3" />
                    <div className="h-4 bg-gray-100 animate-pulse mb-2 w-3/4" />
                    <div className="h-4 bg-gray-100 animate-pulse w-1/3" />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 mb-4">No products found.</p>
                <button
                  onClick={() => {
                    setSelectedColors([]);
                    setSelectedTags([]);
                    setPriceRange([0, 200]);
                  }}
                  className="underline text-sm font-medium"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8">
                {filtered.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
