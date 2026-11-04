import { useEffect, useState } from 'react';
import { Loader2, Store, X } from 'lucide-react';
import { useAuth } from '../auth';
import type { Creator, DesignData, Product } from '../supabase';
import { createCreatorProduct, getBaseCost, getCreatorByUserId, type CreatorProductInput } from '../creator';
import CreatorProductForm from './CreatorProductForm';

type Props = {
  product: Product;
  designData: DesignData;
  onClose: () => void;
  onNavigate: (hash: string) => void;
};

export default function CreatorPublishPanel({ product, designData, onClose, onNavigate }: Props) {
  const { user } = useAuth();
  const [creator, setCreator] = useState<Creator | null | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseCost = getBaseCost(product.slug);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    getCreatorByUserId(user.id).then((result) => {
      if (!cancelled) setCreator(result);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleSubmit = async (input: CreatorProductInput) => {
    if (!creator || baseCost === null) return;
    setSubmitting(true);
    setError(null);
    const result = await createCreatorProduct({
      creator,
      blank: product,
      baseCost,
      design: designData,
      input,
    });
    setSubmitting(false);
    if (result.error) {
      setError(`We couldn't save your product. ${result.error}`);
      return;
    }
    onNavigate('#/creator/dashboard');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-slide-in-right">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center">
              <Store size={16} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Add to your store</h2>
              <p className="text-xs text-gray-500">{product.name} blank</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {creator === undefined && (
            <div className="flex justify-center py-16">
              <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
          )}

          {creator === null && (
            <div className="text-center py-16 space-y-4">
              <p className="text-sm text-gray-600">You need a store before you can publish products.</p>
              <button
                onClick={() => onNavigate('#/creator/register')}
                className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-black text-white hover:bg-gray-800 transition-colors"
              >
                Set up my store
              </button>
            </div>
          )}

          {creator && baseCost === null && (
            <p className="text-sm text-red-700">This blank garment can't be sold on a store yet.</p>
          )}

          {creator && baseCost !== null && (
            <CreatorProductForm
              initial={{ name: '', description: '', price: 0, isPublished: true }}
              baseCost={baseCost}
              requireRights
              submitLabel="Save product"
              submitting={submitting}
              error={error}
              onSubmit={handleSubmit}
              onCancel={onClose}
            />
          )}
        </div>
      </div>
    </div>
  );
}
