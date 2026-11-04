import { useState, useEffect } from 'react';
import { Store, ArrowLeft, Check, Loader2, AlertCircle, Instagram, Youtube, Twitter } from 'lucide-react';
import { useAuth } from '../auth';
import { supabase } from '../supabase';
import { slugify, isSlugAvailable } from '../creator';

export default function CreatorRegisterPage({
  onNavigate,
}: {
  onNavigate: (path: string) => void;
}) {
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [storeName, setStoreName] = useState('');
  const [storeSlug, setStoreSlug] = useState('');
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [slugChecking, setSlugChecking] = useState(false);
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [instagram, setInstagram] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [website, setWebsite] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Auto-generate slug from store name
  useEffect(() => {
    if (step === 1) {
      setStoreSlug(slugify(storeName));
    }
  }, [storeName, step]);

  // Check slug availability
  useEffect(() => {
    if (!storeSlug) {
      setSlugAvailable(null);
      return;
    }
    let cancelled = false;
    setSlugChecking(true);
    isSlugAvailable(storeSlug).then((available) => {
      if (!cancelled) {
        setSlugAvailable(available);
        setSlugChecking(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [storeSlug]);

  if (authLoading) {
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
          <Store size={48} className="mx-auto text-gray-300 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in to become a creator</h1>
          <p className="text-gray-500 mb-6">You need an account to open your store on CCC.</p>
          <button
            onClick={() => onNavigate('#/')}
            className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!acceptedTerms) {
      setError('Please accept the creator terms to continue.');
      return;
    }
    if (!storeName.trim() || !storeSlug.trim()) {
      setError('Store name and URL are required.');
      return;
    }
    setSubmitting(true);
    setError(null);

    const socialLinks: Record<string, string> = {};
    if (instagram) socialLinks.instagram = instagram;
    if (tiktok) socialLinks.tiktok = tiktok;
    if (website) socialLinks.website = website;

    const { data, error: insertError } = await supabase
      .from('creators')
      .insert({
        name: storeName.trim(),
        slug: storeSlug.trim(),
        bio: description.trim() || null,
        avatar_url: logoUrl || null,
        cover_url: bannerUrl || null,
        social_links: socialLinks,
        user_id: user.id,
        status: 'active',
        member_since: new Date().toISOString(),
      })
      .select('*')
      .maybeSingle();

    setSubmitting(false);

    if (insertError || !data) {
      setError(insertError?.message ?? 'Failed to create store. Please try again.');
      return;
    }

    onNavigate(`#/creator/dashboard`);
  };

  const canProceed1 = storeName.trim().length >= 2 && slugAvailable === true;
  const canProceed2 = true; // description and images are optional at this stage
  const canSubmit = canProceed1 && acceptedTerms;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-5 flex items-center gap-4">
          <button
            onClick={() => onNavigate('#/account/profile')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
              <Store size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Open Your Store</h1>
              <p className="text-xs text-gray-500">Become a CCC Creator</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress steps */}
      <div className="max-w-3xl mx-auto px-4 pt-8">
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  step >= s ? 'bg-black text-white' : 'bg-gray-200 text-gray-400'
                }`}
              >
                {step > s ? <Check size={16} /> : s}
              </div>
              {s < 3 && (
                <div className={`h-0.5 flex-1 transition-colors ${step > s ? 'bg-black' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-16">
        {error && (
          <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Step 1: Store identity */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Store Identity</h2>
              <p className="text-sm text-gray-500">Choose your store name and URL.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Store Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. Mata Buaya Clothing"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Store URL</label>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-colors">
                <span className="px-3 py-3 text-sm text-gray-400 bg-gray-50 border-r border-gray-200 whitespace-nowrap">
                  ccc.id/store/
                </span>
                <input
                  type="text"
                  value={storeSlug}
                  onChange={(e) => setStoreSlug(slugify(e.target.value))}
                  placeholder="your-store"
                  className="flex-1 px-3 py-3 outline-none"
                />
                {slugChecking && <Loader2 size={16} className="animate-spin text-gray-400 mr-3" />}
                {!slugChecking && slugAvailable === true && storeSlug && (
                  <Check size={16} className="text-green-500 mr-3" />
                )}
                {!slugChecking && slugAvailable === false && storeSlug && (
                  <AlertCircle size={16} className="text-red-400 mr-3" />
                )}
              </div>
              {slugAvailable === false && storeSlug && (
                <p className="text-xs text-red-500 mt-1.5">This URL is already taken. Try another.</p>
              )}
              {slugAvailable === true && storeSlug && (
                <p className="text-xs text-green-600 mt-1.5">This URL is available.</p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!canProceed1}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  canProceed1 ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Branding */}
        {step === 2 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Store Branding</h2>
              <p className="text-sm text-gray-500">Add your logo, banner, and description.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Logo URL</label>
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
              />
              {logoUrl && (
                <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                  <img src={logoUrl} alt="Logo preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Banner URL</label>
              <input
                type="text"
                value={bannerUrl}
                onChange={(e) => setBannerUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
              />
              {bannerUrl && (
                <div className="mt-2 w-full h-32 rounded-lg overflow-hidden border border-gray-200">
                  <img src={bannerUrl} alt="Banner preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Store Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell customers about your brand..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors resize-none"
              />
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!canProceed2}
                className="px-6 py-3 rounded-lg font-medium bg-black text-white hover:bg-gray-800 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Social + Terms */}
        {step === 3 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Social Links & Terms</h2>
              <p className="text-sm text-gray-500">Connect your socials and accept the creator terms.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                  <Instagram size={14} /> Instagram
                </label>
                <input
                  type="text"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@yourbrand"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                  <Youtube size={14} /> TikTok
                </label>
                <input
                  type="text"
                  value={tiktok}
                  onChange={(e) => setTiktok(e.target.value)}
                  placeholder="@yourbrand"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                  <Twitter size={14} /> Website
                </label>
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://yourbrand.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                />
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <button
                type="button"
                onClick={() => setAcceptedTerms(!acceptedTerms)}
                className="flex items-start gap-3 text-left w-full"
              >
                <div
                  className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    acceptedTerms ? 'bg-black border-black' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {acceptedTerms && <Check size={13} className="text-white" />}
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-900">I accept the CCC Creator Terms</span>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    I agree to the CCC Creator Agreement, including platform fees, production policies,
                    content guidelines, and payout terms. I understand that CCC handles production,
                    fulfillment, and payment processing on my behalf.
                  </p>
                </div>
              </button>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                  canSubmit && !submitting
                    ? 'bg-black text-white hover:bg-gray-800'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Store size={16} />}
                {submitting ? 'Creating...' : 'Open My Store'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
