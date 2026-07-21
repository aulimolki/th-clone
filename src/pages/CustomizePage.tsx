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
} from 'lucide-react';
import { supabase, type Product } from '../supabase';

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

/* ─── state shape ────────────────────────────────────────────── */

type TextOption = {
  value: string;
  font: string;
  color: string;
};

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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const reset = () => {
    pushHistory(DEFAULT_STATE);
  };

  const update = (partial: Partial<DesignState>) => {
    pushHistory({ ...design, ...partial });
  };

  /* ── image upload ── */
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

  const removeImage = (idx: number) => {
    update({ images: design.images.filter((_, i) => i !== idx) });
  };

  /* ── derived ── */
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
        <button onClick={() => onNavigate('#/')} className="underline font-medium">
          Back to home
        </button>
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

        {/* Tee mockup */}
        <div className="relative max-w-lg w-full">
          {/* Tee shape with background color */}
          <div
            className="relative w-full aspect-[5/6] rounded-sm overflow-hidden transition-colors duration-300"
            style={{ backgroundColor: activeColor.hex }}
          >
            {/* Tee image overlaid with mix-blend to color it */}
            <img
              src={product.image_url}
              alt={product.name}
              className="absolute inset-0 w-full h-full object-cover mix-blend-multiply"
            />

            {/* Design print area */}
            <div
              className="absolute border-2 border-dashed border-gray-400/70 overflow-hidden"
              style={{ top: '18%', left: '22%', right: '22%', bottom: '22%' }}
            >
              {/* Background layer */}
              {activeBg && (
                <img
                  src={activeBg.url}
                  alt={activeBg.label}
                  className="absolute inset-0 w-full h-full object-cover opacity-80"
                />
              )}

              {/* Uploaded image */}
              {design.images[0] && (
                <img
                  src={design.images[0]}
                  alt="Custom"
                  className="absolute inset-0 w-full h-full object-contain p-2"
                />
              )}

              {/* Sticker */}
              {design.sticker && (
                <div className="absolute top-2 right-2 text-4xl leading-none select-none">
                  {design.sticker}
                </div>
              )}

              {/* Text 1 — top */}
              {design.text1.value && (
                <div
                  className="absolute top-2 left-0 right-0 text-center px-2 font-bold text-2xl leading-tight"
                  style={{ fontFamily: design.text1.font, color: design.text1.color }}
                >
                  {design.text1.value}
                </div>
              )}

              {/* Text 2 — bottom */}
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
          {/* ── Colour ── */}
          <Section title="Colour">
            <div className="grid grid-cols-3 gap-2">
              {TEE_COLORS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => update({ color: c.name })}
                  title={c.name}
                  className={`aspect-square rounded border-2 transition-all flex items-center justify-center ${
                    design.color === c.name
                      ? 'border-violet-500 ring-2 ring-violet-300'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: c.hex }}
                >
                  {design.color === c.name && (
                    <div className="w-3 h-3 rounded-full bg-violet-500 shadow" />
                  )}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {TEE_COLORS.map((c) => (
                <span key={c.name} className="text-center text-[10px] text-gray-500 truncate">
                  {c.name}
                </span>
              ))}
            </div>
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
            <TextEditor
              label="TEXT OPTION 1"
              value={design.text1}
              maxLength={20}
              onChange={(t1) => update({ text1: t1 })}
            />
            <div className="mt-4">
              <TextEditor
                label="TEXT OPTION 2"
                value={design.text2}
                maxLength={30}
                onChange={(t2) => update({ text2: t2 })}
              />
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
                    design.sticker === s.emoji
                      ? 'bg-violet-100 ring-2 ring-violet-400'
                      : 'bg-gray-50 hover:bg-gray-100'
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
                    design.background === bg.label
                      ? 'border-violet-500 ring-2 ring-violet-300'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <img
                    src={bg.url}
                    alt={bg.label}
                    className="w-full h-full object-cover"
                  />
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
            onClick={() => onNavigate(`#/product/${slug}`)}
          >
            Continue <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── sub-components ─────────────────────────────────────────── */

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
        <span className="text-xs text-gray-400">
          {value.value.length}/{maxLength}
        </span>
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
              value.font === f.value
                ? 'border-violet-500 bg-violet-50 text-violet-700'
                : 'border-gray-200 hover:border-gray-400'
            }`}
            style={{ fontFamily: f.value }}
          >
            {f.preview}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-500 mb-2">
        Font Color:{' '}
        <span className="font-medium text-gray-700">
          {FONT_COLORS.find((c) => c.hex === value.color)?.name ?? 'Custom'}
        </span>
      </p>
      <div className="flex flex-wrap gap-2">
        {FONT_COLORS.map((c) => (
          <button
            key={c.hex}
            onClick={() => onChange({ ...value, color: c.hex })}
            title={c.name}
            className={`w-7 h-7 rounded-full border-2 transition-all ${
              value.color === c.hex
                ? 'border-violet-500 ring-2 ring-violet-300 ring-offset-1'
                : 'border-gray-200 hover:border-gray-400'
            }`}
            style={{ backgroundColor: c.hex }}
          />
        ))}
      </div>
    </div>
  );
}
