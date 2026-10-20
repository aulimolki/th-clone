import { useState } from 'react';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../auth';

export default function ProfilePage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { user, profile, updateProfile, signOut } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f6f6f4] flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold mb-2">Sign in to view your profile</h1>
          <p className="text-sm text-gray-500 mb-6">Create an account to manage your details.</p>
          <button
            onClick={() => onNavigate('#/')}
            className="text-sm font-semibold text-violet-700 hover:underline"
          >
            Back to home
          </button>
        </div>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    const { error } = await updateProfile({
      full_name: fullName.trim() || undefined,
      avatar_url: avatarUrl.trim() || undefined,
    });
    setSaving(false);
    if (error) setError(error);
    else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onNavigate('#/');
  };

  const inputCls =
    'w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg outline-none transition-colors focus:border-violet-500 focus:ring-1 focus:ring-violet-500 placeholder:text-gray-300';

  const displayName =
    profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'Account';

  return (
    <div className="min-h-screen bg-[#f6f6f4] py-10 px-4">
      <div className="max-w-xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-1">Profile</h1>
        <p className="text-sm text-gray-500 mb-8">Manage your account details.</p>

        {/* Account card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          <div className="flex items-center gap-4">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={displayName}
                className="w-14 h-14 rounded-full object-cover border border-gray-200"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gray-900 text-white flex items-center justify-center text-lg font-bold">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-bold truncate">{displayName}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Edit form */}
        <form onSubmit={handleSave} className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wide">Edit details</h2>

          <label className="block">
            <span className="block text-xs font-medium text-gray-600 mb-1.5">Full name</span>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              className={inputCls}
            />
          </label>

          <label className="block">
            <span className="block text-xs font-medium text-gray-600 mb-1.5">Avatar URL</span>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className={inputCls}
            />
          </label>

          <label className="block">
            <span className="block text-xs font-medium text-gray-600 mb-1.5">Email</span>
            <input
              type="email"
              value={user.email ?? ''}
              disabled
              className={`${inputCls} opacity-60 cursor-not-allowed`}
            />
          </label>

          {error && (
            <div className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              <AlertCircle size={14} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-lg text-sm font-bold uppercase tracking-wide bg-black text-white hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : saved ? (
              <>
                <Check size={16} /> Saved
              </>
            ) : (
              'Save changes'
            )}
          </button>
        </form>

        <button
          onClick={handleSignOut}
          className="w-full mt-4 py-3 rounded-lg text-sm font-bold uppercase tracking-wide border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
