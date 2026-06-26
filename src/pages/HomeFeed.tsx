import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { PostCard } from '../components/feed/PostCard';
import { Sparkles, Compass, Users, Flame, RefreshCw } from 'lucide-react';
import { FeedTab } from '../context/AppContext';

export const HomeFeed: React.FC = () => {
  const { filteredPosts, activeTab, setActiveTab, refreshFeed, searchQuery } = useApp();
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection observer or scroll spy for active video
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const cards = containerRef.current.querySelectorAll('.post-card-container');
      let closestIdx = 0;
      let minDistance = Infinity;

      cards.forEach((card, idx) => {
        const rect = card.getBoundingClientRect();
        const dist = Math.abs(rect.top + rect.height / 2 - window.innerHeight / 2);
        if (dist < minDistance) {
          minDistance = dist;
          closestIdx = idx;
        }
      });

      setActiveIndex(closestIdx);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('scroll', handleScroll, { passive: true });
    }
    return () => {
      if (container) container.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [filteredPosts]);

  return (
    <main className="flex-1 flex flex-col items-center overflow-y-auto py-6 px-4 bg-slate-50 relative" ref={containerRef}>
      {/* Mobile Feed Tabs Bar */}
      <div className="flex md:hidden items-center gap-2 mb-6 bg-white p-1.5 rounded-full shadow-sm border border-slate-100 max-w-sm w-full">
        {(['foryou', 'explore', 'following', 'trending'] as FeedTab[]).map((tab) => {
          const names: Record<FeedTab, string> = {
            foryou: 'For You',
            explore: 'Explore',
            following: 'Following',
            trending: '🔥'
          };
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-3 rounded-full text-xs font-black transition-all text-center cursor-pointer ${
                active ? 'bg-lime-500 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {names[tab]}
            </button>
          );
        })}
      </div>

      {/* Feed Status / Refresh Header */}
      {searchQuery && (
        <div className="w-full max-w-[480px] mb-4 bg-lime-50 border border-lime-200 p-3 rounded-2xl flex items-center justify-between text-xs text-lime-800 font-bold">
          <span>Filtering feed for: "{searchQuery}"</span>
          <button onClick={refreshFeed} className="p-1 hover:bg-lime-200 rounded-lg">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main TikTok Feed Layout container matching Design specifications */}
      <div className="w-full max-w-[480px] flex flex-col gap-8 pb-20">
        {filteredPosts.length === 0 ? (
          <div className="bg-white rounded-[40px] border border-slate-100 p-12 text-center shadow-sm space-y-4">
            <img src="/logo.png" alt="Pears" className="w-16 h-16 rounded-2xl mx-auto object-cover shadow-sm" />
            <h3 className="text-lg font-black text-slate-800">No content found</h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              {activeTab === 'following'
                ? "You aren't following anyone with posts yet. Switch to 'For You' or 'Explore' to discover creators!"
                : "No posts match your current search or filters. Try clearing filters or uploading a new post!"}
            </p>
            <button
              onClick={() => {
                setActiveTab('foryou');
                refreshFeed();
              }}
              className="px-6 py-2.5 bg-lime-500 hover:bg-lime-600 text-white font-bold rounded-full text-xs transition-all shadow-md shadow-lime-200 cursor-pointer"
            >
              Reset to Main Feed
            </button>
          </div>
        ) : (
          filteredPosts.map((post, index) => (
            <div key={post.PostID} className="post-card-container snap-center">
              <PostCard post={post} isActive={index === activeIndex} />
            </div>
          ))
        )}
      </div>
    </main>
  );
};
