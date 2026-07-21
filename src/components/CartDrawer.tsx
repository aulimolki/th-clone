import { Star, Plus, Minus, X } from 'lucide-react';
import { useCart } from '../cart';

export default function CartDrawer({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { items, isOpen, closeCart, updateQuantity, removeItem, subtotal, loading } = useCart();

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-[70] bg-black/50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-[80] w-full max-w-md bg-white shadow-2xl transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold uppercase tracking-tight">
            Your Cart ({items.length})
          </h2>
          <button onClick={closeCart} className="p-2 hover:opacity-60">
            <X size={22} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading cart...</div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-500 mb-4">Your cart is empty</p>
              <button
                onClick={() => {
                  closeCart();
                  onNavigate('#/collections/oversized-tees');
                }}
                className="inline-block bg-black text-white px-6 py-3 text-sm font-medium uppercase tracking-wide hover:bg-gray-800 transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="p-5 space-y-5">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <button
                    onClick={() => {
                      if (item.product) {
                        closeCart();
                        onNavigate(`#/product/${item.product.slug}`);
                      }
                    }}
                    className="w-24 h-32 bg-gray-50 flex-shrink-0 overflow-hidden"
                  >
                    {item.product && (
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium truncate">
                      {item.product?.name ?? 'Unknown product'}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">Size: {item.size}</p>
                    {item.print_type && (
                      <p className="text-xs text-gray-500 mt-0.5">Print: {item.print_type}</p>
                    )}
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={12} className="fill-black text-black" />
                      <span className="text-xs text-gray-500">
                        {item.product?.rating} ({item.product?.review_count})
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-gray-200">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 hover:bg-gray-50"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-3 text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 hover:bg-gray-50"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="text-sm font-bold">
                        ${((item.product?.price ?? 0) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-xs text-gray-400 hover:text-black mt-2 underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-base font-medium">Subtotal</span>
              <span className="text-xl font-bold">${subtotal.toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-500">
              Shipping and taxes calculated at checkout
            </p>
            <button
              onClick={() => onNavigate('#/checkout')}
              className="w-full bg-black text-white py-4 text-sm font-bold uppercase tracking-wide hover:bg-gray-800 transition-colors"
            >
              Checkout — ${subtotal.toFixed(2)}
            </button>
            <button
              onClick={closeCart}
              className="w-full text-center text-sm underline hover:opacity-60"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
