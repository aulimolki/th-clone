import { useState } from 'react';
import { Instagram, Youtube, ArrowRight } from 'lucide-react';

type Props = { onNavigate: (path: string) => void };

export default function Footer({ onNavigate }: Props) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="bg-black text-white">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-12 lg:py-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-black tracking-tighter mb-2">
                Get 10% off your first order
              </h2>
              <p className="text-white/60">
                Join the Threadheads crew for exclusive drops, offers and chaos.
              </p>
            </div>
            <form onSubmit={handleSubscribe} className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 bg-white/10 border border-white/20 px-4 py-3.5 text-sm outline-none focus:border-white placeholder:text-white/40"
                required
              />
              <button
                type="submit"
                className="bg-white text-black px-6 py-3.5 text-sm font-bold uppercase tracking-wide hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                {subscribed ? 'Subscribed!' : 'Subscribe'}
                {!subscribed && <ArrowRight size={16} />}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <button
              onClick={() => onNavigate('#/')}
              className="font-black text-3xl tracking-tighter mb-4 block"
            >
              thread<span className="font-light">heads</span>
            </button>
            <p className="text-white/60 text-sm mb-4 max-w-xs">
              Chaotic clothing since 2018. In-house design team. Worldwide shipping.
              Really good website.
            </p>
            <div className="flex gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors"
              >
                <Youtube size={18} />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-4">
              Shop
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Oversized Tees', href: '#/collections/oversized-tees' },
                { label: 'Classic Tees', href: '#/collections/classic-tees' },
                { label: 'Custom', href: '#/collections/custom' },
                { label: 'Hoodies', href: '#/collections/hoodies' },
                { label: 'Hats', href: '#/collections/hats' },
                { label: 'Accessories', href: '#/collections/accessories' },
              ].map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => onNavigate(link.href)}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-4">
              Help
            </h3>
            <ul className="space-y-2.5">
              {[
                'FAQs',
                'Shipping Info',
                'Returns & Exchanges',
                'Size Guide',
                'Track Your Order',
                'Contact Us',
              ].map((link) => (
                <li key={link}>
                  <button className="text-sm text-white/60 hover:text-white transition-colors">
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-4">
              About
            </h3>
            <ul className="space-y-2.5">
              {[
                'Our Story',
                'Reviews',
                'Sustainability',
                'Careers',
                'Wholesale',
                'Blog',
              ].map((link) => (
                <li key={link}>
                  <button className="text-sm text-white/60 hover:text-white transition-colors">
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Region */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/40 mb-4">
              Region
            </h3>
            <ul className="space-y-2.5">
              {['United States (USD $)', 'Australia (AUD $)', 'United Kingdom (GBP £)', 'Europe (EUR €)'].map(
                (link) => (
                  <li key={link}>
                    <button className="text-sm text-white/60 hover:text-white transition-colors">
                      {link}
                    </button>
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-white/40">
              (c) {new Date().getFullYear()} Threadheads. All rights reserved.
            </p>
            <div className="flex gap-6 text-xs text-white/40">
              <button className="hover:text-white transition-colors">Privacy Policy</button>
              <button className="hover:text-white transition-colors">Terms of Service</button>
              <button className="hover:text-white transition-colors">Cookie Settings</button>
            </div>
            <div className="flex gap-2 items-center text-xs text-white/40">
              <span>Powered by chaos</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
