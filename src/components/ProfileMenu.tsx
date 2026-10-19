import { useState, useRef, useEffect } from 'react';
import { User, Package, Heart, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../auth';

export default function ProfileMenu({ onNavigate }: { onNavigate: (path: string) => void }) {
  const { user, profile, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const go = (path: string) => {
    onNavigate(path);
    setOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
    onNavigate('#/');
  };

  const displayName =
    profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'Account';

  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 p-1.5 rounded-full hover:bg-black/5 transition-colors"
        aria-label="Account menu"
      >
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={displayName}
            className="w-7 h-7 rounded-full object-cover border border-gray-200"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold">
            {initial}
          </div>
        )}
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden animate-fadeIn z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wide">Signed in as</p>
            <p className="text-sm font-semibold truncate mt-0.5">{displayName}</p>
            {user?.email && <p className="text-xs text-gray-500 truncate">{user.email}</p>}
          </div>

          {/* Links */}
          <div className="py-1">
            <MenuItem icon={<Package size={16} />} label="My Orders" onClick={() => go('#/account/orders')} />
            <MenuItem icon={<Heart size={16} />} label="Wishlist" onClick={() => go('#/account/wishlist')} />
            <MenuItem icon={<User size={16} />} label="Profile" onClick={() => go('#/account/profile')} />
          </div>

          <div className="border-t border-gray-100 py-1">
            <MenuItem
              icon={<LogOut size={16} />}
              label="Sign Out"
              onClick={handleSignOut}
              danger
            />
          </div>
        </div>
      )}
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors ${
        danger ? 'text-red-600 hover:bg-red-50' : 'text-gray-700'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
