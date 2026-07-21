import { useEffect, useState } from 'react';
import { ArrowLeft, Upload, Type, Image as ImageIcon, Trash2, Download } from 'lucide-react';
import { supabase, type Product, type PrintType } from '../supabase';

type Props = {
  slug: string;
  onNavigate: (path: string) => void;
};

const TEE_COLORS = [
  { name: 'White', hex: '#ffffff' },
  { name: 'Black', hex: '#111111' },
  { name: 'Navy', hex: '#1e2a4a' },
  { name: 'Gray', hex: '#9ca3af' },
  { name: 'Red', hex: '#c8312b' },
  { name: 'Blue', hex: '#2563eb' },
  { name: 'Green', hex: '#1f8a4c' },
];

export default function CustomizePage({ slug, onNavigate }: Props) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [color, setColor] = useState(TEE_COLORS[0].name);
  const [printType, setPrintType] = useState<PrintType>('DTG');
  const [text, setText] = useState('');
  const [textColor, setTextColor] = useState('#111111');
  const [fontSize, setFontSize] = useState(48);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-12">
        <div className="h-8 w-32 bg-gray-100 animate-pulse mb-6" />
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-100 animate-pulse" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-100 animate-pulse w-3/4" />
            <div className="h-32 bg-gray-100 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-[1600px] mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 mb-4">Product not found.</p>
        <button onClick={() => onNavigate('#/')} className="underline font-medium">
          Back to home
        </button>
      </div>
    );
  }

  const activeColor = TEE_COLORS.find((c) => c.name === color) ?? TEE_COLORS[0];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-6">
      <button
        onClick={() => onNavigate(`#/product/${slug}`)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-black mb-6"
      >
        <ArrowLeft size={16} /> Back to product
      </button>

      <h1 className="text-2xl lg:text-3xl font-black tracking-tight mb-1">
        Customize your {product.name}
      </h1>
      <p className="text-sm text-gray-500 mb-8">
        Add text or an image to your tee. Choose a color and print type, then download your design mockup.
      </p>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Preview */}
        <div className="md:sticky md:top-6 self-start">
          <div
            className="relative aspect-square rounded-lg overflow-hidden shadow-sm flex items-center justify-center"
            style={{ backgroundColor: activeColor.hex }}
          >
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Custom design"
                className="max-w-[60%] max-h-[60%] object-contain"
              />
            )}
            {text && !imagePreview && (
              <span
                className="font-bold text-center px-6 break-words"
                style={{ color: textColor, fontSize: `${fontSize}px` }}
              >
                {text}
              </span>
            )}
            {imagePreview && text && (
              <span
                className="absolute bottom-8 font-bold text-center px-6 break-words"
                style={{ color: textColor, fontSize: `${fontSize * 0.6}px` }}
              >
                {text}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">
            Mockup preview — final print placement may vary slightly
          </p>
        </div>

        {/* Controls */}
        <div className="space-y-8">
          {/* Color */}
          <div>
            <span className="text-sm font-bold uppercase tracking-wide mb-3 block">
              Tee Color — <span className="font-normal normal-case">{color}</span>
            </span>
            <div className="flex flex-wrap gap-3">
              {TEE_COLORS.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setColor(c.name)}
                  title={c.name}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    color === c.name
                      ? 'border-black ring-2 ring-black ring-offset-2'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>

          {/* Print type */}
          <div>
            <span className="text-sm font-bold uppercase tracking-wide mb-2 block">
              Print Type
            </span>
            <div className="grid grid-cols-2 gap-2">
              {(['DTG', 'DTF'] as PrintType[]).map((pt) => (
                <button
                  key={pt}
                  onClick={() => setPrintType(pt)}
                  className={`py-3 text-sm font-medium border transition-all ${
                    printType === pt
                      ? 'border-black bg-black text-white'
                      : 'border-gray-200 hover:border-black'
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

          {/* Text */}
          <div>
            <span className="text-sm font-bold uppercase tracking-wide mb-2 flex items-center gap-2">
              <Type size={14} /> Add Text
            </span>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your text..."
              maxLength={40}
              className="w-full px-4 py-3 border border-gray-200 focus:border-black outline-none text-sm"
            />
            {text && (
              <div className="mt-3 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-20">Text color</span>
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer border border-gray-200"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-500 w-20">Font size</span>
                  <input
                    type="range"
                    min={20}
                    max={100}
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-xs text-gray-500 w-10 text-right">{fontSize}px</span>
                </div>
              </div>
            )}
          </div>

          {/* Image upload */}
          <div>
            <span className="text-sm font-bold uppercase tracking-wide mb-2 flex items-center gap-2">
              <ImageIcon size={14} /> Upload Image
            </span>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 hover:border-black transition-colors py-8 cursor-pointer">
              <Upload size={24} className="text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">
                {imagePreview ? 'Change image' : 'Click to upload PNG/JPG'}
              </span>
              <input
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            {imagePreview && (
              <button
                onClick={() => setImagePreview(null)}
                className="mt-2 flex items-center gap-1 text-xs text-red-600 hover:underline"
              >
                <Trash2 size={12} /> Remove image
              </button>
            )}
          </div>

          {/* Summary + actions */}
          <div className="border-t border-gray-100 pt-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Base price</span>
              <span className="font-medium">${product.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Print type</span>
              <span className="font-medium">{printType}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Color</span>
              <span className="font-medium">{color}</span>
            </div>
            <button
              onClick={() => window.print()}
              className="w-full py-4 text-sm font-bold uppercase tracking-wide bg-black text-white hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              <Download size={18} /> Download Mockup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
