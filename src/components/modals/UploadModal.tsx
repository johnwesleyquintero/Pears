import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { MediaType, Visibility } from '../../types';
import { X, Upload, Image, Film, Gift, Sparkles, Check, Link as LinkIcon, Database } from 'lucide-react';

export const UploadModal: React.FC = () => {
  const { isUploadModalOpen, setUploadModalOpen, addPost } = useApp();
  const { currentUser } = useAuth();

  const [mediaType, setMediaType] = useState<MediaType>('image');
  const [mediaUrl, setMediaUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [isUploading, setIsUploading] = useState(false);

  // Quick preset sample media for instant testing
  const PRESET_MEDIA = [
    {
      title: 'Truffle Pasta Video',
      type: 'video' as MediaType,
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
      thumb: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=800',
      caption: 'Delicious creamy Italian pasta made from scratch! #Foodie #ASMRCooking #Recipe'
    },
    {
      title: 'Aesthetic Neon GIF',
      type: 'gif' as MediaType,
      url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExcWcwbjM0eDExODg1ZXAwa3R2MzdleDNhNW13Y3NtbWkxbWNocTlhciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7TKSjRrfIPjeiVyM/giphy.gif',
      thumb: 'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif',
      caption: 'Late night coding vibes with React + Apps Script ⚡️ #CodingLife #GIF #Vibes'
    },
    {
      title: 'Positano Coastal View',
      type: 'image' as MediaType,
      url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1000',
      thumb: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800',
      caption: 'Exploring breathtaking cliffs and emerald waters 🌊 #SpringBreak #TravelPhotography #italy'
    }
  ];

  if (!isUploadModalOpen || !currentUser) return null;

  const handleApplyPreset = (preset: typeof PRESET_MEDIA[0]) => {
    setMediaType(preset.type);
    setMediaUrl(preset.url);
    setThumbnailUrl(preset.thumb);
    setCaption(preset.caption);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaUrl.trim() || !caption.trim()) return;

    setIsUploading(true);
    setTimeout(() => {
      addPost({
        UserID: currentUser.UserID,
        MediaType: mediaType,
        MediaURL: mediaUrl.trim(),
        ThumbnailURL: thumbnailUrl.trim() || mediaUrl.trim(),
        Caption: caption.trim(),
        Visibility: visibility
      });
      setIsUploading(false);
      setUploadModalOpen(false);
      // reset
      setMediaUrl('');
      setThumbnailUrl('');
      setCaption('');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-[36px] max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="h-16 border-b border-slate-100 flex items-center justify-between px-8 bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Pears" className="w-8 h-8 rounded-lg object-cover shadow-xs" />
            <h3 className="font-black text-slate-800 text-lg">Create New Post</h3>
          </div>
          <button
            onClick={() => setUploadModalOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto max-h-[85vh]">
          {/* Architecture Reminder Banner */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
            <Database className="w-5 h-5 text-lime-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600">
              <span className="font-bold text-slate-800">Media Storage Independent:</span> Paste any direct URL from Google Drive, TeraBox, Cloudinary, or Imgur. Only the metadata URL is saved to Sheets.
            </div>
          </div>

          {/* Quick Preset Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              ⚡️ Or test with instant preset URLs
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PRESET_MEDIA.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="p-2 bg-slate-50 hover:bg-lime-50 border border-slate-200 hover:border-lime-400 rounded-xl text-left transition-all cursor-pointer text-xs group"
                >
                  <div className="font-bold text-slate-800 group-hover:text-lime-700 truncate">{preset.title}</div>
                  <div className="text-[10px] text-slate-400 uppercase mt-0.5">{preset.type}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Media Type Tabs */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Media Type
            </label>
            <div className="grid grid-cols-3 gap-3 bg-slate-100 p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => setMediaType('image')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mediaType === 'image' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Image className="w-4 h-4 text-sky-500" />
                <span>Image</span>
              </button>

              <button
                type="button"
                onClick={() => setMediaType('video')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mediaType === 'video' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Film className="w-4 h-4 text-rose-500" />
                <span>Short Video</span>
              </button>

              <button
                type="button"
                onClick={() => setMediaType('gif')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  mediaType === 'gif' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Gift className="w-4 h-4 text-amber-500" />
                <span>GIF</span>
              </button>
            </div>
          </div>

          {/* Media URL Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Media URL *
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                required
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... or Google Drive public link"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 pl-10 pr-4 text-sm focus:bg-white focus:ring-2 focus:ring-lime-500 focus:border-transparent outline-none transition-all font-mono"
              />
            </div>
          </div>

          {/* Thumbnail URL Input (Optional) */}
          {mediaType === 'video' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Thumbnail Poster URL (Optional)
              </label>
              <input
                type="url"
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... cover photo"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm focus:bg-white focus:ring-2 focus:ring-lime-500 outline-none transition-all font-mono"
              />
            </div>
          )}

          {/* Media Preview if URL valid */}
          {mediaUrl && (
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-950 aspect-video flex items-center justify-center relative shadow-inner">
              {mediaType === 'video' ? (
                <video src={mediaUrl} controls className="w-full h-full object-cover max-h-48" />
              ) : (
                <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover max-h-48" />
              )}
              <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold rounded-md">
                Live Storage Preview
              </span>
            </div>
          )}

          {/* Caption Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Caption & Hashtags *
            </label>
            <textarea
              required
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a catchy caption... Tag #SpringBreak #PearsMVP"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm focus:bg-white focus:ring-2 focus:ring-lime-500 outline-none transition-all resize-none"
            />
          </div>

          {/* Visibility Option */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Visibility
            </label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as Visibility)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm focus:bg-white focus:ring-2 focus:ring-lime-500 outline-none transition-all font-bold text-slate-700"
            >
              <option value="public">🌍 Public (Everyone on feed)</option>
              <option value="followers">👥 Followers Only</option>
              <option value="private">🔒 Private (Only me)</option>
            </select>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setUploadModalOpen(false)}
              className="py-3 px-6 rounded-full font-bold text-slate-500 hover:bg-slate-100 transition-colors text-sm cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !mediaUrl.trim() || !caption.trim()}
              className="bg-lime-500 hover:bg-lime-600 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-lime-200 transition-all cursor-pointer active:scale-95 flex items-center gap-2 text-sm"
            >
              {isUploading ? (
                <span>Syncing to Sheets...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Publish Post</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
