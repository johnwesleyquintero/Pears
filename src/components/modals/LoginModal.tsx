import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { firestore } from '../../services/firestore';
import { X, LogIn, Sparkles, UserCheck } from 'lucide-react';
import { User } from '../../types';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, setLoginModalOpen, loginWithGoogle, switchUser, currentUser } = useAuth();
  const [customName, setCustomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [sampleUsers, setSampleUsers] = useState<User[]>([]);

  useEffect(() => {
    if (isLoginModalOpen) {
      const loadUsers = async () => {
        const users = await firestore.getAllUsers();
        setSampleUsers(users.slice(0, 4));
      };
      loadUsers();
    }
  }, [isLoginModalOpen]);

  if (!isLoginModalOpen) return null;

  const handleGoogleAuthClick = async () => {
    setLoading(true);
    await loginWithGoogle(customName.trim() || undefined);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-[40px] max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-br from-lime-500 via-lime-500 to-emerald-600 p-8 text-white relative">
          <button
            onClick={() => setLoginModalOpen(false)}
            className="absolute top-6 right-6 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <img src="/logo.png" alt="Pears Logo" className="w-14 h-14 bg-white rounded-2xl object-cover shadow-lg mb-4 border-2 border-white" />
          <h2 className="text-2xl font-black tracking-tight">Sign in to Pears</h2>
          <p className="text-white/90 text-xs mt-1 leading-relaxed">
            Lightweight social media platform powered by React + Firebase Firestore.
          </p>
        </div>

        <div className="p-8 space-y-6">
          {/* Custom Creator Name option */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Your Creator Name
            </label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="e.g. Alex Rivera"
              className="w-full bg-slate-100 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-lime-500 focus:bg-white transition-all outline-none font-bold text-slate-800"
            />
          </div>

          {/* Google Sign-in simulation button */}
          <button
            onClick={handleGoogleAuthClick}
            disabled={loading}
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl text-sm shadow-xl transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-3"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 bg-white rounded-full p-0.5" />
            <span>{loading ? 'Authenticating...' : 'Sign in with Google'}</span>
          </button>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 absolute">
              Or switch demo creator
            </span>
          </div>

          {/* Quick Creator Switcher */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {sampleUsers.map((usr) => {
              const active = currentUser?.UserID === usr.UserID;
              return (
                <button
                  key={usr.UserID}
                  onClick={() => {
                    switchUser(usr.UserID);
                    setLoginModalOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 p-2.5 rounded-2xl border transition-all text-left cursor-pointer ${
                    active
                      ? 'bg-lime-50 border-lime-500 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-100'
                  }`}
                >
                  <img src={usr.Avatar} alt={usr.Name} className="w-8 h-8 rounded-full object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-black truncate text-slate-800 flex items-center gap-1">
                      <span>{usr.Username}</span>
                      {active && <span className="text-[9px] bg-lime-500 text-white px-1.5 py-0.2 rounded-sm">Active</span>}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{usr.Name}</div>
                  </div>
                  <UserCheck className={`w-4 h-4 ${active ? 'text-lime-600' : 'text-slate-300'}`} />
                </button>
              );
            })}
          </div>

          <p className="text-[10px] text-center text-slate-400">
            Simulates Google OAuth authentication & profile creation.
          </p>
        </div>
      </div>
    </div>
  );
};
