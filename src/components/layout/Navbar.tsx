import React from 'react';
import { Search, Upload, Bell, Settings, User as UserIcon, LogIn, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { searchQuery, setSearchQuery, setUploadModalOpen, notifications } = useApp();
  const { currentUser, setLoginModalOpen, logout } = useAuth();
  const navigate = useNavigate();

  const unreadCount = notifications.length;

  return (
    <nav className="h-16 border-b border-slate-100 flex items-center justify-between px-8 bg-white z-20 shrink-0 shadow-xs">
      {/* Brand */}
      <Link to="/" className="flex items-center gap-2.5 group">
        <img
          src="/logo.png"
          alt="Pears Logo"
          className="w-10 h-10 rounded-xl object-cover group-hover:scale-105 transition-transform shadow-xs"
        />
        <span className="text-2xl font-black tracking-tight text-slate-800">Pears</span>
      </Link>

      {/* Search Bar */}
      <div className="flex-1 max-w-md mx-12">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-sm placeholder-slate-500 focus:ring-2 focus:ring-lime-500 focus:bg-white transition-all outline-none"
            placeholder="Search creators, captions, and hashtags..."
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-full w-4 h-4 flex items-center justify-center"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Actions & Profile */}
      <div className="flex items-center gap-5">
        {/* Architecture Info Button */}
        <Link
          to="/settings"
          title="React + Apps Script Architecture"
          className="p-2 text-slate-600 hover:bg-slate-50 rounded-full transition-colors flex items-center gap-1.5 text-xs font-bold"
        >
          <Sparkles className="w-4 h-4 text-lime-600" />
          <span className="hidden md:inline text-slate-500">Sheets API</span>
        </Link>

        {/* Notifications Icon */}
        <Link
          to="/notifications"
          className="relative p-2 text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5 text-slate-700" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
          )}
        </Link>

        {/* Upload Button */}
        <button
          onClick={() => {
            if (!currentUser) {
              setLoginModalOpen(true);
            } else {
              setUploadModalOpen(true);
            }
          }}
          className="bg-lime-500 hover:bg-lime-600 text-white font-bold py-2 px-6 rounded-full shadow-lg shadow-lime-200 hover:shadow-lime-300 active:scale-95 transition-all flex items-center gap-2 text-sm cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>Upload</span>
        </button>

        {/* User Avatar or Sign In */}
        {currentUser ? (
          <div className="relative group flex items-center gap-2">
            <Link to={`/profile/${currentUser.UserID}`} className="block">
              <img
                src={currentUser.Avatar}
                alt={currentUser.Name}
                className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm object-cover hover:ring-2 hover:ring-lime-500 transition-all"
              />
            </Link>
          </div>
        ) : (
          <button
            onClick={() => setLoginModalOpen(true)}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded-full text-xs transition-all shadow-sm cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5 text-lime-400" />
            <span>Google Sign-In</span>
          </button>
        )}
      </div>
    </nav>
  );
};
