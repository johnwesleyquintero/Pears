import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { firestore } from '../services/firestore';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Heart, MessageCircle, Calendar, Users, UserPlus, Check, Sparkles, Grid, Bookmark as BookmarkIcon, Edit3 } from 'lucide-react';
import { PostCard } from '../components/feed/PostCard';
import { User, Post } from '../types';

export const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { currentUser, updateCurrentUser, setLoginModalOpen } = useAuth();
  const { toggleFollow, isFollowing } = useApp();
  
  const [activeTab, setActiveTab] = useState<'posts' | 'likes'>('posts');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Subscribe to target user
  useEffect(() => {
    if (!userId) {
      setTargetUser(currentUser);
      setLoading(false);
      return;
    }
    
    const unsubscribe = firestore.subscribeToUser(userId, (user) => {
      setTargetUser(user);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [userId, currentUser]);

  // Subscribe to user's posts
  useEffect(() => {
    if (!userId && !currentUser) {
      setUserPosts([]);
      return;
    }
    
    const targetId = userId || currentUser?.UserID;
    if (!targetId) return;
    
    const loadPosts = async () => {
      const posts = await firestore.getPostsByUser(targetId);
      setUserPosts(posts);
    };
    loadPosts();
  }, [userId, currentUser]);

  // Subscribe to liked posts
  useEffect(() => {
    if (!userId && !currentUser) {
      setLikedPosts([]);
      return;
    }
    
    const targetId = userId || currentUser?.UserID;
    if (!targetId) return;
    
    const loadLikedPosts = async () => {
      const posts = await firestore.getLikedPosts(targetId);
      setLikedPosts(posts);
    };
    loadLikedPosts();
  }, [userId, currentUser]);

  // Subscribe to followers/following counts
  useEffect(() => {
    if (!targetUser) {
      setFollowersCount(0);
      setFollowingCount(0);
      return;
    }
    
    const loadCounts = async () => {
      const followers = await firestore.getFollowers(targetUser.UserID);
      const following = await firestore.getFollowing(targetUser.UserID);
      setFollowersCount(followers.length);
      setFollowingCount(following.length);
    };
    loadCounts();
  }, [targetUser]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500"></div>
        <p className="text-sm font-bold text-slate-400 mt-4">Loading profile...</p>
      </div>
    );
  }

  if (!targetUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50">
        <h2 className="text-xl font-black text-slate-800 mb-2">Creator not found</h2>
        <Link to="/" className="text-sm font-bold text-lime-600 underline">
          Return to Feed
        </Link>
      </div>
    );
  }

  const isMe = currentUser?.UserID === targetUser.UserID;
  const followed = isFollowing(targetUser.UserID);

  const handleStartEdit = () => {
    setEditName(targetUser.Name);
    setEditBio(targetUser.Bio || '');
    setIsEditing(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMe) return;
    updateCurrentUser({
      Name: editName.trim() || targetUser.Name,
      Bio: editBio.trim()
    });
    setIsEditing(false);
  };

  const displayedPosts = activeTab === 'posts' ? userPosts : likedPosts;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 py-8 px-4 md:px-12 flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-8 pb-20">
        {/* Profile Card Banner */}
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50 p-8 md:p-12 relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-64 h-64 bg-lime-100/50 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 -bottom-12 w-64 h-64 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
            {/* Avatar */}
            <div className="relative">
              <img
                src={targetUser.Avatar}
                alt={targetUser.Username}
                className="w-32 h-32 md:w-36 md:h-36 rounded-full object-cover bg-slate-200 ring-4 ring-lime-500 shadow-xl"
              />
              <span className="absolute bottom-1 right-1 w-6 h-6 bg-lime-500 text-white rounded-full flex items-center justify-center text-xs font-black shadow-md">
                ✓
              </span>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left space-y-4">
              {isEditing ? (
                <form onSubmit={handleSaveEdit} className="space-y-3 max-w-md">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Display Name"
                    className="w-full bg-slate-100 rounded-xl px-4 py-2 font-black text-lg outline-none focus:ring-2 focus:ring-lime-500"
                  />
                  <textarea
                    rows={2}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Bio"
                    className="w-full bg-slate-100 rounded-xl px-4 py-2 text-xs outline-none focus:ring-2 focus:ring-lime-500 resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-lime-500 text-white text-xs font-bold rounded-xl shadow-sm hover:bg-lime-600"
                    >
                      Save Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-1.5 bg-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center justify-center md:justify-start gap-2">
                      <span>{targetUser.Name}</span>
                    </h1>
                    <p className="text-sm font-bold text-slate-400 mt-0.5">@{targetUser.Username}</p>
                  </div>

                  <p className="text-sm text-slate-700 max-w-lg leading-relaxed">
                    {targetUser.Bio || 'No bio provided.'}
                  </p>

                  {/* Stats Row */}
                  <div className="flex items-center justify-center md:justify-start gap-8 pt-2">
                    <div className="text-center md:text-left">
                      <span className="text-lg font-black text-slate-900">{userPosts.length}</span>
                      <span className="text-xs text-slate-400 font-bold block">Posts</span>
                    </div>
                    <div className="text-center md:text-left">
                      <span className="text-lg font-black text-slate-900">{followersCount}</span>
                      <span className="text-xs text-slate-400 font-bold block">Followers</span>
                    </div>
                    <div className="text-center md:text-left">
                      <span className="text-lg font-black text-slate-900">{followingCount}</span>
                      <span className="text-xs text-slate-400 font-bold block">Following</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {isMe ? (
                !isEditing && (
                  <button
                    onClick={handleStartEdit}
                    className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-full text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                )
              ) : (
                <button
                  onClick={() => {
                    if (!currentUser) setLoginModalOpen(true);
                    else toggleFollow(targetUser.UserID);
                  }}
                  className={`px-8 py-3 rounded-full font-black text-xs transition-all cursor-pointer flex items-center gap-2 ${
                    followed
                      ? 'bg-slate-100 text-slate-700 hover:bg-rose-50 hover:text-rose-600 border border-slate-200'
                      : 'bg-lime-500 hover:bg-lime-600 text-white shadow-lg shadow-lime-200'
                  }`}
                >
                  {followed ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider">
            <span>Joined {new Date(targetUser.JoinedAt).toLocaleDateString()}</span>
            <span>User ID: {targetUser.UserID}</span>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="flex gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-6 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'posts'
                ? 'bg-lime-500 text-white shadow-sm shadow-lime-200'
                : 'text-slate-500 hover:bg-slate-200/50'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>Posts ({userPosts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('likes')}
            className={`px-6 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'likes'
                ? 'bg-lime-500 text-white shadow-sm shadow-lime-200'
                : 'text-slate-500 hover:bg-slate-200/50'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Liked ({likedPosts.length})</span>
          </button>
        </div>

        {/* Grid View */}
        {displayedPosts.length === 0 ? (
          <div className="bg-white rounded-[32px] p-12 text-center border border-slate-100 space-y-2">
            <p className="text-sm font-bold text-slate-600">No content here yet</p>
            <p className="text-xs text-slate-400">
              {activeTab === 'posts' ? "This creator hasn't published any short videos or GIFs yet." : "No liked posts visible."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {displayedPosts.map((post) => (
              <div key={post.PostID} className="scale-98 hover:scale-100 transition-transform">
                <PostCard post={post} isActive={false} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
