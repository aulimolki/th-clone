import { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, Package, Plus, Store, Settings, Wallet,
  TrendingUp, ArrowLeft, Loader2, ExternalLink, Eye,
  Trash2, Copy, Check,
} from 'lucide-react';
import { useAuth } from '../auth';
import { supabase, type Creator, type Product } from '../supabase';
import {
  getCreatorByUserId, getCreatorProducts, getCreatorStats, BLANK_PRODUCTS,
  type CreatorStats,
} from '../creator';
import { formatIdr } from '../currency';

type Tab = 'overview' | 'products' | 'create' | 'store';

export default function CreatorDashboardPage({
  onNavigate,
}: {
  onNavigate: (path: string) => void;
}) {
  const { user, loading: authLoading } = useAuth();
  const [creator, setCreator] = useState<Creator | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('overview');

  const load = useCallback(async () => {
    if (!user) return;
    const c = await getCreatorByUserId(user.id);
    setCreator(c);
    if (c) {
      const [prods, s] = await Promise.all([
        getCreatorProducts(c.id),
        getCreatorStats(c.id),
      ]);
      setProducts(prods);
      setStats(s);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading) load();
  }, [authLoading, load]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in required</h1>
          <p className="text-gray-500 mb-6">You need to be signed in to access your dashboard.</p>
          <button onClick={() => onNavigate('#/')} className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <Store size={48} className="mx-auto text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">You don't have a store yet</h1>
          <p className="text-gray-500 mb-6">Open your CCC Creator store to start designing and selling.</p>
          <button
            onClick={() => onNavigate('#/creator/register')}
            className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Open Your Store
          </button>
        </div>
      </div>
    );
  }

  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'products', label: 'My Products', icon: <Package size={18} /> },
    { id: 'create', label: 'Create Product', icon: <Plus size={18} /> },
    { id: 'store', label: 'Store Settings', icon: <Settings size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('#/')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-3">
              {creator.avatar_url ? (
                <img src={creator.avatar_url} alt={creator.name} className="w-8 h-8 rounded-lg object-cover" />
              ) : (
                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                  <Store size={16} className="text-white" />
                </div>
              )}
              <div>
                <h1 className="text-sm font-bold text-gray-900">{creator.name}</h1>
                <p className="text-xs text-gray-500">ccc.id/store/{creator.slug}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate(`#/store/${creator.slug}`)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ExternalLink size={14} /> View Store
          </button>
          <CopyStoreLink slug={creator.slug} />
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-8 flex gap-8">
        {/* Sidebar */}
        <aside className="hidden lg:block w-60 flex-shrink-0">
          <nav className="space-y-1 sticky top-24">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  tab === item.id ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Mobile nav */}
        <div className="lg:hidden mb-4 flex gap-2 overflow-x-auto pb-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                tab === item.id ? 'bg-black text-white' : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {tab === 'overview' && <OverviewTab stats={stats} products={products} creator={creator} />}
          {tab === 'products' && (
            <ProductsTab
              products={products}
              onCreate={() => setTab('create')}
              onRefresh={load}
            />
          )}
          {tab === 'create' && <CreateTab onNavigate={onNavigate} />}
          {tab === 'store' && <StoreSettingsTab creator={creator} onUpdated={load} />}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ stats, products, creator }: { stats: CreatorStats | null; products: Product[]; creator: Creator }) {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Welcome back, {creator.name}</h2>
        <p className="text-sm text-gray-500 mt-1">Here's how your store is performing.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Products" value={stats?.totalProducts?.toString() ?? '0'} icon={<Package size={18} />} />
        <StatCard label="Published" value={stats?.publishedProducts?.toString() ?? '0'} icon={<Eye size={18} />} />
        <StatCard label="Total Sales" value={formatIdr(stats?.totalRevenue ?? 0)} icon={<TrendingUp size={18} />} />
        <StatCard label="Earnings" value={formatIdr(stats?.totalEarnings ?? 0)} icon={<Wallet size={18} />} />
      </div>

      {/* Recent products */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-base font-bold text-gray-900 mb-4">Recent Products</h3>
        {products.length === 0 ? (
          <div className="text-center py-12">
            <Package size={40} className="mx-auto text-gray-200 mb-3" />
            <p className="text-sm text-gray-400">No products yet. Create your first product to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {products.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={20} className="text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-gray-500">{formatIdr(p.price)}</p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    p.is_published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {p.is_published ? 'Published' : 'Draft'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Store status */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="text-base font-bold text-gray-900 mb-4">Store Status</h3>
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-sm font-medium text-gray-900 capitalize">{creator.status ?? 'active'}</span>
          <span className="text-xs text-gray-500">Member since {new Date(creator.member_since).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
        <span className="text-gray-400">{icon}</span>
      </div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function ProductsTab({
  products,
  onCreate,
  onRefresh,
}: {
  products: Product[];
  onCreate: () => void;
  onRefresh: () => void;
}) {
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    setDeleting(id);
    await supabase.from('products').delete().eq('id', id);
    setDeleting(null);
    onRefresh();
  };

  const togglePublish = async (p: Product) => {
    await supabase.from('products').update({ is_published: !p.is_published }).eq('id', p.id);
    onRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Products</h2>
        <button
          onClick={onCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus size={16} /> New Product
        </button>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Package size={48} className="mx-auto text-gray-200 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No products yet</h3>
          <p className="text-sm text-gray-500 mb-6">Create your first product using the CCC design editor.</p>
          <button
            onClick={onCreate}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <Plus size={16} /> Create Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden group">
              <div className="aspect-square bg-gray-100 overflow-hidden">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={32} className="text-gray-300" />
                  </div>
                )}
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-sm font-bold text-gray-900 truncate">{p.name}</p>
                  <p className="text-xs text-gray-500">{formatIdr(p.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => togglePublish(p)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      p.is_published ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {p.is_published ? 'Published' : 'Draft'}
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
                    disabled={deleting === p.id}
                    className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  >
                    {deleting === p.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateTab({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Create a Product</h2>
      <p className="text-sm text-gray-500">Choose a blank garment to start designing. You'll use the CCC design editor, set your price, and publish.</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {BLANK_PRODUCTS.map((b) => (
          <button
            key={b.slug}
            onClick={() => onNavigate(`#/customize/${b.slug}?mode=creator`)}
            className="bg-white rounded-2xl border border-gray-100 p-6 text-left hover:border-gray-300 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Plus size={24} className="text-white" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">{b.name}</h3>
            <p className="text-xs text-gray-500 mb-3">{b.desc}</p>
            <p className="text-xs font-medium text-gray-700">Base cost: {formatIdr(b.baseCost)}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function StoreSettingsTab({ creator, onUpdated }: { creator: Creator; onUpdated: () => void }) {
  const [name, setName] = useState(creator.name);
  const [bio, setBio] = useState(creator.bio ?? '');
  const [avatarUrl, setAvatarUrl] = useState(creator.avatar_url ?? '');
  const [coverUrl, setCoverUrl] = useState(creator.cover_url ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await supabase
      .from('creators')
      .update({ name, bio: bio || null, avatar_url: avatarUrl || null, cover_url: coverUrl || null })
      .eq('id', creator.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onUpdated();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Store Settings</h2>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Store Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Logo URL</label>
          <input
            type="text"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Banner URL</label>
          <input
            type="text"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors resize-none"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : saved ? <CheckIcon size={16} /> : null}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

function CheckIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function CopyStoreLink({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}${window.location.pathname}#/store/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
    >
      {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
      {copied ? 'Link copied' : 'Copy Link'}
    </button>
  );
}
