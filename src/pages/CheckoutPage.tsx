import { useState } from 'react';
import {
  ArrowLeft,
  Check,
  ShieldCheck,
  Lock,
  ChevronRight,
  Wallet,
  Landmark,
  Smartphone,
  Building2,
  CreditCard,
  QrCode,
  Loader2,
} from 'lucide-react';
import { useCart } from '../cart';

type PaymentMethod =
  | 'gopay'
  | 'ovo'
  | 'dana'
  | 'shopeepay'
  | 'qris'
  | 'bca'
  | 'mandiri'
  | 'bni'
  | 'bri'
  | 'permata'
  | 'alfamart'
  | 'indomaret';

type PaymentGroup = 'ewallet' | 'qris' | 'va' | 'retail';

const PAYMENT_METHODS: {
  group: PaymentGroup;
  groupLabel: string;
  methods: { id: PaymentMethod; label: string; desc: string; icon: typeof Wallet }[];
}[] = [
  {
    group: 'ewallet',
    groupLabel: 'E-Wallet',
    methods: [
      { id: 'gopay', label: 'GoPay', desc: 'Bayar dengan GoPay', icon: Wallet },
      { id: 'ovo', label: 'OVO', desc: 'Bayar dengan OVO', icon: Wallet },
      { id: 'dana', label: 'DANA', desc: 'Bayar dengan DANA', icon: Wallet },
      { id: 'shopeepay', label: 'ShopeePay', desc: 'Bayar dengan ShopeePay', icon: Wallet },
    ],
  },
  {
    group: 'qris',
    groupLabel: 'QRIS',
    methods: [
      { id: 'qris', label: 'QRIS', desc: 'Scan & bayar dengan QRIS', icon: QrCode },
    ],
  },
  {
    group: 'va',
    groupLabel: 'Virtual Account Bank',
    methods: [
      { id: 'bca', label: 'BCA Virtual Account', desc: 'Transfer via BCA VA', icon: Landmark },
      { id: 'mandiri', label: 'Mandiri Virtual Account', desc: 'Transfer via Mandiri VA', icon: Landmark },
      { id: 'bni', label: 'BNI Virtual Account', desc: 'Transfer via BNI VA', icon: Landmark },
      { id: 'bri', label: 'BRI Virtual Account', desc: 'Transfer via BRI VA', icon: Landmark },
      { id: 'permata', label: 'Permata Virtual Account', desc: 'Transfer via Permata VA', icon: Landmark },
    ],
  },
  {
    group: 'retail',
    groupLabel: 'Retail Outlet',
    methods: [
      { id: 'alfamart', label: 'Alfamart', desc: 'Bayar di Alfamart', icon: Building2 },
      { id: 'indomaret', label: 'Indomaret', desc: 'Bayar di Indomaret', icon: Building2 },
    ],
  },
];

const PROVINCES = [
  'DKI Jakarta', 'Jawa Barat', 'Jawa Tengah', 'Jawa Timur', 'Banten', 'DI Yogyakarta',
  'Bali', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Sumatera Selatan', 'Lampung',
  'Kalimantan Timur', 'Kalimantan Barat', 'Sulawesi Selatan', 'Papua',
];

export default function CheckoutPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { items, subtotal, itemCount } = useCart();

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [notes, setNotes] = useState('');
  const [shippingMethod, setShippingMethod] = useState<'regular' | 'express' | 'instant'>('regular');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const shippingCost = shippingMethod === 'instant' ? 25000 : shippingMethod === 'express' ? 18000 : 9000;
  const total = subtotal + shippingCost;

  const canPlaceOrder =
    email.includes('@') &&
    fullName.trim().length > 2 &&
    phone.trim().length >= 8 &&
    address.trim().length > 5 &&
    city.trim().length > 1 &&
    province.length > 0 &&
    postalCode.trim().length >= 4 &&
    selectedPayment !== null &&
    items.length > 0;

  const handlePlaceOrder = async () => {
    if (!canPlaceOrder) return;
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 2000));
    setProcessing(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#f4f4f4] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg p-8 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <Check size={32} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-black tracking-tight mb-2">Order Placed!</h1>
          <p className="text-sm text-gray-500 mb-6">
            Terima kasih! Pesanan Anda telah diterima. Instruksi pembayaran telah dikirim ke <span className="font-medium text-gray-700">{email}</span>.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Order ID</span>
              <span className="font-mono font-medium">ORD-{Date.now().toString().slice(-8)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total</span>
              <span className="font-bold">Rp {total.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment</span>
              <span className="font-medium capitalize">
                {PAYMENT_METHODS.flatMap((g) => g.methods).find((m) => m.id === selectedPayment)?.label}
              </span>
            </div>
          </div>
          <button
            onClick={() => onNavigate('#/')}
            className="w-full bg-black text-white py-3.5 rounded text-sm font-bold uppercase tracking-wide hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !processing) {
    return (
      <div className="min-h-screen bg-[#f4f4f4] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-sm text-gray-500 mb-6">Add some items before checking out.</p>
          <button
            onClick={() => onNavigate('#/collections')}
            className="w-full bg-black text-white py-3.5 rounded text-sm font-bold uppercase tracking-wide hover:bg-gray-800 transition-colors"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f4] py-6 px-4 sm:py-8">
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        <button
          onClick={() => onNavigate('#/collections')}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-black mb-5"
        >
          <ArrowLeft size={14} /> Continue Shopping
        </button>

        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-1">Checkout</h1>
        <p className="text-sm text-gray-500 mb-6">Complete your purchase — Indonesian payment methods available.</p>

        <div className="grid lg:grid-cols-[1fr_380px] gap-6 items-start">
          {/* ── Left: forms ── */}
          <div className="space-y-4">
            {/* Contact */}
            <FormCard step={1} title="Contact Information">
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Email" required>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className={inputCls}
                  />
                </Field>
                <Field label="Phone (WhatsApp)" required>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0812xxxxxxx"
                    className={inputCls}
                  />
                </Field>
              </div>
            </FormCard>

            {/* Delivery */}
            <FormCard step={2} title="Delivery Address">
              <div className="space-y-3">
                <Field label="Full Name" required>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nama lengkap"
                    className={inputCls}
                  />
                </Field>
                <Field label="Street Address" required>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Jl. Contoh No. 123, RT/RW, Kelurahan"
                    rows={2}
                    className={inputCls}
                  />
                </Field>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label="City" required>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Kota"
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Province" required>
                    <select
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className={inputCls}
                    >
                      <option value="">Pilih provinsi</option>
                      {PROVINCES.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </Field>
                </div>
                <Field label="Postal Code" required>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="12345"
                    maxLength={6}
                    className={inputCls}
                  />
                </Field>
                <Field label="Delivery Notes (optional)">
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Patokan / catatan kurir"
                    className={inputCls}
                  />
                </Field>
              </div>
            </FormCard>

            {/* Shipping method */}
            <FormCard step={3} title="Shipping Method">
              <div className="space-y-2">
                {([
                  { id: 'regular', label: 'Reguler (JNE/Pos)', desc: '3-5 hari kerja', cost: 9000 },
                  { id: 'express', label: 'Express (JNE YES/GoSend)', desc: '1-2 hari kerja', cost: 18000 },
                  { id: 'instant', label: 'Instant (GoSend/GrabExpress)', desc: 'Same day', cost: 25000 },
                ] as const).map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setShippingMethod(opt.id)}
                    className={`w-full flex items-center justify-between p-3.5 border rounded-lg transition-all text-left ${
                      shippingMethod === opt.id ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        shippingMethod === opt.id ? 'border-violet-600 bg-violet-600' : 'border-gray-300'
                      }`}>
                        {shippingMethod === opt.id && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{opt.label}</p>
                        <p className="text-xs text-gray-500">{opt.desc}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold">Rp {opt.cost.toLocaleString('id-ID')}</span>
                  </button>
                ))}
              </div>
            </FormCard>

            {/* Payment method */}
            <FormCard step={4} title="Payment Method">
              <p className="text-xs text-gray-500 mb-3 flex items-center gap-1.5">
                <Lock size={12} /> Pembayaran diproses melalui mitra tepercaya (Xendit / Midtrans)
              </p>
              <div className="space-y-4">
                {PAYMENT_METHODS.map((group) => (
                  <div key={group.group}>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400 mb-2">{group.groupLabel}</p>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {group.methods.map((m) => {
                        const Icon = m.icon;
                        const active = selectedPayment === m.id;
                        return (
                          <button
                            key={m.id}
                            onClick={() => setSelectedPayment(m.id)}
                            className={`flex items-center gap-3 p-3 border rounded-lg transition-all text-left ${
                              active ? 'border-violet-500 bg-violet-50' : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              active ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-500'
                            }`}>
                              <Icon size={18} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold truncate">{m.label}</p>
                              <p className="text-[11px] text-gray-500 truncate">{m.desc}</p>
                            </div>
                            {active && <Check size={16} className="text-violet-600 flex-shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </FormCard>
          </div>

          {/* ── Right: order summary ── */}
          <div className="lg:sticky lg:top-6">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-bold uppercase tracking-wide">Order Summary</h2>
                <p className="text-xs text-gray-500 mt-0.5">{itemCount} item{itemCount !== 1 ? 's' : ''}</p>
              </div>

              {/* Items */}
              <div className="max-h-64 overflow-y-auto px-5 py-4 space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-14 h-16 bg-gray-50 flex-shrink-0 overflow-hidden rounded">
                      {item.product && (
                        <img
                          src={item.product.image_url}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate">{item.product?.name ?? 'Unknown'}</p>
                      <p className="text-[11px] text-gray-500">
                        {item.size}
                        {item.color ? ` · ${item.color}` : ''}
                        {item.print_type ? ` · ${item.print_type}` : ''}
                      </p>
                      <p className="text-xs font-bold mt-1">
                        Rp {((item.product?.price ?? 0) * item.quantity).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="px-5 py-4 border-t border-gray-100 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">Rp {subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <span className="font-medium">Rp {shippingCost.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-100">
                  <span className="text-base font-bold">Total</span>
                  <span className="text-base font-bold">Rp {total.toLocaleString('id-ID')}</span>
                </div>
              </div>

              {/* Place order */}
              <div className="px-5 py-4 border-t border-gray-100">
                <button
                  onClick={handlePlaceOrder}
                  disabled={!canPlaceOrder || processing}
                  className={`w-full py-3.5 rounded text-sm font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all ${
                    canPlaceOrder && !processing
                      ? 'bg-black text-white hover:bg-gray-800'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {processing ? (
                    <><Loader2 size={18} className="animate-spin" /> Processing...</>
                  ) : (
                    <>Place Order <ChevronRight size={18} /></>
                  )}
                </button>
                {!canPlaceOrder && !processing && (
                  <p className="text-[11px] text-gray-400 text-center mt-2">
                    {!selectedPayment ? 'Select a payment method' : 'Complete all required fields'}
                  </p>
                )}
                <div className="flex items-center justify-center gap-1.5 mt-3 text-[11px] text-gray-400">
                  <ShieldCheck size={13} /> Secure & encrypted checkout
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── helpers ─── */

const inputCls =
  'w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg outline-none transition-colors focus:border-violet-500 focus:ring-1 focus:ring-violet-500 placeholder:text-gray-300';

function FormCard({ step, title, children }: { step: number; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
        <span className="w-7 h-7 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center">
          {step}
        </span>
        <h2 className="text-sm font-bold uppercase tracking-wide">{title}</h2>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-gray-600 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </span>
      {children}
    </label>
  );
}
