import { useEffect, useState } from 'react';
import { CartProvider } from './cart';
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import HomePage from './pages/HomePage';
import CollectionPage from './pages/CollectionPage';
import ProductPage from './pages/ProductPage';
import CustomizePage from './pages/CustomizePage';
import CheckoutPage from './pages/CheckoutPage';

type Route =
  | { name: 'home' }
  | { name: 'collection'; slug?: string }
  | { name: 'product'; slug: string }
  | { name: 'customize'; slug: string; editItemId?: string }
  | { name: 'checkout' }
  | { name: 'search'; query: string }
  | { name: 'new' };

function parseHash(): Route {
  const hash = window.location.hash.replace(/^#/, '') || '/';
  if (hash === '/' || hash === '') return { name: 'home' };
  const productMatch = hash.match(/^\/product\/(.+)$/);
  if (productMatch) return { name: 'product', slug: productMatch[1] };
  const customizeMatch = hash.match(/^\/customize\/(.+)$/);
  if (customizeMatch) {
    const parts = customizeMatch[1].split('/edit/');
    return { name: 'customize', slug: parts[0], editItemId: parts[1] };
  }
  const collectionMatch = hash.match(/^\/collections\/(.+)$/);
  if (collectionMatch) return { name: 'collection', slug: collectionMatch[1] };
  const collectionAll = hash.match(/^\/collections$/);
  if (collectionAll) return { name: 'collection' };
  const searchMatch = hash.match(/^\/search\?q=(.*)$/);
  if (hash.match(/^\/checkout$/)) return { name: 'checkout' };
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

  return (
    <CartProvider>
      <div className="min-h-screen bg-white flex flex-col">
        <Header onNavigate={navigate} />
        <main className="flex-1">
          {route.name === 'home' && <HomePage onNavigate={navigate} />}
          {route.name === 'collection' && (
            <CollectionPage slug={route.slug} onNavigate={navigate} />
          )}
          {route.name === 'product' && (
            <ProductPage slug={route.slug} onNavigate={navigate} />
          )}
          {route.name === 'customize' && (
            <CustomizePage slug={route.slug} onNavigate={navigate} editItemId={route.editItemId} />
          )}
          {route.name === 'checkout' && <CheckoutPage onNavigate={navigate} />}
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
  );
}
