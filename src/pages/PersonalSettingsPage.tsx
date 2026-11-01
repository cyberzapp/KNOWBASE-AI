import React, { useState } from 'react';
import { User, Mail, Lock, ShieldCheck, Sun, Moon, Save } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';

export const PersonalSettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuthStore();
  const toast = useToast();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(user?.photoURL || '');
  const [theme, setTheme] = useState<'light' | 'dark'>(user?.themePreference === 'dark' ? 'dark' : 'light');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    setIsSaving(true);
    try {
      await updateProfile({
        displayName: displayName.trim(),
        photoURL: photoURL.trim() || undefined,
        themePreference: theme,
      });

      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      toast.success('Profile Updated', 'Personal settings saved successfully.');
    } catch {
      toast.error('Error', 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6 text-left">
      <div>
        <h1 className="text-2xl font-extrabold text-[#171923] dark:text-white tracking-tight">
          Personal Profile & Preferences
        </h1>
        <p className="text-sm text-[#777D8A] dark:text-[#9BA1B0] mt-1">
          Manage your account profile, avatar, and interface appearance.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-[#161A23] border border-[#E9EAF0] dark:border-[#232838] shadow-xs space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-[#E9EAF0] dark:border-[#232838]">
            <img
              src={photoURL || user?.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}&backgroundColor=6857e8`}
              alt="Avatar"
              className="w-16 h-16 rounded-full object-cover border border-[#E9EAF0] dark:border-[#232838]"
            />
            <div>
              <p className="text-sm font-bold text-[#171923] dark:text-white">{displayName || 'Member'}</p>
              <p className="text-xs text-[#777D8A]">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="Full Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
              required
            />

            <Input
              label="Account Email"
              value={user?.email || ''}
              disabled
              leftIcon={<Mail className="w-4 h-4" />}
              helperText="Email is bound to your Firebase authentication profile."
            />

            <Input
              label="Photo URL"
              placeholder="https://images.unsplash.com/..."
              value={photoURL}
              onChange={(e) => setPhotoURL(e.target.value)}
              helperText="Direct image URL for your workspace profile avatar."
            />

            <div className="space-y-1.5 text-left pt-2">
              <label className="block text-xs font-semibold text-[#171923] dark:text-[#E2E8F0]">
                Theme Appearance
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex-1 p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                    theme === 'light'
                      ? 'border-[#6857E8] bg-[#F0EDFF] text-[#6857E8] dark:bg-[#201C3E]'
                      : 'border-[#E9EAF0] dark:border-[#232838] text-[#777D8A]'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  <span>Light Mode (Default)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex-1 p-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all ${
                    theme === 'dark'
                      ? 'border-[#6857E8] bg-[#F0EDFF] text-[#6857E8] dark:bg-[#201C3E]'
                      : 'border-[#E9EAF0] dark:border-[#232838] text-[#777D8A]'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  <span>Dark Mode</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" isLoading={isSaving} leftIcon={<Save className="w-4 h-4" />}>
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};

