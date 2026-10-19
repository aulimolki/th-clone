import { useEffect, useState } from 'react';
import { Package, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '../supabase';
import { useAuth } from '../auth';

type OrderItem = {
  id: string;
  product_name: string | null;
  product_id: string | null;
  size: string | null;
  quantity: number;
  unit_price: number;
  print_type: string | null;
  material_type: string | null;
  color: string | null;
};

type Order = {
  id: string;
  order_number: string;
  status: string;
  total: number;
  items_count: number;
  created_at: string;
  order_items: OrderItem[];
};

export default function OrdersPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setOrders((data as unknown as Order[]) ?? []);
      setLoading(false);
    })();
  }, [user]);

  if (!user) return <SignInPrompt onNavigate={onNavigate} />;

  return (
    <div className="min-h-screen bg-[#f6f6f4] py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-1">My Orders</h1>
        <p className="text-sm text-gray-500 mb-8">Track and review your placed orders.</p>

        {loading ? (
          <div className="flex justify-center py-20 text-gray-400">
            <Loader2 className="animate-spin" size={24} />
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <Package size={26} className="text-gray-400" />
            </div>
            <h2 className="text-lg font-bold mb-1">No orders yet</h2>
            <p className="text-sm text-gray-500 mb-6">When you place an order, it will appear here.</p>
            <button
              onClick={() => onNavigate('#/collections')}
              className="inline-block bg-black text-white px-6 py-3 text-sm font-bold uppercase tracking-wide hover:bg-gray-800 transition-colors rounded-lg"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                  <div>
                    <p className="text-sm font-bold">{order.order_number}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(order.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-[11px] font-semibold uppercase tracking-wide">
                      {order.status}
                    </span>
                    <p className="text-sm font-bold mt-1">
                      ${(Number(order.total)).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="px-5 py-3 space-y-2">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm">
                      <div className="min-w-0">
                        <p className="font-medium truncate">
                          {item.product_name ?? 'Custom item'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.quantity} × {item.size ?? '-'}
                          {item.color ? ` · ${item.color}` : ''}
                          {item.material_type ? ` · ${item.material_type}` : ''}
                        </p>
                      </div>
                      <span className="font-semibold ml-3">
                        ${(Number(item.unit_price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SignInPrompt({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <div className="min-h-screen bg-[#f6f6f4] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold mb-2">Sign in to view your orders</h1>
        <p className="text-sm text-gray-500 mb-6">You need an account to see your order history.</p>
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
