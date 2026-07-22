import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { supabase, type Product, type CartItem, type PrintType, type DesignData } from './supabase';

type CartContextValue = {
  items: CartItem[];
  loading: boolean;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addToCart: (product: Product, size: string, quantity?: number, printType?: PrintType, color?: string, designData?: DesignData) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  itemCount: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('cart_items')
      .select('*, product:products(*)')
      .order('created_at', { ascending: false });
    if (!error && data) {
      setItems(data as unknown as CartItem[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(
    async (product: Product, size: string, quantity = 1, printType: PrintType = 'DTG', color?: string, designData?: DesignData) => {
      const existing = items.find(
        (item) =>
          item.product_id === product.id &&
          item.size === size &&
          (item.print_type ?? 'DTG') === printType &&
          (item.color ?? null) === (color ?? null),
      );
      if (existing) {
        await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + quantity })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('cart_items')
          .insert({
            product_id: product.id,
            size,
            quantity,
            print_type: printType,
            color: color ?? null,
            design_data: designData ?? null,
          });
      }
      await fetchCart();
      setIsOpen(true);
    },
    [items, fetchCart],
  );

  const updateQuantity = useCallback(
    async (id: string, quantity: number) => {
      if (quantity <= 0) {
        await supabase.from('cart_items').delete().eq('id', id);
      } else {
        await supabase.from('cart_items').update({ quantity }).eq('id', id);
      }
      await fetchCart();
    },
    [fetchCart],
  );

  const removeItem = useCallback(
    async (id: string) => {
      await supabase.from('cart_items').delete().eq('id', id);
      await fetchCart();
    },
    [fetchCart],
  );

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => {
    const price = item.product?.price ?? 0;
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        isOpen,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addToCart,
        updateQuantity,
        removeItem,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
