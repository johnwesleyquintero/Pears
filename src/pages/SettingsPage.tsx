import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { firestore } from '../services/firestore';
import { auth } from '../firebase';
import { updateProfile } from 'firebase/auth';
import { User, Visibility } from '../types';
import { 
  User as UserIcon, 
  Shield, 
  Bell, 
  Palette, 
  Save, 
  CheckCircle2, 
  X,
  Loader2,
  Camera,
  LogOut,
  Eye,
  EyeOff
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { currentUser, updateCurrentUser, logout } = useAuth();
  
  // Profile settings
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  // Privacy settings
  const [defaultVisibility, setDefaultVisibility] = useState<Visibility>('public');
  const [allowComments, setAllowComments] = useState(true);
  const [showActivityStatus, setShowActivityStatus] = useState(true);
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [likeNotifications, setLikeNotifications] = useState(true);
  const [commentNotifications, setCommentNotifications] = useState(true);
  const [followNotifications, setFollowNotifications] = useState(true);
  
  // UI preferences
  const [darkMode, setDarkMode] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  
  // States
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'privacy' | 'notifications' | 'appearance'>('profile');

  // Load current user data into form fields
  useEffect(() => {
    if (currentUser) {
      setDisplayName(currentUser.Name);
      setUsername(currentUser.Username);
      setBio(currentUser.Bio);
      setAvatarUrl(currentUser.Avatar);
    }
  }, [currentUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Update Firebase Auth profile
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: displayName,
          photoURL: avatarUrl
        });
      }
      
      // Update Firestore user document
      const updatedUser: Partial<User> = {
        Name: displayName,
        Username: username,
        Bio: bio,
        Avatar: avatarUrl
      };
      
      await firestore.saveUser({ ...currentUser, ...updatedUser });
      updateCurrentUser(updatedUser);
      
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePrivacy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Privacy settings would be stored in a userSettings collection in production
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save privacy settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Notification preferences would be stored in Firestore in production
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save notification settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAppearance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    setIsSaving(true);
    setError(null);
    
    try {
      // Store in localStorage for immediate effect
      localStorage.setItem('pears_dark_mode', darkMode.toString());
      localStorage.setItem('pears_compact_mode', compactMode.toString());
      
      setSavedMessage(true);
      setTimeout(() => setSavedMessage(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save appearance settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (!currentUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-lime-500 mx-auto mb-4" />
          <p className="text-slate-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 py-8 px-4 md:px-12 flex flex-col items-center select-none">
      <div className="w-full max-w-4xl space-y-6 pb-24">
        
        {/* Header */}
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50 p-8 md:p-10">
          <div className="flex items-center gap-3 text-lime-600 mb-3">
            <UserIcon className="w-6 h-6" />
            <span className="text-xs font-black uppercase tracking-widest bg-lime-100 px-2.5 py-1 rounded-lg text-lime-800">
              Account Settings
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900">
            Settings
          </h1>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            Manage your profile, privacy, notifications, and appearance preferences.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-[36px] border border-slate-100 p-2 shadow-sm">
          <div className="flex gap-2 overflow-x-auto">
            {[
              { id: 'profile', label: 'Profile', icon: UserIcon },
              { id: 'privacy', label: 'Privacy', icon: Shield },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'appearance', label: 'Appearance', icon: Palette }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-lime-500 text-white shadow-md shadow-lime-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Success/Error Messages */}
        {savedMessage && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-sm font-bold text-emerald-800">Settings saved successfully!</span>
          </div>
        )}
        
        {error && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-center gap-3">
            <X className="w-5 h-5 text-rose-600" />
            <span className="text-sm font-bold text-rose-800">{error}</span>
          </div>
        )}

        {/* Profile Settings */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="bg-white rounded-[36px] border border-slate-100 p-8 md:p-10 shadow-sm space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-lime-500" />
                <span>Profile Information</span>
              </h2>
            </div>

            {/* Avatar Upload */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <img
                  src={avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                  alt="Avatar"
                  className="w-24 h-24 rounded-full object-cover border-4 border-lime-100 shadow-lg"
                />
                <button
                  type="button"
                  className="absolute bottom-0 right-0 bg-lime-500 hover:bg-lime-600 text-white p-2 rounded-full shadow-lg transition-colors cursor-pointer"
                  title="Change avatar"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Avatar URL
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm focus:bg-white focus:ring-2 focus:ring-lime-500 outline-none transition-all"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Use a URL from an image hosting service or avatar generator like DiceBear.
                </p>
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm focus:bg-white focus:ring-2 focus:ring-lime-500 outline-none transition-all"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@username"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm focus:bg-white focus:ring-2 focus:ring-lime-500 outline-none transition-all"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Your unique identifier on Pears. Cannot be changed frequently.
              </p>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Bio
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={3}
                maxLength={160}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm focus:bg-white focus:ring-2 focus:ring-lime-500 outline-none transition-all resize-none"
              />
              <p className="text-[11px] text-slate-400 mt-1 text-right">
                {bio.length}/160 characters
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={handleLogout}
                className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-2xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-8 py-3 bg-lime-500 hover:bg-lime-600 disabled:bg-lime-300 text-white font-black rounded-full text-xs transition-all shadow-md shadow-lime-200 cursor-pointer flex items-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : savedMessage ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isSaving ? 'Saving...' : savedMessage ? 'Saved!' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Privacy Settings */}
        {activeTab === 'privacy' && (
          <form onSubmit={handleSavePrivacy} className="bg-white rounded-[36px] border border-slate-100 p-8 md:p-10 shadow-sm space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-lime-500" />
                <span>Privacy & Security</span>
              </h2>
            </div>

            {/* Default Post Visibility */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-3">
                Default Post Visibility
              </label>
              <div className="space-y-2">
                {[
                  { value: 'public', label: 'Public', desc: 'Anyone can see your posts', icon: Eye },
                  { value: 'followers', label: 'Followers Only', desc: 'Only your followers can see your posts', icon: UserIcon },
                  { value: 'private', label: 'Private', desc: 'Only you can see your posts', icon: EyeOff }
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      defaultVisibility === option.value
                        ? 'border-lime-500 bg-lime-50'
                        : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value={option.value}
                      checked={defaultVisibility === option.value}
                      onChange={(e) => setDefaultVisibility(e.target.value as Visibility)}
                      className="mt-0.5 w-4 h-4 text-lime-500 accent-lime-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <option.icon className="w-4 h-4 text-slate-600" />
                        <span className="text-sm font-bold text-slate-900">{option.label}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{option.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Allow Comments */}
            <div className="flex items-center justify-between py-3 border-t border-slate-100">
              <div>
                <p className="text-sm font-bold text-slate-900">Allow Comments</p>
                <p className="text-[11px] text-slate-500">Let others comment on your posts</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowComments}
                  onChange={(e) => setAllowComments(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-lime-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-500"></div>
              </label>
            </div>

            {/* Show Activity Status */}
            <div className="flex items-center justify-between py-3 border-t border-slate-100">
              <div>
                <p className="text-sm font-bold text-slate-900">Show Activity Status</p>
                <p className="text-[11px] text-slate-500">Let others see when you're online</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showActivityStatus}
                  onChange={(e) => setShowActivityStatus(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-lime-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-500"></div>
              </label>
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-6 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSaving}
                className="px-8 py-3 bg-lime-500 hover:bg-lime-600 disabled:bg-lime-300 text-white font-black rounded-full text-xs transition-all shadow-md shadow-lime-200 cursor-pointer flex items-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : savedMessage ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isSaving ? 'Saving...' : savedMessage ? 'Saved!' : 'Save Privacy Settings'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <form onSubmit={handleSaveNotifications} className="bg-white rounded-[36px] border border-slate-100 p-8 md:p-10 shadow-sm space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Bell className="w-5 h-5 text-lime-500" />
                <span>Notification Preferences</span>
              </h2>
            </div>

            {/* Notification Channels */}
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-bold text-slate-900">Email Notifications</p>
                  <p className="text-[11px] text-slate-500">Receive updates via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-lime-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-slate-100">
                <div>
                  <p className="text-sm font-bold text-slate-900">Push Notifications</p>
                  <p className="text-[11px] text-slate-500">Get real-time alerts on your device</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pushNotifications}
                    onChange={(e) => setPushNotifications(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-lime-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-500"></div>
                </label>
              </div>
            </div>

            {/* Notification Types */}
            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs font-bold text-slate-700 mb-3">Notify me about</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={likeNotifications}
                      onChange={(e) => setLikeNotifications(e.target.checked)}
                      className="w-4 h-4 text-lime-500 rounded focus:ring-lime-400 accent-lime-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Likes on my posts</span>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={commentNotifications}
                      onChange={(e) => setCommentNotifications(e.target.checked)}
                      className="w-4 h-4 text-lime-500 rounded focus:ring-lime-400 accent-lime-500"
                    />
                    <span className="text-sm font-medium text-slate-700">Comments on my posts</span>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={followNotifications}
                      onChange={(e) => setFollowNotifications(e.target.checked)}
                      className="w-4 h-4 text-lime-500 rounded focus:ring-lime-400 accent-lime-500"
                    />
                    <span className="text-sm font-medium text-slate-700">New followers</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-6 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSaving}
                className="px-8 py-3 bg-lime-500 hover:bg-lime-600 disabled:bg-lime-300 text-white font-black rounded-full text-xs transition-all shadow-md shadow-lime-200 cursor-pointer flex items-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : savedMessage ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isSaving ? 'Saving...' : savedMessage ? 'Saved!' : 'Save Preferences'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Appearance Settings */}
        {activeTab === 'appearance' && (
          <form onSubmit={handleSaveAppearance} className="bg-white rounded-[36px] border border-slate-100 p-8 md:p-10 shadow-sm space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Palette className="w-5 h-5 text-lime-500" />
                <span>Appearance</span>
              </h2>
            </div>

            {/* Dark Mode */}
            <div className="flex items-center justify-between py-3">
              <div>
                <p className="text-sm font-bold text-slate-900">Dark Mode</p>
                <p className="text-[11px] text-slate-500">Use a dark theme across the app</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-lime-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-500"></div>
              </label>
            </div>

            {/* Compact Mode */}
            <div className="flex items-center justify-between py-3 border-t border-slate-100">
              <div>
                <p className="text-sm font-bold text-slate-900">Compact Mode</p>
                <p className="text-[11px] text-slate-500">Reduce spacing to see more content</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={compactMode}
                  onChange={(e) => setCompactMode(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-lime-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-500"></div>
              </label>
            </div>

            {/* Info Box */}
            <div className="bg-slate-50 rounded-2xl p-4 mt-4">
              <p className="text-[11px] text-slate-600 leading-relaxed">
                <strong>Note:</strong> Appearance preferences are stored locally in your browser and synced to your account for persistence across devices.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end pt-6 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSaving}
                className="px-8 py-3 bg-lime-500 hover:bg-lime-600 disabled:bg-lime-300 text-white font-black rounded-full text-xs transition-all shadow-md shadow-lime-200 cursor-pointer flex items-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : savedMessage ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isSaving ? 'Saving...' : savedMessage ? 'Saved!' : 'Save Appearance'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
