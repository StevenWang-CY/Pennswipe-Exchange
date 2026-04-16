import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import { updateProfile } from '../lib/api';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await updateProfile({ displayName });
      updateUser(res.data);
      setMessage('Profile updated!');
    } catch {
      setMessage('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-md mx-auto px-4 py-10"
    >
      <h1 className="text-xl font-bold mb-5">Profile</h1>

      <div className="text-sm space-y-2 mb-6">
        <p><span className="text-gray-500">Username:</span> {user.username}</p>
        <p><span className="text-gray-500">Email:</span> {user.email}</p>
        <p><span className="text-gray-500">Member since:</span> {new Date(user.createdAt).toLocaleDateString()}</p>
        <p><span className="text-gray-500">Dining Dollars:</span> ${user.diningDollarBalance.toFixed(2)}</p>
        <p><span className="text-gray-500">Swipes:</span> {user.swipeBalance}</p>
      </div>

      <form onSubmit={handleSave}>
        <label className="block text-sm text-gray-600 mb-1">Display Name</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-blue-500 mb-3"
          placeholder="Enter a display name"
        />
        {message && (
          <p className={`text-sm mb-3 ${message.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
            {message}
          </p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Update'}
        </button>
      </form>
    </motion.div>
  );
}
