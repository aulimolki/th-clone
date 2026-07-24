import { useState, useEffect } from 'react';
import { Search, ShoppingBag, Menu, X, ChevronDown, User } from 'lucide-react';
import { useCart } from '../cart';

type NavItem = {
  label: string;
  href: string;
  megaMenu?: { title: string; links: { label: string; href: string }[] }[];
};

const navItems: NavItem[] = [
  {
    label: 'Custom',
    href: '#/collections/custom',
    megaMenu: [
      {
        title: 'Design Your Own',
        links: [
          { label: 'All Custom', href: '#/collections/custom' },
          { label: 'Custom Classic Tee', href: '#/product/custom-classic-tee' },
          { label: 'Custom Oversized Tee', href: '#/product/custom-oversized-tee' },
          { label: 'Custom Bootleg Tee', href: '#/product/custom-bootleg-tee' },
        ],
      },
    ],
  },
  {
    label: 'Blank Tees',
    href: '#/collections/blank-tees',
    megaMenu: [
      {
        title: 'Shop Blank Tees',
        links: [
          { label: 'All Blank Tees', href: '#/collections/blank-tees' },
          { label: 'Blank Classic Tee', href: '#/collections/blank-tees' },
          { label: 'Blank Oversized Tee', href: '#/collections/blank-tees' },
          { label: 'Blank Heavyweight Tee', href: '#/collections/blank-tees' },
        ],
      },
    ],
  },
];

export default function Header({
  onNavigate,
  transparentOnTop = false,
}: {
  onNavigate: (path: string) => void;
  transparentOnTop?: boolean;
}) {
  const { itemCount, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navigate = (href: string) => {
    onNavigate(href);
    setMegaOpen(null);
    setMobileOpen(false);
    setSearchOpen(false);
  };

  const isTransparent = transparentOnTop && !scrolled;
  const textColor = isTransparent ? 'text-white' : 'text-black';
  const logoFilter = isTransparent ? 'brightness(0) invert(1)' : 'none';
  const badgeClass = isTransparent ? 'bg-white text-black' : 'bg-black text-white';

  return (
    <>
      {/* Header: fixed at top, transparent or solid based on scroll */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-[350ms] ease ${
          isTransparent
            ? 'bg-transparent border-b border-transparent shadow-none'
            : 'bg-white border-b border-[#ECECEC] shadow-[0_2px_10px_rgba(0,0,0,0.06)]'
        }`}
        onMouseLeave={() => setMegaOpen(null)}
      >
        {/* Announcement bar */}
        <div className="bg-black text-white text-center py-2.5 px-4 text-xs font-medium tracking-wide relative overflow-hidden">
          <div className="animate-marquee whitespace-nowrap inline-block">
            <span className="mx-8">FREE US SHIPPING OVER $90</span>
            <span className="mx-8">20% OFF WITH CODE COOL — LIMITED TIME SALE ENDS SOON</span>
            <span className="mx-8">MADE TO ORDER IN 2-3 BUSINESS DAYS</span>
            <span className="mx-8">FREE US SHIPPING OVER $90</span>
            <span className="mx-8">20% OFF WITH CODE COOL — LIMITED TIME SALE ENDS SOON</span>
            <span className="mx-8">MADE TO ORDER IN 2-3 BUSINESS DAYS</span>
          </div>
        </div>
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile menu */}
            <button
              className={`lg:hidden p-2 -ml-2 transition-colors duration-[350ms] ease ${textColor}`}
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>

            {/* Logo */}
            <button
              onClick={() => navigate('#/')}
              className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0"
            >
              <img
                src="/27508dc2-94dc-4575-adeb-050fb25d2db9 copy.jpeg"
                alt="Cool Clothing Company"
                className="h-10 lg:h-12 w-auto object-contain transition-all duration-[350ms] ease"
                style={{ filter: logoFilter }}
              />
            </button>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1 flex-1 ml-8">
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setMegaOpen(item.label)}
                >
                  <button
                    onClick={() => navigate(item.href)}
                    className={`flex items-center gap-0.5 px-3 py-2 text-sm font-medium uppercase tracking-wide hover:opacity-60 transition-opacity ${textColor}`}
                  >
                    {item.label}
                    {item.megaMenu && <ChevronDown size={14} className="mt-0.5" />}
                  </button>
                </div>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1 lg:gap-2">
              <button
                className={`p-2 hover:opacity-60 transition-opacity ${textColor}`}
                onClick={() => setSearchOpen(!searchOpen)}
                aria-label="Search"
              >
                <Search size={20} />
              </button>
              <button
                className={`p-2 hover:opacity-60 transition-opacity hidden lg:block ${textColor}`}
                aria-label="Account"
              >
                <User size={20} />
              </button>
              <button
                className={`p-2 hover:opacity-60 transition-opacity relative ${textColor}`}
                onClick={openCart}
                aria-label="Cart"
              >
                <ShoppingBag size={20} />
                {itemCount > 0 && (
                  <span
                    className={`absolute -top-0.5 -right-0.5 text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center transition-colors duration-[350ms] ease ${badgeClass}`}
                  >
                    {itemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mega menu */}
        {megaOpen && (
          <div className="hidden lg:block absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-lg animate-fadeIn text-black">
            <div className="max-w-[1600px] mx-auto px-8 py-8">
              {navItems
                .filter((n) => n.label === megaOpen)
                .map((item) =>
                  item.megaMenu ? (
                    <div key={item.label} className="flex gap-16">
                      {item.megaMenu.map((col) => (
                        <div key={col.title}>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                            {col.title}
                          </h3>
                          <ul className="space-y-2">
                            {col.links.map((link) => (
                              <li key={link.label}>
                                <button
                                  onClick={() => navigate(link.href)}
                                  className="text-sm hover:opacity-60 transition-opacity text-left"
                                >
                                  {link.label}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : null,
                )}
            </div>
          </div>
        )}

        {/* Search bar */}
        {searchOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-lg animate-fadeIn text-black">
            <div className="max-w-[1600px] mx-auto px-8 py-6">
              <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
                <Search size={20} className="text-gray-400" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search for products..."
                  className="flex-1 text-lg outline-none bg-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      navigate(`#/search?q=${encodeURIComponent(e.currentTarget.value)}`);
                    }
                  }}
                />
                <button onClick={() => setSearchOpen(false)} className="p-1">
                  <X size={20} />
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[85%] max-w-sm bg-white overflow-y-auto animate-slideInLeft">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <img src="/27508dc2-94dc-4575-adeb-050fb25d2db9 copy.jpeg" alt="Cool Clothing Company" className="h-8 w-auto object-contain" />
              <button onClick={() => setMobileOpen(false)} className="p-2">
                <X size={22} />
              </button>
            </div>
            <nav className="p-4">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => navigate(item.href)}
                  className="block w-full text-left py-3 text-base font-medium uppercase tracking-wide border-b border-gray-50"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
