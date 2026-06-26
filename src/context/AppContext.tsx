import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Post, User, Notification, Comment, AppsScriptConfig } from '../types';
import { firestore } from '../services/firestore';
import { useAuth } from './AuthContext';

export type FeedTab = 'foryou' | 'explore' | 'following' | 'trending';

interface AppContextType {
  posts: Post[];
  filteredPosts: Post[];
  activeTab: FeedTab;
  setActiveTab: (tab: FeedTab) => void;
  trendingTopics: string[];
  suggestedAccounts: User[];
  notifications: Notification[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedHashtag: string | null;
  setSelectedHashtag: (tag: string | null) => void;
  activeCommentPost: Post | null;
  setActiveCommentPost: (post: Post | null) => void;
  isUploadModalOpen: boolean;
  setUploadModalOpen: (open: boolean) => void;
  isShareModalOpen: boolean;
  setShareModalOpen: (open: boolean) => void;
  shareUrl: string;
  openShareModal: (url: string) => void;
  appsScriptConfig: AppsScriptConfig;
  updateAppsScriptConfig: (cfg: AppsScriptConfig) => void;
  refreshFeed: () => void;
  toggleLike: (postId: string) => void;
  toggleBookmark: (postId: string) => void;
  toggleFollow: (targetUserId: string) => boolean;
  isFollowing: (targetUserId: string) => boolean;
  addPost: (data: Omit<Post, 'PostID' | 'CreatedAt' | 'likesCount' | 'commentsCount'>) => Promise<Post>;
  addComment: (postId: string, text: string) => Promise<Comment>;
  getComments: (postId: string) => Promise<Comment[]>;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<FeedTab>('foryou');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeCommentPost, setActiveCommentPost] = useState<Post | null>(null);
  const [isUploadModalOpen, setUploadModalOpen] = useState(false);
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [appsScriptConfig, setAppsScriptConfig] = useState<AppsScriptConfig>({
    enabled: false,
    webAppUrl: ''
  });
  const [suggestedAccounts, setSuggestedAccounts] = useState<User[]>([]);

  const trendingTopics = [
    '#SpringBreak',
    '#PearsMVP',
    '#ASMRCooking',
    '#CodingLife',
    '#TravelPhotography'
  ];

  // Subscribe to posts
  useEffect(() => {
    const unsubscribe = firestore.subscribeToPosts(currentUser?.UserID, (loadedPosts) => {
      setPosts(loadedPosts);
    });
    
    return () => unsubscribe();
  }, [currentUser]);

  // Subscribe to notifications
  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      return;
    }
    
    const unsubscribe = firestore.subscribeToNotifications(currentUser.UserID, (notifs) => {
      setNotifications(notifs);
    });
    
    return () => unsubscribe();
  }, [currentUser]);

  // Subscribe to following list
  useEffect(() => {
    if (!currentUser) {
      setFollowingIds([]);
      return;
    }
    
    const loadFollowing = async () => {
      const following = await firestore.getFollowing(currentUser.UserID);
      setFollowingIds(following);
    };
    loadFollowing();
  }, [currentUser]);

  // Load suggested accounts
  useEffect(() => {
    const loadSuggestions = async () => {
      const allUsers = await firestore.getAllUsers();
      const suggestions = allUsers.filter(u => u.UserID !== currentUser?.UserID).slice(0, 5);
      setSuggestedAccounts(suggestions);
    };
    loadSuggestions();
  }, [currentUser]);

  // Filter posts based on activeTab, searchQuery, and selectedHashtag
  const filteredPosts = posts.filter(post => {
    // Hashtag filter
    if (selectedHashtag && !post.Caption.toLowerCase().includes(selectedHashtag.toLowerCase())) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCaption = post.Caption.toLowerCase().includes(q);
      const matchUser = post.user?.Username.toLowerCase().includes(q) || post.user?.Name.toLowerCase().includes(q);
      if (!matchCaption && !matchUser) return false;
    }

    // Tab filter
    if (activeTab === 'following') {
      return followingIds.includes(post.UserID) || post.UserID === currentUser?.UserID;
    }
    if (activeTab === 'trending') {
      return post.likesCount > 5000;
    }
    return true; // foryou & explore
  });

  const refreshFeed = useCallback(() => {
    // Posts are updated via subscription, no manual refresh needed
  }, []);

  const toggleLike = async (postId: string) => {
    if (!currentUser) return;
    await firestore.toggleLike(postId, currentUser.UserID);
    // Posts will update via subscription
  };

  const toggleBookmark = async (postId: string) => {
    if (!currentUser) return;
    await firestore.toggleBookmark(postId, currentUser.UserID);
    // Posts will update via subscription
  };

  const toggleFollow = async (targetUserId: string): Promise<boolean> => {
    if (!currentUser) return false;
    const result = await firestore.toggleFollow(currentUser.UserID, targetUserId);
    // Update following list
    const following = await firestore.getFollowing(currentUser.UserID);
    setFollowingIds(following);
    return result;
  };

  const isFollowing = (targetUserId: string): boolean => {
    return followingIds.includes(targetUserId);
  };

  const addPost = async (data: Omit<Post, 'PostID' | 'CreatedAt' | 'likesCount' | 'commentsCount'>): Promise<Post> => {
    if (!currentUser) throw new Error('Not logged in');
    return await firestore.createPost({ ...data, UserID: currentUser.UserID });
  };

  const addComment = async (postId: string, text: string): Promise<Comment> => {
    if (!currentUser) throw new Error('Not logged in');
    return await firestore.addComment(postId, currentUser.UserID, text);
  };

  const getComments = async (postId: string): Promise<Comment[]> => {
    return await firestore.getComments(postId);
  };

  const openShareModal = (url: string) => {
    setShareUrl(url);
    setShareModalOpen(true);
  };

  const updateAppsScriptConfig = (cfg: AppsScriptConfig) => {
    setAppsScriptConfig(cfg);
  };

  const resetAllData = () => {
    console.warn('resetAllData is deprecated - Firestore data should be managed manually');
  };

  return (
    <AppContext.Provider
      value={{
        posts,
        filteredPosts,
        activeTab,
        setActiveTab,
        trendingTopics,
        suggestedAccounts,
        notifications,
        searchQuery,
        setSearchQuery,
        selectedHashtag,
        setSelectedHashtag,
        activeCommentPost,
        setActiveCommentPost,
        isUploadModalOpen,
        setUploadModalOpen,
        isShareModalOpen,
        setShareModalOpen,
        shareUrl,
        openShareModal,
        appsScriptConfig,
        updateAppsScriptConfig,
        refreshFeed,
        toggleLike,
        toggleBookmark,
        toggleFollow,
        isFollowing,
        addPost,
        addComment,
        getComments,
        resetAllData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
