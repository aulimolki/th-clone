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
  Minus,
} from 'lucide-react';
import { supabase, type Product, type PrintType, type DesignData } from '../supabase';
import { useCart } from '../cart';

type Props = {
  slug: string;
  onNavigate: (path: string) => void;
  editItemId?: string;
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

export default function CustomizePage({ slug, onNavigate, editItemId }: Props) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [design, setDesign] = useState<DesignState>(DEFAULT_STATE);
  const [history, setHistory] = useState<DesignState[]>([DEFAULT_STATE]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [step, setStep] = useState<'design' | 'checkout'>('design');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToCart, items, updateItemDesign } = useCart();
  const isEditing = Boolean(editItemId);

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

  useEffect(() => {
    if (!editItemId || items.length === 0) return;
    const item = items.find((i) => i.id === editItemId);
    if (!item || !item.design_data) return;
    const d = item.design_data;
    const restored: DesignState = {
      color: d.color,
      images: d.images,
      text1: d.text1,
      text2: d.text2,
      sticker: d.sticker,
      background: d.background,
    };
    setDesign(restored);
    setHistory([restored]);
    setHistoryIndex(0);
  }, [editItemId, items]);

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

      {/* ── Checkout overlay ── */}
      {step === 'checkout' && (
        <CheckoutOverlay
          product={product}
          design={design}
          activeColorHex={activeColor.hex}
          activeBg={activeBg}
          onClose={() => setStep('design')}
          onNavigate={onNavigate}
          addToCart={addToCart}
          editItemId={editItemId}
          updateItemDesign={updateItemDesign}
        />
      )}
    </div>
  );
}

/* ─── checkout overlay ───────────────────────────────────────── */

function CheckoutOverlay({
  product,
  design,
  activeColorHex,
  activeBg,
  onClose,
  onNavigate,
  addToCart,
  editItemId,
  updateItemDesign,
}: {
  product: Product;
  design: DesignState;
  activeColorHex: string;
  activeBg: { label: string; url: string } | undefined;
  onClose: () => void;
  onNavigate: (path: string) => void;
  addToCart: (product: Product, size: string, quantity: number, printType: PrintType, color?: string, designData?: DesignData) => Promise<void>;
  editItemId?: string;
  updateItemDesign: (id: string, color: string, designData: DesignData) => Promise<void>;
}) {
  const isEditing = Boolean(editItemId);
  const [rightsChecked, setRightsChecked] = useState(false);
  const [printType, setPrintType] = useState<PrintType>('DTG');
  const [sizeQtys, setSizeQtys] = useState<Record<string, number>>({});
  const [added, setAdded] = useState(false);

  const totalQty = Object.values(sizeQtys).reduce((a, b) => a + b, 0);
  const tier = getTier(totalQty);
  const unitPrice = Number(product.price) * (1 - tier.discount);
  const total = unitPrice * totalQty;
  const savings = (Number(product.price) - unitPrice) * totalQty;

  const setQty = (size: string, delta: number) => {
    setSizeQtys((prev) => {
      const next = Math.max(0, (prev[size] ?? 0) + delta);
      return { ...prev, [size]: next };
    });
  };

  const handleAddToCart = async () => {
    if (!rightsChecked || totalQty === 0) return;
    const designData: DesignData = {
      color: design.color,
      images: design.images,
      text1: design.text1,
      text2: design.text2,
      sticker: design.sticker,
      background: design.background,
    };
    if (isEditing && editItemId) {
      await updateItemDesign(editItemId, design.color, designData);
    } else {
      for (const [size, qty] of Object.entries(sizeQtys)) {
        if (qty > 0) await addToCart(product, size, qty, printType, design.color, designData);
      }
    }
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onNavigate(`#/product/${product.slug}`);
    }, 1500);
  };

  const canAdd = rightsChecked && (isEditing || totalQty > 0);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 transition-opacity" onClick={onClose} />
      <div className="relative w-[400px] max-w-full bg-white h-full flex flex-col shadow-2xl animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold">{isEditing ? 'Edit Design' : 'Review & Checkout'}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {/* Tee preview thumbnail */}
          <div className="px-5 py-5 border-b border-gray-100">
            <div className="flex gap-4">
              <div
                className="relative w-24 h-28 rounded-sm overflow-hidden flex-shrink-0 border border-gray-200"
                style={{ backgroundColor: activeColorHex }}
              >
                <img src={product.image_url} alt="" className="w-full h-full object-cover mix-blend-multiply" />
                <div className="absolute inset-0 flex items-center justify-center">
                  {design.text1.value && (
                    <span
                      className="text-[10px] font-bold text-center px-1 leading-tight"
                      style={{ fontFamily: design.text1.font, color: design.text1.color }}
                    >
                      {design.text1.value}
                    </span>
                  )}
                  {design.sticker && <span className="absolute top-1 right-1 text-sm">{design.sticker}</span>}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{product.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">Color: {design.color}</p>
                <p className="text-xs text-gray-500">Print: {printType}</p>
                {design.text1.value && <p className="text-xs text-gray-500 truncate">Text: {design.text1.value}</p>}
                {design.text2.value && <p className="text-xs text-gray-500 truncate">Text 2: {design.text2.value}</p>}
                {design.sticker && <p className="text-xs text-gray-500">Sticker: {design.sticker}</p>}
                {design.images.length > 0 && <p className="text-xs text-gray-500">{design.images.length} image(s)</p>}
              </div>
            </div>
          </div>

          {/* Print type */}
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-700 mb-2">Print Type</p>
            <div className="grid grid-cols-2 gap-2">
              {(['DTG', 'DTF'] as PrintType[]).map((pt) => (
                <button
                  key={pt}
                  onClick={() => setPrintType(pt)}
                  className={`py-2.5 text-xs font-medium border rounded transition-all ${
                    printType === pt ? 'border-violet-500 bg-violet-50 text-violet-700' : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <div className="font-bold">{pt}</div>
                  <div className="text-[9px] font-normal opacity-80 mt-0.5">
                    {pt === 'DTG' ? 'Direct-to-Garment' : 'Direct-to-Film'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Per-size quantity grid */}
          {!isEditing && (
            <div className="px-5 py-4 border-b border-gray-100">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-700 mb-3">Select Sizes & Quantity</p>
              <div className="grid grid-cols-2 gap-2">
                {SIZES.map((s) => {
                  const qty = sizeQtys[s] ?? 0;
                  return (
                    <div
                      key={s}
                      className={`flex items-center justify-between border rounded-lg px-3 py-2 transition-all ${
                        qty > 0 ? 'border-violet-400 bg-violet-50' : 'border-gray-200'
                      }`}
                    >
                      <span className="text-sm font-semibold w-8">{s}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setQty(s, -1)}
                          disabled={qty === 0}
                          className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-30"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-7 text-center text-sm font-semibold">{qty}</span>
                        <button
                          onClick={() => setQty(s, 1)}
                          className="w-7 h-7 flex items-center justify-center rounded border border-gray-200 hover:bg-gray-50"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tiered savings progress */}
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-700 mb-3">Bulk Savings</p>
            <div className="space-y-2">
              {PRICE_TIERS.map((t, i) => {
                const nextTier = PRICE_TIERS[i + 1];
                const isUnlocked = totalQty >= t.min;
                const isCurrent = isUnlocked && (!nextTier || totalQty < nextTier.min);
                const progress = isUnlocked ? 100 : Math.min(100, (totalQty / t.min) * 100);
                return (
                  <div key={t.min}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs ${isCurrent ? 'font-bold text-violet-700' : isUnlocked ? 'text-green-600' : 'text-gray-500'}`}>
                        {t.label}
                      </span>
                      {isUnlocked && <Check size={14} className={isCurrent ? 'text-violet-600' : 'text-green-500'} />}
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isCurrent ? 'bg-violet-500' : isUnlocked ? 'bg-green-500' : 'bg-gray-300'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            {tier.discount > 0 && totalQty > 0 && (
              <p className="text-xs text-green-600 font-medium mt-2">
                You save {`${savings.toFixed(2)}`} ({Math.round(tier.discount * 100)}% off)
              </p>
            )}
            {tier.discount === 0 && totalQty > 0 && totalQty < 3 && (
              <p className="text-xs text-gray-400 mt-2">Add {3 - totalQty} more to unlock 10% off</p>
            )}
          </div>

          {/* Design rights */}
          <div className="px-5 py-4 border-b border-gray-100">
            <button
              type="button"
              onClick={() => setRightsChecked(!rightsChecked)}
              className="flex items-start gap-3 text-left w-full"
            >
              <div className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                rightsChecked ? 'bg-violet-600 border-violet-600' : 'border-gray-300 hover:border-violet-400'
              }`}>
                {rightsChecked && <Check size={13} className="text-white" />}
              </div>
              <div>
                <span className="text-xs font-semibold text-gray-900">I own the rights to this design</span>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                  I confirm I have permission to use all uploaded images, text, and graphics, and that it does not infringe on any third-party copyrights or trademarks.
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Sticky footer: summary + add to cart */}
        <div className="border-t border-gray-100 px-5 py-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Items</span>
            <span className="font-medium">{totalQty}</span>
          </div>
          {tier.discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600 font-medium">Bulk savings</span>
              <span className="text-green-600 font-medium">−{`${savings.toFixed(2)}`}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold">
            <span>Total</span>
            <span>{`${total.toFixed(2)}`}</span>
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!canAdd}
            className={`w-full py-3.5 rounded text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all ${
              canAdd ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {added ? (
              <><Check size={18} /> {isEditing ? 'Design Updated!' : 'Added to Cart!'}</>
            ) : (
              <>{isEditing ? <><RefreshCw size={18} /> Update Design</> : <><ShoppingBag size={18} /> Add to Cart</>}</>
            )}
          </button>
          {!canAdd && (
            <p className="text-[11px] text-gray-400 text-center">
              {!rightsChecked ? 'Please confirm design rights' : 'Select at least one size'}
            </p>
          )}
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
            <ShieldCheck size={13} /> Secure checkout
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── helpers ────────────────────────────────────────────────── */

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
