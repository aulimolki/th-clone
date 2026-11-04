import { useState } from 'react';
import { AlertCircle, Check, Loader2 } from 'lucide-react';
import { calculateEarnings, getMinimumRetailPrice, type CreatorProductInput } from '../creator';
import { formatIdr } from '../currency';

type Props = {
  initial: CreatorProductInput;
  baseCost: number;
  requireRights: boolean;
  submitLabel: string;
  submitting: boolean;
  error: string | null;
  onSubmit: (value: CreatorProductInput) => void;
  onCancel: () => void;
};

const inputClass =
  'w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors';

export default function CreatorProductForm({
  initial,
  baseCost,
  requireRights,
  submitLabel,
  submitting,
  error,
  onSubmit,
  onCancel,
}: Props) {
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description);
  const [priceInput, setPriceInput] = useState(initial.price > 0 ? String(initial.price) : '');
  const [isPublished, setIsPublished] = useState(initial.isPublished);
  const [rightsChecked, setRightsChecked] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const minPrice = getMinimumRetailPrice(baseCost);
  const price = Math.round(Number(priceInput)) || 0;
  const breakdown = calculateEarnings(price, baseCost);
  const priceOk = price >= minPrice;

  const handleSubmit = () => {
    if (name.trim().length < 2) {
      setValidationError('Give your product a name with at least 2 characters.');
      return;
    }
    if (!priceOk) {
      setValidationError(`The lowest price you can set is ${formatIdr(minPrice)}.`);
      return;
    }
    if (requireRights && !rightsChecked) {
      setValidationError('Please confirm you own the rights to this design.');
      return;
    }
    setValidationError(null);
    onSubmit({ name: name.trim(), description: description.trim(), price, isPublished });
  };

  const shownError = validationError ?? error;

  return (
    <div className="space-y-6">
      {shownError && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{shownError}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1.5">Product name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Sunset Drive Tee"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1.5">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Tell customers about this design"
          className={`${inputClass} resize-none`}
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1.5">Retail price (IDR)</label>
        <input
          type="number"
          inputMode="numeric"
          min={minPrice}
          step={1000}
          value={priceInput}
          onChange={(e) => setPriceInput(e.target.value)}
          placeholder={String(minPrice)}
          className={inputClass}
        />
        <p className="text-[11px] text-gray-500 mt-1.5">Minimum price: {formatIdr(minPrice)}</p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-2.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">Earnings estimate</p>
        {price > 0 && priceOk ? (
          <>
            <p className="text-sm text-gray-800">
              If you sell this product for <strong>{formatIdr(price)}</strong>, your estimated earnings are{' '}
              <strong className="text-green-700">{formatIdr(breakdown.creatorEarnings)}</strong>.
            </p>
            <dl className="text-xs text-gray-600 space-y-1.5 pt-2 border-t border-gray-200">
              <Row label="Retail price" value={formatIdr(breakdown.retailPrice)} />
              <Row label="CCC production cost" value={`-${formatIdr(breakdown.baseCost)}`} />
              <Row label="Packaging" value={`-${formatIdr(breakdown.packagingCost)}`} />
              <Row label="Payment processing" value={`-${formatIdr(breakdown.paymentFee)}`} />
              <Row label="Platform fee" value={`-${formatIdr(breakdown.platformFee)}`} />
            </dl>
          </>
        ) : (
          <p className="text-sm text-gray-500">Enter a price to see your estimated earnings.</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-gray-600 mb-1.5">Visibility</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { value: true, label: 'Publish now', hint: 'Visible on your store' },
            { value: false, label: 'Save as draft', hint: 'Only you can see it' },
          ].map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => setIsPublished(opt.value)}
              className={`text-left p-3 rounded-lg border transition-all ${
                isPublished === opt.value ? 'border-black bg-black text-white' : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <div className="text-sm font-semibold">{opt.label}</div>
              <div className={`text-[11px] mt-0.5 ${isPublished === opt.value ? 'text-gray-300' : 'text-gray-500'}`}>
                {opt.hint}
              </div>
            </button>
          ))}
        </div>
      </div>

      {requireRights && (
        <button type="button" onClick={() => setRightsChecked(!rightsChecked)} className="flex items-start gap-3 text-left w-full">
          <div
            className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
              rightsChecked ? 'bg-black border-black' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            {rightsChecked && <Check size={13} className="text-white" />}
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-900">I own the rights to this design</span>
            <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
              I confirm I have permission to use all uploaded images, text, and graphics, and that they do not infringe
              on any third-party copyrights or trademarks.
            </p>
          </div>
        </button>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-black text-white hover:bg-gray-800 disabled:opacity-60 transition-colors flex items-center gap-2"
        >
          {submitting && <Loader2 size={16} className="animate-spin" />}
          {submitLabel}
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt>{label}</dt>
      <dd className="font-medium text-gray-800">{value}</dd>
    </div>
  );
}
