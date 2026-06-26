import React from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Flame, UserPlus, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RightPanel: React.FC = () => {
  const { trendingTopics, suggestedAccounts, toggleFollow, isFollowing, setSelectedHashtag, selectedHashtag } = useApp();
  const { currentUser, setLoginModalOpen } = useAuth();

  return (
    <aside className="w-80 border-l border-slate-100 p-8 bg-white shrink-0 overflow-y-auto hidden lg:flex flex-col gap-8 h-full select-none">
      {/* Trending Topics Card */}
      <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
        <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
          <span className="text-lime-500">🔥</span> Trending Topics
        </h3>
        <div className="flex flex-wrap gap-2">
          {trendingTopics.map((tag) => {
            const active = selectedHashtag?.toLowerCase() === tag.toLowerCase();
            return (
              <button
                key={tag}
                onClick={() => setSelectedHashtag(active ? null : tag)}
                className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? 'bg-lime-500 border-lime-500 text-white shadow-sm shadow-lime-200'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-lime-500 hover:text-lime-600'
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
        {selectedHashtag && (
          <div className="mt-3 text-right">
            <button
              onClick={() => setSelectedHashtag(null)}
              className="text-[11px] font-bold text-slate-400 hover:text-rose-500 cursor-pointer underline"
            >
              Clear filter ({selectedHashtag})
            </button>
          </div>
        )}
      </div>

      {/* Who to follow */}
      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-black text-slate-800 flex items-center justify-between">
          <span>Who to follow</span>
          <Link to="/settings" className="text-lime-500 text-xs font-bold hover:underline">
            View all
          </Link>
        </h3>
        <div className="space-y-4">
          {suggestedAccounts.slice(0, 4).map((acc) => {
            const followed = isFollowing(acc.UserID);
            return (
              <div key={acc.UserID} className="flex items-center gap-3 group">
                <Link to={`/profile/${acc.UserID}`} className="shrink-0">
                  <img
                    src={acc.Avatar}
                    alt={acc.Username}
                    className="w-10 h-10 rounded-xl bg-purple-500 object-cover ring-2 ring-transparent group-hover:ring-lime-400 transition-all"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/profile/${acc.UserID}`}>
                    <p className="text-xs font-black truncate text-slate-800 group-hover:text-lime-600 transition-colors">
                      {acc.Username}
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{acc.Bio || acc.Name}</p>
                  </Link>
                </div>
                <button
                  onClick={() => {
                    if (!currentUser) {
                      setLoginModalOpen(true);
                    } else {
                      toggleFollow(acc.UserID);
                    }
                  }}
                  className={`px-3 py-1.5 border-2 text-[10px] font-black rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                    followed
                      ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-rose-50 hover:border-rose-300 hover:text-rose-600'
                      : 'border-lime-500 text-lime-500 hover:bg-lime-500 hover:text-white shadow-xs'
                  }`}
                >
                  {followed ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3 h-3" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Google Sign In Banner */}
      {!currentUser && (
        <div className="mt-2 border-t border-slate-100 pt-6">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-[32px] text-white shadow-xl shadow-indigo-200">
            <p className="text-xs font-bold opacity-80 uppercase tracking-tighter mb-1">MVP Feature</p>
            <h4 className="text-lg font-black leading-tight mb-3">Connect your Google account</h4>
            <p className="text-xs opacity-90 leading-relaxed mb-4">
              Sign in with Google OAuth to like posts, comment, and upload your GIFs or videos instantly.
            </p>
            <button
              onClick={() => setLoginModalOpen(true)}
              className="w-full py-3 bg-white hover:bg-slate-50 text-indigo-600 font-black rounded-2xl text-sm shadow-xl transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
              <span>Sign in with Google</span>
            </button>
          </div>
        </div>
      )}

      {/* Storage Architecture info */}
      <div className="bg-slate-900 text-slate-300 p-6 rounded-[32px] text-xs">
        <h4 className="font-bold text-white mb-2 flex items-center gap-1.5 text-lime-400">
          <img src="/logo.png" alt="logo" className="w-4 h-4 rounded object-cover" />
          <span>Modular Storage</span>
        </h4>
        <p className="text-[11px] leading-relaxed text-slate-400">
          Supports URLs from Google Drive, TeraBox, Giphy, Cloudinary, or any CDN. Only raw URLs are persisted in Sheets.
        </p>
      </div>
    </aside>
  );
};
