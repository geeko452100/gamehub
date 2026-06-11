import { useRef, useState } from 'react';
import { Camera, Save, User } from 'lucide-react';
import { useAuth } from '@/lib/supabase/useAuth';
import { updateScreenName, uploadAvatar } from '@/lib/supabase/profilePersistence';

const SCREEN_NAME_PATTERN = /^[a-zA-Z0-9_-]{3,20}$/;

export default function ProfileHub() {
  const { user, profile, refreshProfile } = useAuth();
  const fileInputRef = useRef(null);
  const [screenName, setScreenName] = useState(profile?.screen_name ?? '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSaveName = async () => {
    setError('');
    setMessage('');

    const trimmed = screenName.trim();
    if (!SCREEN_NAME_PATTERN.test(trimmed)) {
      setError('Screen name must be 3–20 characters (letters, numbers, _ or -).');
      return;
    }

    setSaving(true);
    const result = await updateScreenName(user.id, trimmed);
    setSaving(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    await refreshProfile(user.id);
    setMessage('Screen name updated.');
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setMessage('');
    setUploading(true);

    const result = await uploadAvatar(user.id, file);
    setUploading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    await refreshProfile(user.id);
    setMessage('Avatar updated.');
  };

  return (
    <div className="space-y-8 max-w-xl">
      <header className="border-b border-slate-800 pb-6">
        <h1 className="text-3xl font-black text-white">Profile Settings</h1>
        <p className="mt-2 text-slate-400 text-sm">
          Manage your display name and avatar stored in Supabase.
        </p>
      </header>

      {error && (
        <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {message && (
        <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
          {message}
        </p>
      )}

      <section className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Avatar</h2>
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-slate-500" />
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-indigo-600 border border-slate-700 hover:border-indigo-500 text-sm font-semibold text-slate-300 hover:text-white py-2 px-4 rounded-lg transition-all disabled:opacity-50"
          >
            <Camera className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Change Avatar'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
      </section>

      <section className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Account</h2>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Email</label>
          <p className="text-white text-sm">{profile?.email ?? user?.email}</p>
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">Screen Name</label>
          <input
            type="text"
            value={screenName}
            onChange={(e) => setScreenName(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg py-2.5 px-3 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <button
          type="button"
          onClick={handleSaveName}
          disabled={saving}
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold py-2.5 px-4 rounded-lg transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Screen Name'}
        </button>
      </section>
    </div>
  );
}
