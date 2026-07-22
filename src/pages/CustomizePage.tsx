import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  RefreshCw,
  Undo2,
  Redo2,
  X,
  Plus,
  Trash2,
  ChevronRight,
  Check,
  ShoppingBag,
  ShieldCheck,
} from 'lucide-react';
import { supabase, type Product, type PrintType, type DesignData } from '../supabase';
import { useCart } from '../cart';

type Props = {
  slug: string;
  onNavigate: (path: string) => void;
};

/* ─── constants ─────────────────────────────────────────────── */

const TEE_COLORS = [
  { name: 'White',     hex: '#f5f5f5' },
  { name: 'Black',     hex: '#111111' },
  { name: 'Sand',      hex: '#d4b896' },
  { name: 'Slate',     hex: '#6b7280' },
  { name: 'Charcoal',  hex: '#374151' },
  { name: 'Brown',     hex: '#7c3f1e' },
  { name: 'Lavender',  hex: '#c4b5d0' },
  { name: 'Blue',      hex: '#7db3d8' },
  { name: 'Olive',     hex: '#6b6b3a' },
];

const FONT_FAMILIES = [
  { label: 'Impact',      value: 'Impact, Haettenschweiler, sans-serif',       preview: 'ABC' },
  { label: 'Georgia',     value: 'Georgia, serif',                             preview: 'ABC' },
  { label: 'Courier',     value: '"Courier New", Courier, monospace',          preview: 'ABC' },
  { label: 'Arial',       value: 'Arial, Helvetica, sans-serif',               preview: 'ABC' },
  { label: 'Verdana',     value: 'Verdana, Geneva, sans-serif',                preview: 'ABC' },
  { label: 'Palatino',    value: '"Palatino Linotype", Palatino, serif',       preview: 'ABC' },
  { label: 'Trebuchet',   value: '"Trebuchet MS", Helvetica, sans-serif',      preview: 'ABC' },
  { label: 'Comic Sans',  value: '"Comic Sans MS", cursive',                   preview: 'ABC' },
  { label: 'Franklin',    value: '"Franklin Gothic Medium", sans-serif',       preview: 'ABC' },
];

const FONT_COLORS = [
  { name: 'Aero Blue',    hex: '#3b82f6' },
  { name: 'Sky',          hex: '#93c5fd' },
  { name: 'White',        hex: '#ffffff' },
  { name: 'Purple',       hex: '#7c3aed' },
  { name: 'Pink',         hex: '#ec4899' },
  { name: 'Lime',         hex: '#84cc16' },
  { name: 'Forest',       hex: '#166534' },
  { name: 'Carmine Red',  hex: '#dc2626' },
  { name: 'Hot Pink',     hex: '#f43f5e' },
  { name: 'Orange',       hex: '#f97316' },
  { name: 'Tan',          hex: '#d4a574' },
  { name: 'Yellow',       hex: '#fbbf24' },
  { name: 'Gray',         hex: '#9ca3af' },
];

const STICKERS: { emoji: string; label: string }[] = [
  { emoji: '🤍', label: 'Heart outline' },
  { emoji: '💕', label: 'Two hearts' },
  { emoji: '💗', label: 'Pink heart' },
  { emoji: '✨', label: 'Sparkles' },
  { emoji: '👑', label: 'Crown' },
  { emoji: '❤️', label: 'Red heart' },
  { emoji: '🌈', label: 'Rainbow' },
  { emoji: '💎', label: 'Diamond' },
  { emoji: '⭐', label: 'Star' },
  { emoji: '🦋', label: 'Butterfly' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '🐾', label: 'Paw' },
  { emoji: '🌸', label: 'Flower' },
  { emoji: '🍄', label: 'Mushroom' },
  { emoji: '🎭', label: 'Drama' },
  { emoji: '💀', label: 'Skull' },
  { emoji: '🌊', label: 'Wave' },
  { emoji: '⚡', label: 'Lightning' },
];

const BACKGROUNDS = [
  { label: 'Storm',     url: 'https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?w=200&q=60' },
  { label: 'Ocean',     url: 'https://images.pexels.com/photos/1295138/pexels-photo-1295138.jpeg?w=200&q=60' },
  { label: 'Pink sky',  url: 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?w=200&q=60' },
  { label: 'Desert',    url: 'https://images.pexels.com/photos/2499588/pexels-photo-2499588.jpeg?w=200&q=60' },
  { label: 'Fog',       url: 'https://images.pexels.com/photos/167699/pexels-photo-167699.jpeg?w=200&q=60' },
  { label: 'Blue sky',  url: 'https://images.pexels.com/photos/3225529/pexels-photo-3225529.jpeg?w=200&q=60' },
  { label: 'Clouds',    url: 'https://images.pexels.com/photos/209831/pexels-photo-209831.jpeg?w=200&q=60' },
  { label: 'Sunset',    url: 'https://images.pexels.com/photos/1632790/pexels-photo-1632790.jpeg?w=200&q=60' },
  { label: 'Brick',     url: 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg?w=200&q=60' },
];

const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'];

const SIZE_CHART: { size: string; width: string; length: string }[] = [
  { size: 'XS',  width: '18"',  length: '26"' },
  { size: 'S',   width: '20"',  length: '27"' },
  { size: 'M',   width: '22"',  length: '28"' },
  { size: 'L',   width: '24"',  length: '29"' },
  { size: 'XL',  width: '26"',  length: '30"' },
  { size: '2XL', width: '28"',  length: '31"' },
  { size: '3XL', width: '30"',  length: '32"' },
  { size: '4XL', width: '32"',  length: '33"' },
];

/* ── tiered pricing ── */
const PRICE_TIERS = [
  { min: 1,  discount: 0,    label: '1-2 items' },
  { min: 3,  discount: 0.10, label: '3-5 items — 10% off' },
  { min: 6,  discount: 0.20, label: '6-11 items — 20% off' },
  { min: 12, discount: 0.30, label: '12+ items — 30% off' },
];

function getTier(quantity: number) {
  let tier = PRICE_TIERS[0];
  for (const t of PRICE_TIERS) if (quantity >= t.min) tier = t;
  return tier;
}

/* ─── state shape ────────────────────────────────────────────── */

type TextOption = { value: string; font: string; color: string };

type DesignState = {
  color: string;
  images: string[];
  text1: TextOption;
  text2: TextOption;
  sticker: string;
  background: string;
};

const DEFAULT_STATE: DesignState = {
  color: 'White',
  images: [],
  text1: { value: '', font: FONT_FAMILIES[0].value, color: FONT_COLORS[0].hex },
  text2: { value: '', font: FONT_FAMILIES[7].value, color: FONT_COLORS[7].hex },
  sticker: '',
  background: '',
};

/* ─── component ──────────────────────────────────────────────── */

export default function CustomizePage({ slug, onNavigate }: Props) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [design, setDesign] = useState<DesignState>(DEFAULT_STATE);
  const [history, setHistory] = useState<DesignState[]>([DEFAULT_STATE]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [step, setStep] = useState<'design' | 'checkout'>('design');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*, category:categories(*)')
        .eq('slug', slug)
        .maybeSingle();
      if (data) setProduct(data as unknown as Product);
      setLoading(false);
      window.scrollTo(0, 0);
    })();
  }, [slug]);

  /* ── history helpers ── */
  const pushHistory = (next: DesignState) => {
    const trimmed = history.slice(0, historyIndex + 1);
    setHistory([...trimmed, next]);
    setHistoryIndex(trimmed.length);
    setDesign(next);
  };

  const undo = () => {
    if (historyIndex <= 0) return;
    const idx = historyIndex - 1;
    setHistoryIndex(idx);
    setDesign(history[idx]);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const idx = historyIndex + 1;
    setHistoryIndex(idx);
    setDesign(history[idx]);
  };

  const reset = () => pushHistory(DEFAULT_STATE);
  const update = (partial: Partial<DesignState>) => pushHistory({ ...design, ...partial });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    files.slice(0, 6 - design.images.length).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setDesign((prev) => {
          const next = { ...prev, images: [...prev.images, reader.result as string] };
          pushHistory(next);
          return next;
        });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeImage = (idx: number) =>
    update({ images: design.images.filter((_, i) => i !== idx) });

  const activeColor = TEE_COLORS.find((c) => c.name === design.color) ?? TEE_COLORS[0];
  const activeBg = BACKGROUNDS.find((b) => b.label === design.background);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Product not found.</p>
        <button onClick={() => onNavigate('#/')} className="underline font-medium">Back to home</button>
      </div>
    );
  }

  /* ── checkout step ── */
  if (step === 'checkout') {
    return (
      <CheckoutStep
        product={product}
        design={design}
        slug={slug}
        onNavigate={onNavigate}
        onBack={() => setStep('design')}
        addToCart={addToCart}
      />
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f4f4]">
      {/* ── LEFT: tee preview ── */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden p-8">
        <button
          onClick={() => onNavigate(`#/product/${slug}`)}
          className="absolute top-4 left-4 flex items-center gap-1.5 text-sm text-gray-600 hover:text-black z-10 bg-white/80 px-3 py-2 rounded-full shadow-sm"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <div className="relative max-w-lg w-full">
          <div
            className="relative w-full aspect-[5/6] rounded-sm overflow-hidden transition-colors duration-300"
            style={{ backgroundColor: activeColor.hex }}
          >
            <img
              src={product.image_url}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover mix-blend-multiply"
            />
            <div
              className="absolute border-2 border-dashed border-gray-400/70 overflow-hidden"
              style={{ top: '18%', left: '22%', right: '22%', bottom: '22%' }}
            >
              {activeBg && (
                <img src={activeBg.url} alt={activeBg.label} className="absolute inset-0 w-full h-full object-cover opacity-80" />
              )}
              {design.images[0] && (
                <img src={design.images[0]} alt="Custom" className="absolute inset-0 w-full h-full object-contain p-2" />
              )}
              {design.sticker && (
                <div className="absolute top-2 right-2 text-4xl leading-none select-none">{design.sticker}</div>
              )}
              {design.text1.value && (
                <div
                  className="absolute top-2 left-0 right-0 text-center px-2 font-bold text-2xl leading-tight"
                  style={{ fontFamily: design.text1.font, color: design.text1.color }}
                >
                  {design.text1.value}
                </div>
              )}
              {design.text2.value && (
                <div
                  className="absolute bottom-2 left-0 right-0 text-center px-2 font-bold text-xl leading-tight"
                  style={{ fontFamily: design.text2.font, color: design.text2.color }}
                >
                  {design.text2.value}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: control panel ── */}
      <div className="w-[360px] flex-shrink-0 bg-white flex flex-col shadow-xl">
        {/* Toolbar */}
        <div className="flex items-center justify-end gap-1 px-4 py-3 border-b border-gray-100">
          <ToolBtn onClick={reset} title="Reset design"><RefreshCw size={15} /></ToolBtn>
          <ToolBtn onClick={undo} title="Undo" disabled={historyIndex <= 0}><Undo2 size={15} /></ToolBtn>
          <ToolBtn onClick={redo} title="Redo" disabled={historyIndex >= history.length - 1}><Redo2 size={15} /></ToolBtn>
          <ToolBtn onClick={() => onNavigate(`#/product/${slug}`)} title="Close"><X size={15} /></ToolBtn>
        </div>

        {/* Scrollable sections */}
        <div className="flex-1 overflow-y-auto">
          {/* ── Colour — small circles ── */}
          <Section title="Colour">
            <div className="flex flex-wrap gap-3">
              {TEE_COLORS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => update({ color: c.name })}
                  title={c.name}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    design.color === c.name
                      ? 'border-violet-500 ring-2 ring-violet-300 ring-offset-2'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">Selected: <span className="font-medium text-gray-700">{design.color}</span></p>
          </Section>

          {/* ── Upload Images ── */}
          <Section title="Upload Your Images" badge={`${design.images.length}/6`}>
            <div className="flex flex-wrap gap-2 mb-3">
              {design.images.map((src, i) => (
                <div key={i} className="relative w-14 h-14">
                  <img src={src} className="w-full h-full object-cover rounded border border-gray-200" alt="" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-700 text-white rounded-full flex items-center justify-center"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
              {design.images.length < 6 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-14 h-14 border-2 border-dashed border-gray-300 rounded flex items-center justify-center hover:border-gray-500 transition-colors"
                >
                  <Plus size={18} className="text-gray-400" />
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 rounded text-sm font-semibold text-white flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}
            >
              <Plus size={16} /> Upload Image
            </button>
          </Section>

          {/* ── Add Your Text ── */}
          <Section title="Add Your Text">
            <TextEditor label="TEXT OPTION 1" value={design.text1} maxLength={20} onChange={(t1) => update({ text1: t1 })} />
            <div className="mt-4">
              <TextEditor label="TEXT OPTION 2" value={design.text2} maxLength={30} onChange={(t2) => update({ text2: t2 })} />
            </div>
          </Section>

          {/* ── Spice it up ── */}
          <Section title="Spice it up">
            <p className="text-xs font-semibold text-gray-700 mb-2">Add Stickers</p>
            <div className="grid grid-cols-6 gap-1.5 mb-5">
              {STICKERS.map((s) => (
                <button
                  key={s.emoji}
                  onClick={() => update({ sticker: design.sticker === s.emoji ? '' : s.emoji })}
                  title={s.label}
                  className={`aspect-square text-xl flex items-center justify-center rounded transition-all ${
                    design.sticker === s.emoji ? 'bg-violet-100 ring-2 ring-violet-400' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {s.emoji}
                </button>
              ))}
            </div>
            <p className="text-xs font-semibold text-gray-700 mb-2">Add Backgrounds</p>
            <div className="grid grid-cols-3 gap-2">
              {BACKGROUNDS.map((bg) => (
                <button
                  key={bg.label}
                  onClick={() => update({ background: design.background === bg.label ? '' : bg.label })}
                  title={bg.label}
                  className={`aspect-square rounded overflow-hidden border-2 transition-all ${
                    design.background === bg.label ? 'border-violet-500 ring-2 ring-violet-300' : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img src={bg.url} alt={bg.label} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </Section>
        </div>

        {/* Sticky Continue */}
        <div className="p-4 border-t border-gray-100">
          <button
            className="w-full py-4 rounded text-white font-semibold text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)' }}
            onClick={() => setStep('checkout')}
          >
            Continue <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── checkout step ──────────────────────────────────────────── */

function CheckoutStep({
  product,
  design,
  slug,
  onNavigate,
  onBack,
  addToCart,
}: {
  product: Product;
  design: DesignState;
  slug: string;
  onNavigate: (path: string) => void;
  onBack: () => void;
  addToCart: (product: Product, size: string, quantity: number, printType: PrintType, color?: string, designData?: DesignData) => Promise<void>;
}) {
  const [rightsChecked, setRightsChecked] = useState(false);
  const [size, setSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [printType, setPrintType] = useState<PrintType>('DTG');
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [added, setAdded] = useState(false);

  const tier = getTier(quantity);
  const unitPrice = Number(product.price) * (1 - tier.discount);
  const total = unitPrice * quantity;
  const savings = (Number(product.price) - unitPrice) * quantity;

  const handleAddToCart = async () => {
    if (!size) return;
    const designData: DesignData = {
      color: design.color,
      images: design.images,
      text1: design.text1,
      text2: design.text2,
      sticker: design.sticker,
      background: design.background,
    };
    await addToCart(product, size, quantity, printType, design.color, designData);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onNavigate(`#/product/${slug}`);
    }, 1500);
  };

  const canAdd = rightsChecked && !!size;

  return (
    <div className="min-h-screen bg-[#f4f4f4] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-black mb-6"
        >
          <ArrowLeft size={14} /> Back to designer
        </button>

        <h1 className="text-2xl font-black tracking-tight mb-1">Review & Checkout</h1>
        <p className="text-sm text-gray-500 mb-8">Confirm your design, choose your size, and add to cart.</p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Design summary */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wide mb-4">Your Design</h2>
            <div className="flex gap-4">
              <div
                className="w-28 h-32 rounded-sm overflow-hidden flex-shrink-0 border border-gray-200"
                style={{ backgroundColor: TEE_COLORS.find((c) => c.name === design.color)?.hex ?? '#fff' }}
              >
                <img src={product.image_url} alt="" className="w-full h-full object-cover mix-blend-multiply" />
              </div>
              <div className="space-y-1.5 text-sm">
                <DesignRow label="Color" value={design.color} />
                <DesignRow label="Text 1" value={design.text1.value || '—'} />
                <DesignRow label="Text 2" value={design.text2.value || '—'} />
                <DesignRow label="Sticker" value={design.sticker || '—'} />
                <DesignRow label="Background" value={design.background || '—'} />
                <DesignRow label="Images" value={design.images.length ? `${design.images.length} uploaded` : 'None'} />
              </div>
            </div>
          </div>

          {/* Print type */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wide mb-4">Print Type</h2>
            <div className="grid grid-cols-2 gap-2">
              {(['DTG', 'DTF'] as PrintType[]).map((pt) => (
                <button
                  key={pt}
                  onClick={() => setPrintType(pt)}
                  className={`py-3 text-sm font-medium border rounded transition-all ${
                    printType === pt ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <div className="font-bold">{pt}</div>
                  <div className="text-[10px] font-normal opacity-80 mt-0.5">
                    {pt === 'DTG' ? 'Direct-to-Garment' : 'Direct-to-Film'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Design rights checkbox */}
        <div className="bg-white rounded-lg p-6 shadow-sm mt-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <button
              type="button"
              onClick={() => setRightsChecked(!rightsChecked)}
              className={`mt-0.5 w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                rightsChecked ? 'bg-violet-600 border-violet-600' : 'border-gray-300 hover:border-violet-400'
              }`}
            >
              {rightsChecked && <Check size={16} className="text-white" />}
            </button>
            <div>
              <span className="text-sm font-semibold text-gray-900">I confirm I own the rights to this design</span>
              <p className="text-xs text-gray-500 mt-1">
                I confirm that I own or have permission to use all uploaded images, text, and graphics in this design,
                and that it does not infringe on any third-party copyrights, trademarks, or intellectual property rights.
              </p>
            </div>
          </label>
        </div>

        {/* Size selection + size chart */}
        <div className="bg-white rounded-lg p-6 shadow-sm mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wide">Select Size</h2>
            <button
              onClick={() => setShowSizeChart(!showSizeChart)}
              className="text-xs underline text-gray-500 hover:text-violet-600"
            >
              {showSizeChart ? 'Hide size chart' : 'View size chart'}
            </button>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
            {SIZES.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`py-3 text-sm font-medium border rounded transition-all ${
                  size === s ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {showSizeChart && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 font-bold">Size</th>
                    <th className="text-left py-2 font-bold">Chest Width</th>
                    <th className="text-left py-2 font-bold">Body Length</th>
                  </tr>
                </thead>
                <tbody>
                  {SIZE_CHART.map((row) => (
                    <tr key={row.size} className="border-b border-gray-100">
                      <td className="py-2 font-medium">{row.size}</td>
                      <td className="py-2 text-gray-600">{row.width}</td>
                      <td className="py-2 text-gray-600">{row.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quantity + tiered pricing */}
        <div className="bg-white rounded-lg p-6 shadow-sm mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wide mb-4">Quantity & Pricing</h2>

          {/* Quantity selector */}
          <div className="flex items-center gap-4 mb-5">
            <span className="text-sm text-gray-600">Quantity</span>
            <div className="flex items-center border border-gray-200 rounded">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-4 py-2 text-lg hover:bg-gray-50"
              >−</button>
              <span className="px-6 text-sm font-semibold">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(99, quantity + 1))}
                className="px-4 py-2 text-lg hover:bg-gray-50"
              >+</button>
            </div>
          </div>

          {/* Tier table */}
          <div className="space-y-2 mb-5">
            {PRICE_TIERS.map((t) => {
              const active = quantity >= t.min && (t === PRICE_TIERS[PRICE_TIERS.length - 1] || quantity < PRICE_TIERS[PRICE_TIERS.indexOf(t) + 1].min);
              return (
                <div
                  key={t.min}
                  className={`flex items-center justify-between px-4 py-2.5 rounded text-sm transition-all ${
                    active ? 'bg-violet-50 border border-violet-300' : 'bg-gray-50'
                  }`}
                >
                  <span className={active ? 'font-bold text-violet-700' : 'text-gray-600'}>
                    {t.label}
                  </span>
                  {active && <Check size={16} className="text-violet-600" />}
                </div>
              );
            })}
          </div>

          {/* Price summary */}
          <div className="border-t border-gray-100 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Unit price</span>
              <span className="font-medium">
                {tier.discount > 0 ? (
                  <>
                    <span className="text-gray-400 line-through mr-2">{`${Number(product.price).toFixed(2)}`}</span>
                    {`${unitPrice.toFixed(2)}`}
                  </>
                ) : (
                  `${unitPrice.toFixed(2)}`
                )}
              </span>
            </div>
            {savings > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-green-600 font-medium">Bulk savings</span>
                <span className="text-green-600 font-medium">−{`${savings.toFixed(2)}`}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold pt-2 border-t border-gray-100">
              <span>Total</span>
              <span>{`${total.toFixed(2)}`}</span>
            </div>
          </div>
        </div>

        {/* Add to cart */}
        <div className="mt-6">
          <button
            onClick={handleAddToCart}
            disabled={!canAdd}
            className={`w-full py-4 rounded text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all ${
              canAdd
                ? 'bg-black text-white hover:bg-gray-800'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {added ? (
              <><Check size={18} /> Added to Cart!</>
            ) : (
              <><ShoppingBag size={18} /> Add to Cart — {`${total.toFixed(2)}`}</>
            )}
          </button>
          {!canAdd && (
            <p className="text-xs text-gray-400 text-center mt-2">
              {!rightsChecked && !size ? 'Please confirm design rights and select a size' :
               !rightsChecked ? 'Please confirm you own the rights to this design' :
               'Please select a size'}
            </p>
          )}
          <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-gray-400">
            <ShieldCheck size={14} /> Secure checkout with encrypted payment
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── helpers ────────────────────────────────────────────────── */

function DesignRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-gray-400 w-20">{label}</span>
      <span className="font-medium text-gray-800 truncate">{value}</span>
    </div>
  );
}

function Section({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-4 py-5 border-b border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-900">{title}</h2>
        {badge && <span className="text-xs text-gray-400">{badge}</span>}
      </div>
      {children}
    </div>
  );
}

function ToolBtn({
  onClick,
  title,
  disabled,
  children,
}: {
  onClick: () => void;
  title: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${
        disabled ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );
}

function TextEditor({
  label,
  value,
  maxLength,
  onChange,
}: {
  label: string;
  value: { value: string; font: string; color: string };
  maxLength: number;
  onChange: (v: { value: string; font: string; color: string }) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-bold text-gray-600">{label}</span>
        <span className="text-xs text-gray-400">{value.value.length}/{maxLength}</span>
      </div>
      <input
        type="text"
        value={value.value}
        maxLength={maxLength}
        onChange={(e) => onChange({ ...value, value: e.target.value })}
        className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-violet-400 mb-3"
        placeholder="Enter text…"
      />
      <p className="text-xs text-gray-500 mb-2">Font Family</p>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {FONT_FAMILIES.map((f) => (
          <button
            key={f.label}
            onClick={() => onChange({ ...value, font: f.value })}
            title={f.label}
            className={`px-2 py-1.5 text-xs rounded border transition-all ${
              value.font === f.value ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-200 hover:border-gray-400'
            }`}
            style={{ fontFamily: f.value }}
          >
            {f.preview}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500 mb-2">
        Font Color: <span className="font-medium text-gray-700">{FONT_COLORS.find((c) => c.hex === value.color)?.name ?? 'Custom'}</span>
      </p>
      <div className="flex flex-wrap gap-2">
        {FONT_COLORS.map((c) => (
          <button
            key={c.hex}
            onClick={() => onChange({ ...value, color: c.hex })}
            title={c.name}
            className={`w-7 h-7 rounded-full border-2 transition-all ${
              value.color === c.hex ? 'border-violet-500 ring-2 ring-violet-300 ring-offset-1' : 'border-gray-200 hover:border-gray-400'
            }`}
            style={{ backgroundColor: c.hex }}
          />
        ))}
      </div>
    </div>
  );
}
