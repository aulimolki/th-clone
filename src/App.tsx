import { useEffect, useState } from 'react';
import { CartProvider } from './cart';
import { AuthProvider } from './auth';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import HomePage from './pages/HomePage';
import CollectionPage from './pages/CollectionPage';
import ProductPage from './pages/ProductPage';
import CustomizePage from './pages/CustomizePage';
import type { MaterialType } from './supabase';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import WishlistPage from './pages/WishlistPage';
import ProfilePage from './pages/ProfilePage';

type Route =
  | { name: 'home' }
  | { name: 'collection'; slug?: string }
  | { name: 'product'; slug: string }
  | { name: 'customize'; slug: string; editItemId?: string; material?: string }
  | { name: 'checkout' }
  | { name: 'search'; query: string }
  | { name: 'new' }
  | { name: 'orders' }
  | { name: 'wishlist' }
  | { name: 'profile' };

function parseHash(): Route {
  const hash = window.location.hash.replace(/^#/, '') || '/';
  if (hash === '/' || hash === '') return { name: 'home' };
  const productMatch = hash.match(/^\/product\/(.+)$/);
  if (productMatch) return { name: 'product', slug: productMatch[1] };
  const customizeMatch = hash.match(/^\/customize\/(.+)$/);
  if (customizeMatch) {
    const raw = customizeMatch[1];
    let material: string | undefined;
    let rest = raw;
    const qIdx = raw.indexOf('?');
    if (qIdx !== -1) {
      rest = raw.slice(0, qIdx);
      const params = new URLSearchParams(raw.slice(qIdx + 1));
      material = params.get('material') ?? undefined;
    }
    const parts = rest.split('/edit/');
    return { name: 'customize', slug: parts[0], editItemId: parts[1], material };
  }
  const collectionMatch = hash.match(/^\/collections\/(.+)$/);
  if (collectionMatch) return { name: 'collection', slug: collectionMatch[1] };
  const collectionAll = hash.match(/^\/collections$/);
  if (collectionAll) return { name: 'collection' };
  const searchMatch = hash.match(/^\/search\?q=(.*)$/);
  if (hash.match(/^\/checkout$/)) return { name: 'checkout' };
  if (hash.match(/^\/account\/orders$/)) return { name: 'orders' };
  if (hash.match(/^\/account\/wishlist$/)) return { name: 'wishlist' };
  if (hash.match(/^\/account\/profile$/)) return { name: 'profile' };
  if (hash.match(/^\/account$/)) return { name: 'profile' };
  if (searchMatch) return { name: 'search', query: decodeURIComponent(searchMatch[1]) };
  if (hash.match(/^\/new/)) return { name: 'new' };
  return { name: 'home' };
}

export default function App() {
  const [route, setRoute] = useState<Route>(parseHash());

  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseHash());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path.replace(/^#/, '');
  };

  const transparentOnTop =
    route.name === 'home' ||
    route.name === 'collection' ||
    route.name === 'new' ||
    route.name === 'search';

  return (
    <AuthProvider>
      <CartProvider>
        <div className="min-h-screen bg-white flex flex-col">
          <Header onNavigate={navigate} transparentOnTop={transparentOnTop} />
          <main className={`flex-1 ${transparentOnTop ? '' : 'pt-[100px] lg:pt-[116px]'}`}>
            {route.name === 'home' && <HomePage onNavigate={navigate} />}
            {route.name === 'collection' && (
              <CollectionPage slug={route.slug} onNavigate={navigate} />
            )}
            {route.name === 'product' && (
              <ProductPage slug={route.slug} onNavigate={navigate} />
            )}
            {route.name === 'customize' && (
              <CustomizePage
                slug={route.slug}
                onNavigate={navigate}
                editItemId={route.editItemId}
                initialMaterial={route.material as MaterialType | undefined}
              />
            )}
            {route.name === 'checkout' && <CheckoutPage onNavigate={navigate} />}
            {route.name === 'orders' && <OrdersPage onNavigate={navigate} />}
            {route.name === 'wishlist' && <WishlistPage onNavigate={navigate} />}
            {route.name === 'profile' && <ProfilePage onNavigate={navigate} />}
            {route.name === 'new' && (
              <CollectionPage onNavigate={navigate} />
            )}
            {route.name === 'search' && (
              <CollectionPage onNavigate={navigate} />
            )}
          </main>
          <Footer onNavigate={navigate} />
          <CartDrawer onNavigate={navigate} />
        </div>
      </CartProvider>
    </AuthProvider>
  );
}
