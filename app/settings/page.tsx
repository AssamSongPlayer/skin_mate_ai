'use client';

import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import PageWrapper from '@/components/common/PageWrapper';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useToast } from '@/components/common/Toast';
import {
  User,
  Bell,
  Database,
  Download,
  Trash2,
  Save,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

export default function SettingsPage() {
  const { userProfile, saveUserProfile, settings, updateSettings, clearAllData } =
    useAppContext();
  const { showToast } = useToast();

  const [name, setName] = useState(userProfile?.name || '');
  const [age, setAge] = useState<number | ''>(userProfile?.age || '');
  const [skinType, setSkinType] = useState(userProfile?.skinType || 'unknown');
  const [allergies, setAllergies] = useState(userProfile?.allergies?.join(', ') || '');
  const [budget, setBudget] = useState(userProfile?.budget || 'medium');
  const [currentProducts, setCurrentProducts] = useState(
    userProfile?.currentProducts?.join('\n') || ''
  );

  const [reminderEnabled, setReminderEnabled] = useState(settings.reminderEnabled);
  const [morningTime, setMorningTime] = useState(settings.morningReminderTime);
  const [nightTime, setNightTime] = useState(settings.nightReminderTime);

  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      userId: userProfile?.userId || 'usr_' + Date.now(),
      name: name.trim() || 'Guest',
      age: Number(age) || 25,
      skinType: skinType as any,
      allergies: allergies
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      budget: budget as any,
      currentProducts: currentProducts
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      preferences: userProfile?.preferences || [],
      skinGoals: userProfile?.skinGoals || ['Healthy, clear skin'],
      createdAt: userProfile?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveUserProfile(updated);
    showToast('Profile saved successfully!', 'success');
  };

  const handleSaveReminders = () => {
    updateSettings({
      reminderEnabled,
      morningReminderTime: morningTime,
      nightReminderTime: nightTime,
    });
    showToast('Reminder preferences updated!', 'success');
  };

  const handleExportData = () => {
    const raw = {
      userProfile,
      settings,
      exportedAt: new Date().toISOString(),
      app: 'Skin Mate',
    };
    const blob = new Blob([JSON.stringify(raw, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skin-mate-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    showToast('Data exported successfully!', 'success');
  };

  const handleConfirmClear = () => {
    clearAllData();
    setIsClearModalOpen(false);
    showToast('All local data wiped.', 'info');
  };

  return (
    <PageWrapper title="Settings & Profile">
      <div className="space-y-8 max-w-4xl">
        {/* User Profile Section */}
        <div className="rounded-2xl bg-[#181822] border border-[#2D2D3D] p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#2D2D3D]">
            <div className="w-10 h-10 rounded-xl bg-[#A78BFA]/10 flex items-center justify-center text-[#A78BFA]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F5F3FF]">Skin & Personal Profile</h3>
              <p className="text-xs text-[#A1A1AA]">
                Used by your AI Assistant to personalize product formulation and advice
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#20202C] border border-[#2D2D3D] text-[#F5F3FF] text-sm outline-none focus:border-[#A78BFA]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">Age</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                  placeholder="e.g. 27"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#20202C] border border-[#2D2D3D] text-[#F5F3FF] text-sm outline-none focus:border-[#A78BFA]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                  Known Skin Type
                </label>
                <select
                  value={skinType}
                  onChange={(e) => setSkinType(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#20202C] border border-[#2D2D3D] text-[#F5F3FF] text-sm outline-none focus:border-[#A78BFA]"
                >
                  <option value="oily">Oily</option>
                  <option value="dry">Dry</option>
                  <option value="combination">Combination</option>
                  <option value="sensitive">Sensitive</option>
                  <option value="normal">Normal</option>
                  <option value="unknown">Not sure / Unknown</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                  Budget Level
                </label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value as any)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#20202C] border border-[#2D2D3D] text-[#F5F3FF] text-sm outline-none focus:border-[#A78BFA]"
                >
                  <option value="low">Affordable / Drugstore (Low)</option>
                  <option value="medium">Balanced / Mid-range (Medium)</option>
                  <option value="high">Luxury / Clinical Grade (High)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                Known Allergies or Sensitivities (comma-separated)
              </label>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="e.g. Fragrance, Essential oils, Niacinamide, Salicylic acid"
                className="w-full px-4 py-2.5 rounded-xl bg-[#20202C] border border-[#2D2D3D] text-[#F5F3FF] text-sm outline-none focus:border-[#A78BFA]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                Current Products You Already Own (one per line)
              </label>
              <textarea
                value={currentProducts}
                onChange={(e) => setCurrentProducts(e.target.value)}
                placeholder="e.g. CeraVe Foaming Cleanser&#10;La Roche-Posay SPF 50"
                rows={3}
                className="w-full px-4 py-2.5 rounded-xl bg-[#20202C] border border-[#2D2D3D] text-[#F5F3FF] text-sm outline-none focus:border-[#A78BFA]"
              />
            </div>

            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#A78BFA] to-[#8B5CF6] hover:opacity-90 text-white text-xs font-semibold transition-all shadow-md shadow-purple-950/40"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile</span>
            </button>
          </form>
        </div>

        {/* Reminders & Notifications */}
        <div className="rounded-2xl bg-[#181822] border border-[#2D2D3D] p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#2D2D3D]">
            <div className="w-10 h-10 rounded-xl bg-[#A78BFA]/10 flex items-center justify-center text-[#A78BFA]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F5F3FF]">Routine Reminders</h3>
              <p className="text-xs text-[#A1A1AA]">
                Set scheduled morning and night routine prompt times
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#20202C]">
              <div>
                <span className="text-sm font-semibold text-[#F5F3FF]">Enable Reminders</span>
                <p className="text-xs text-[#A1A1AA]">Receive daily notifications for your skincare</p>
              </div>
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={(e) => setReminderEnabled(e.target.checked)}
                className="w-5 h-5 accent-[#A78BFA] rounded cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                  Morning Routine Time
                </label>
                <input
                  type="time"
                  value={morningTime}
                  onChange={(e) => setMorningTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#20202C] border border-[#2D2D3D] text-[#F5F3FF] text-sm outline-none focus:border-[#A78BFA]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-1.5">
                  Night Routine Time
                </label>
                <input
                  type="time"
                  value={nightTime}
                  onChange={(e) => setNightTime(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#20202C] border border-[#2D2D3D] text-[#F5F3FF] text-sm outline-none focus:border-[#A78BFA]"
                />
              </div>
            </div>

            <button
              onClick={handleSaveReminders}
              className="px-4 py-2 rounded-xl bg-[#20202C] hover:bg-[#2D2D3D] text-[#F5F3FF] text-xs font-medium border border-[#2D2D3D] transition-colors"
            >
              Update Reminders
            </button>
          </div>
        </div>

        {/* Local Storage & Device Privacy Notice */}
        <div className="rounded-2xl bg-[#181822] border border-[#2D2D3D] p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#2D2D3D]">
            <div className="w-10 h-10 rounded-xl bg-[#A78BFA]/10 flex items-center justify-center text-[#A78BFA]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F5F3FF]">Data Storage & Device Privacy</h3>
              <p className="text-xs text-[#A1A1AA]">
                All consultations, routines, products, and schedules remain locally in this browser.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#20202C] border border-[#2D2D3D] text-xs text-[#A1A1AA] leading-relaxed mb-6 space-y-2">
            <p className="text-[#F5F3FF] font-medium flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-[#FBBF24]" />
              Local Storage Notice:
            </p>
            <p>
              Your skincare data is saved securely in your browser&apos;s local storage. It does not synchronize across different devices. Clearing your browser cache or switching devices will wipe your local profile unless exported.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleExportData}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#20202C] hover:bg-[#2D2D3D] text-xs font-semibold text-[#F5F3FF] border border-[#2D2D3D] transition-colors"
            >
              <Download className="w-4 h-4 text-[#A78BFA]" />
              <span>Export All Data (JSON)</span>
            </button>

            <button
              onClick={() => setIsClearModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FB7185]/10 hover:bg-[#FB7185]/20 text-xs font-semibold text-[#FB7185] border border-[#FB7185]/30 transition-colors ml-auto"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Local Data</span>
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isClearModalOpen}
        title="Clear All Local Data?"
        description="This will permanently delete your profile, conversations, products, routines, and calendar tasks from this browser. This action cannot be undone."
        confirmLabel="Wipe All Data"
        isDestructive
        onConfirm={handleConfirmClear}
        onCancel={() => setIsClearModalOpen(false)}
      />
    </PageWrapper>
  );
}
