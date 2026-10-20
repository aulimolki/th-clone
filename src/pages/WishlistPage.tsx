import { useEffect, useState } from 'react';
import { Heart, Trash2, Loader2 } from 'lucide-react';
import { supabase, type Product } from '../supabase';
import { useAuth } from '../auth';

type WishlistRow = {
  id: string;
  product_id: string;
  product: Product;
};

export default function WishlistPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('wishlist')
        .select('id, product_id, product:products(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setItems((data as unknown as WishlistRow[]) ?? []);
      setLoading(false);
    })();
  }, [user]);

  const remove = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await supabase.from('wishlist').delete().eq('id', id);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f6f6f4] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold mb-2">Sign in to view your wishlist</h1>
          <p className="text-sm text-gray-500 mb-6">Save your favorite tees by creating an account.</p>
          <button
            onClick={() => onNavigate('#/')}
            className="text-sm font-semibold text-violet-700 hover:underline"
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f6f4] py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-1">Wishlist</h1>
        <p className="text-sm text-gray-500 mb-8">Tees you've saved for later.</p>

        {loading ? (
          <div className="flex justify-center py-20 text-gray-400">
            <Loader2 className="animate-spin" size={24} />
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Heart size={26} className="text-gray-400" />
            </div>
            <h2 className="text-lg font-bold mb-1">Your wishlist is empty</h2>
            <p className="text-sm text-gray-500 mb-6">Tap the heart on any product to save it here.</p>
            <button
              onClick={() => onNavigate('#/collections')}
              className="inline-block bg-black text-white px-6 py-3 text-sm font-bold uppercase tracking-wide hover:bg-gray-800 transition-colors rounded-lg"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-sm overflow-hidden group">
                <button
                  onClick={() => onNavigate(`#/product/${item.product.slug}`)}
                  className="block relative w-full aspect-[4/5] bg-gray-50 overflow-hidden"
                >
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </button>
                <div className="p-4">
                  <p className="text-sm font-semibold truncate">{item.product.name}</p>
                  <p className="text-sm font-bold mt-1">${Number(item.product.price).toFixed(2)}</p>
                  <div className="flex items-center justify-between mt-3">
                    <button
                      onClick={() => onNavigate(`#/product/${item.product.slug}`)}
                      className="text-xs font-semibold text-violet-700 hover:underline"
                    >
                      View
                    </button>
                    <button
                      onClick={() => remove(item.id)}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
