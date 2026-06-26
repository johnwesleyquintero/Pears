import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  Timestamp,
  runTransaction,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore';
import { db } from '../firebase';
import { User, Post, Like, Comment, Following, Notification, Bookmark, AppsScriptConfig } from '../types';

// Collection names
const COLLECTIONS = {
  USERS: 'users',
  POSTS: 'posts',
  LIKES: 'likes',
  COMMENTS: 'comments',
  FOLLOWING: 'following',
  NOTIFICATIONS: 'notifications',
  BOOKMARKS: 'bookmarks'
};

// Helper to convert Firestore timestamp to ISO string
const toISOString = (timestamp: Timestamp | Date | string): string => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate().toISOString();
  }
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  return timestamp;
};

// Helper to convert Firestore document to User
const docToUser = (doc: DocumentData): User => {
  const data = doc.data();
  return {
    UserID: doc.id,
    GoogleID: data.GoogleID || '',
    Name: data.Name || '',
    Username: data.Username || '',
    Avatar: data.Avatar || '',
    Bio: data.Bio || '',
    JoinedAt: toISOString(data.JoinedAt)
  };
};

// Helper to convert Firestore document to Post
const docToPost = (doc: DocumentData, user?: User, likesCount: number = 0, commentsCount: number = 0): Post => {
  const data = doc.data();
  return {
    PostID: doc.id,
    UserID: data.UserID || '',
    MediaType: data.MediaType || 'image',
    MediaURL: data.MediaURL || '',
    ThumbnailURL: data.ThumbnailURL,
    Caption: data.Caption || '',
    Visibility: data.Visibility || 'public',
    CreatedAt: toISOString(data.CreatedAt),
    user,
    likesCount,
    commentsCount,
    isLikedByMe: false,
    isBookmarkedByMe: false
  };
};

// Helper to convert Firestore document to Comment
const docToComment = (doc: DocumentData, user?: User): Comment => {
  const data = doc.data();
  return {
    CommentID: doc.id,
    PostID: data.PostID || '',
    UserID: data.UserID || '',
    Comment: data.Comment || '',
    CreatedAt: toISOString(data.CreatedAt),
    user
  };
};

// Helper to convert Firestore document to Like
const docToLike = (doc: DocumentData): Like => {
  const data = doc.data();
  return {
    LikeID: doc.id,
    PostID: data.PostID || '',
    UserID: data.UserID || '',
    CreatedAt: toISOString(data.CreatedAt)
  };
};

class FirestoreService {
  // Users
  public async getUser(userId: string): Promise<User | null> {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        return docToUser(userSnap);
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  public async getUserByUsername(username: string): Promise<User | null> {
    try {
      const usersRef = collection(db, COLLECTIONS.USERS);
      const q = query(usersRef, where('Username', '==', username));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return docToUser(querySnapshot.docs[0]);
      }
      return null;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return null;
    }
  }

  public async saveUser(user: User): Promise<User> {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, user.UserID);
      await setDoc(userRef, {
        GoogleID: user.GoogleID,
        Name: user.Name,
        Username: user.Username,
        Avatar: user.Avatar,
        Bio: user.Bio,
        JoinedAt: user.JoinedAt ? Timestamp.fromDate(new Date(user.JoinedAt)) : serverTimestamp()
      });
      return user;
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  }

  public subscribeToUser(userId: string, callback: (user: User | null) => void): () => void {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    return onSnapshot(userRef, 
      (snapshot) => {
        if (snapshot.exists()) {
          callback(docToUser(snapshot));
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Error subscribing to user:', error);
        callback(null);
      }
    );
  }

  // Posts
  public async getPosts(currentUserId?: string): Promise<Post[]> {
    try {
      const postsRef = collection(db, COLLECTIONS.POSTS);
      const q = query(postsRef, orderBy('CreatedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const posts: Post[] = [];
      for (const docSnap of querySnapshot.docs) {
        const post = docToPost(docSnap);
        
        // Get user info
        const user = await this.getUser(post.UserID);
        post.user = user || undefined;
        
        // Get likes count
        const likesRef = collection(db, COLLECTIONS.LIKES);
        const likesQuery = query(likesRef, where('PostID', '==', post.PostID));
        const likesSnapshot = await getDocs(likesQuery);
        post.likesCount = likesSnapshot.size;
        
        // Get comments count
        const commentsRef = collection(db, COLLECTIONS.COMMENTS);
        const commentsQuery = query(commentsRef, where('PostID', '==', post.PostID));
        const commentsSnapshot = await getDocs(commentsQuery);
        post.commentsCount = commentsSnapshot.size;
        
        // Check if current user liked
        if (currentUserId) {
          const userLikeQuery = query(likesQuery, where('UserID', '==', currentUserId));
          const userLikeSnapshot = await getDocs(userLikeQuery);
          post.isLikedByMe = !userLikeSnapshot.empty;
          
          // Check if bookmarked
          const bookmarksRef = collection(db, COLLECTIONS.BOOKMARKS);
          const bookmarkQuery = query(
            bookmarksRef, 
            where('PostID', '==', post.PostID),
            where('UserID', '==', currentUserId)
          );
          const bookmarkSnapshot = await getDocs(bookmarkQuery);
          post.isBookmarkedByMe = !bookmarkSnapshot.empty;
        }
        
        posts.push(post);
      }
      
      return posts;
    } catch (error) {
      console.error('Error getting posts:', error);
      return [];
    }
  }

  public async createPost(post: Omit<Post, 'PostID' | 'CreatedAt' | 'likesCount' | 'commentsCount'>): Promise<Post> {
    try {
      const postsRef = collection(db, COLLECTIONS.POSTS);
      const newPostRef = await addDoc(postsRef, {
        UserID: post.UserID,
        MediaType: post.MediaType,
        MediaURL: post.MediaURL,
        ThumbnailURL: post.ThumbnailURL,
        Caption: post.Caption,
        Visibility: post.Visibility,
        CreatedAt: serverTimestamp()
      });
      
      return {
        ...post,
        PostID: newPostRef.id,
        CreatedAt: new Date().toISOString(),
        likesCount: 0,
        commentsCount: 0
      };
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  public async deletePost(postId: string): Promise<void> {
    try {
      const postRef = doc(db, COLLECTIONS.POSTS, postId);
      await deleteDoc(postRef);
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  public subscribeToPosts(currentUserId: string | undefined, callback: (posts: Post[]) => void): () => void {
    const postsRef = collection(db, COLLECTIONS.POSTS);
    const q = query(postsRef, orderBy('CreatedAt', 'desc'));
    
    return onSnapshot(q, async (snapshot) => {
      const posts: Post[] = [];
      
      for (const docSnap of snapshot.docs) {
        const post = docToPost(docSnap);
        
        // Get user info
        const user = await this.getUser(post.UserID);
        post.user = user || undefined;
        
        // Get likes count
        const likesRef = collection(db, COLLECTIONS.LIKES);
        const likesQuery = query(likesRef, where('PostID', '==', post.PostID));
        const likesSnapshot = await getDocs(likesQuery);
        post.likesCount = likesSnapshot.size;
        
        // Get comments count
        const commentsRef = collection(db, COLLECTIONS.COMMENTS);
        const commentsQuery = query(commentsRef, where('PostID', '==', post.PostID));
        const commentsSnapshot = await getDocs(commentsQuery);
        post.commentsCount = commentsSnapshot.size;
        
        // Check if current user liked
        if (currentUserId) {
          const userLikeQuery = query(likesQuery, where('UserID', '==', currentUserId));
          const userLikeSnapshot = await getDocs(userLikeQuery);
          post.isLikedByMe = !userLikeSnapshot.empty;
          
          // Check if bookmarked
          const bookmarksRef = collection(db, COLLECTIONS.BOOKMARKS);
          const bookmarkQuery = query(
            bookmarksRef, 
            where('PostID', '==', post.PostID),
            where('UserID', '==', currentUserId)
          );
          const bookmarkSnapshot = await getDocs(bookmarkQuery);
          post.isBookmarkedByMe = !bookmarkSnapshot.empty;
        }
        
        posts.push(post);
      }
      
      callback(posts);
    }, (error) => {
      console.error('Error subscribing to posts:', error);
      callback([]);
    });
  }

  // Likes
  public async toggleLike(postId: string, userId: string): Promise<boolean> {
    try {
      const likesRef = collection(db, COLLECTIONS.LIKES);
      const q = query(
        likesRef, 
        where('PostID', '==', postId),
        where('UserID', '==', userId)
      );
      const snapshot = await getDocs(q);
      
      let isLiked = false;
      
      if (!snapshot.empty) {
        // Unlike - delete the like
        const likeDoc = snapshot.docs[0];
        await deleteDoc(doc(db, COLLECTIONS.LIKES, likeDoc.id));
        isLiked = false;
      } else {
        // Like - create new like
        await addDoc(likesRef, {
          PostID: postId,
          UserID: userId,
          CreatedAt: serverTimestamp()
        });
        isLiked = true;
        
        // Create notification
        const postRef = doc(db, COLLECTIONS.POSTS, postId);
        const postSnap = await getDoc(postRef);
        if (postSnap.exists()) {
          const postData = postSnap.data();
          if (postData.UserID !== userId) {
            await this.addNotification({
              UserID: postData.UserID,
              SenderID: userId,
              Type: 'like',
              ReferenceID: postId
            });
          }
        }
      }
      
      return isLiked;
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  }

  public async getLikesCount(postId: string): Promise<number> {
    try {
      const likesRef = collection(db, COLLECTIONS.LIKES);
      const q = query(likesRef, where('PostID', '==', postId));
      const snapshot = await getDocs(q);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting likes count:', error);
      return 0;
    }
  }

  public subscribeToLikes(postId: string, callback: (count: number, isLikedByMe: boolean) => void, currentUserId?: string): () => void {
    const likesRef = collection(db, COLLECTIONS.LIKES);
    const q = query(likesRef, where('PostID', '==', postId));
    
    return onSnapshot(q, (snapshot) => {
      const count = snapshot.size;
      let isLikedByMe = false;
      
      if (currentUserId) {
        snapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.UserID === currentUserId) {
            isLikedByMe = true;
          }
        });
      }
      
      callback(count, isLikedByMe);
    }, (error) => {
      console.error('Error subscribing to likes:', error);
      callback(0, false);
    });
  }

  // Comments
  public async getComments(postId: string): Promise<Comment[]> {
    try {
      const commentsRef = collection(db, COLLECTIONS.COMMENTS);
      const q = query(commentsRef, where('PostID', '==', postId), orderBy('CreatedAt', 'asc'));
      const snapshot = await getDocs(q);
      
      const comments: Comment[] = [];
      for (const docSnap of snapshot.docs) {
        const comment = docToComment(docSnap);
        const user = await this.getUser(comment.UserID);
        comment.user = user || undefined;
        comments.push(comment);
      }
      
      return comments;
    } catch (error) {
      console.error('Error getting comments:', error);
      return [];
    }
  }

  public async addComment(postId: string, userId: string, commentText: string): Promise<Comment> {
    try {
      const commentsRef = collection(db, COLLECTIONS.COMMENTS);
      const newCommentRef = await addDoc(commentsRef, {
        PostID: postId,
        UserID: userId,
        Comment: commentText,
        CreatedAt: serverTimestamp()
      });
      
      // Get user info
      const user = await this.getUser(userId);
      
      // Create notification
      const postRef = doc(db, COLLECTIONS.POSTS, postId);
      const postSnap = await getDoc(postRef);
      if (postSnap.exists()) {
        const postData = postSnap.data();
        if (postData.UserID !== userId) {
          await this.addNotification({
            UserID: postData.UserID,
            SenderID: userId,
            Type: 'comment',
            ReferenceID: postId
          });
        }
      }
      
      return {
        CommentID: newCommentRef.id,
        PostID: postId,
        UserID: userId,
        Comment: commentText,
        CreatedAt: new Date().toISOString(),
        user: user || undefined
      };
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  public async deleteComment(commentId: string): Promise<void> {
    try {
      const commentRef = doc(db, COLLECTIONS.COMMENTS, commentId);
      await deleteDoc(commentRef);
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  public subscribeToComments(postId: string, callback: (comments: Comment[]) => void): () => void {
    const commentsRef = collection(db, COLLECTIONS.COMMENTS);
    const q = query(commentsRef, where('PostID', '==', postId), orderBy('CreatedAt', 'asc'));
    
    return onSnapshot(q, async (snapshot) => {
      const comments: Comment[] = [];
      
      for (const docSnap of snapshot.docs) {
        const comment = docToComment(docSnap);
        const user = await this.getUser(comment.UserID);
        comment.user = user || undefined;
        comments.push(comment);
      }
      
      callback(comments);
    }, (error) => {
      console.error('Error subscribing to comments:', error);
      callback([]);
    });
  }

  // Following
  public async getFollowing(userId: string): Promise<string[]> {
    try {
      const followingRef = collection(db, COLLECTIONS.FOLLOWING);
      const q = query(followingRef, where('UserID', '==', userId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data().FollowingID);
    } catch (error) {
      console.error('Error getting following:', error);
      return [];
    }
  }

  public async getFollowers(targetUserId: string): Promise<string[]> {
    try {
      const followingRef = collection(db, COLLECTIONS.FOLLOWING);
      const q = query(followingRef, where('FollowingID', '==', targetUserId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data().UserID);
    } catch (error) {
      console.error('Error getting followers:', error);
      return [];
    }
  }

  public async toggleFollow(followerId: string, targetUserId: string): Promise<boolean> {
    try {
      const followingRef = collection(db, COLLECTIONS.FOLLOWING);
      const q = query(
        followingRef,
        where('UserID', '==', followerId),
        where('FollowingID', '==', targetUserId)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        // Unfollow
        const followDoc = snapshot.docs[0];
        await deleteDoc(doc(db, COLLECTIONS.FOLLOWING, followDoc.id));
        return false;
      } else {
        // Follow
        await addDoc(followingRef, {
          UserID: followerId,
          FollowingID: targetUserId,
          CreatedAt: serverTimestamp()
        });
        
        // Create notification
        await this.addNotification({
          UserID: targetUserId,
          SenderID: followerId,
          Type: 'follow',
          ReferenceID: followerId
        });
        
        return true;
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      throw error;
    }
  }

  // Notifications
  public async getNotifications(userId: string): Promise<Notification[]> {
    try {
      const notificationsRef = collection(db, COLLECTIONS.NOTIFICATIONS);
      const q = query(
        notificationsRef, 
        where('UserID', '==', userId),
        orderBy('CreatedAt', 'desc')
      );
      const snapshot = await getDocs(q);
      
      const notifications: Notification[] = [];
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (data.SenderID !== userId) {
          const notification: Notification = {
            NotificationID: docSnap.id,
            UserID: data.UserID,
            SenderID: data.SenderID,
            Type: data.Type,
            ReferenceID: data.ReferenceID,
            CreatedAt: toISOString(data.CreatedAt)
          };
          
          // Get sender info
          const sender = await this.getUser(data.SenderID);
          notification.sender = sender || undefined;
          
          // Get post if reference is a post
          if (data.ReferenceID.startsWith('post_')) {
            const post = await this.getPostById(data.ReferenceID);
            notification.post = post || undefined;
          }
          
          notifications.push(notification);
        }
      }
      
      return notifications;
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  private async addNotification(data: Omit<Notification, 'NotificationID' | 'CreatedAt'>): Promise<void> {
    try {
      const notificationsRef = collection(db, COLLECTIONS.NOTIFICATIONS);
      await addDoc(notificationsRef, {
        UserID: data.UserID,
        SenderID: data.SenderID,
        Type: data.Type,
        ReferenceID: data.ReferenceID,
        CreatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  }

  public subscribeToNotifications(userId: string, callback: (notifications: Notification[]) => void): () => void {
    const notificationsRef = collection(db, COLLECTIONS.NOTIFICATIONS);
    const q = query(
      notificationsRef, 
      where('UserID', '==', userId),
      orderBy('CreatedAt', 'desc')
    );
    
    return onSnapshot(q, async (snapshot) => {
      const notifications: Notification[] = [];
      
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        if (data.SenderID !== userId) {
          const notification: Notification = {
            NotificationID: docSnap.id,
            UserID: data.UserID,
            SenderID: data.SenderID,
            Type: data.Type,
            ReferenceID: data.ReferenceID,
            CreatedAt: toISOString(data.CreatedAt)
          };
          
          // Get sender info
          const sender = await this.getUser(data.SenderID);
          notification.sender = sender || undefined;
          
          // Get post if reference is a post
          if (data.ReferenceID.startsWith('post_')) {
            const post = await this.getPostById(data.ReferenceID);
            notification.post = post || undefined;
          }
          
          notifications.push(notification);
        }
      }
      
      callback(notifications);
    }, (error) => {
      console.error('Error subscribing to notifications:', error);
      callback([]);
    });
  }

  // Bookmarks
  public async toggleBookmark(postId: string, userId: string): Promise<boolean> {
    try {
      const bookmarksRef = collection(db, COLLECTIONS.BOOKMARKS);
      const q = query(
        bookmarksRef,
        where('PostID', '==', postId),
        where('UserID', '==', userId)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        // Remove bookmark
        const bookmarkDoc = snapshot.docs[0];
        await deleteDoc(doc(db, COLLECTIONS.BOOKMARKS, bookmarkDoc.id));
        return false;
      } else {
        // Add bookmark
        await addDoc(bookmarksRef, {
          PostID: postId,
          UserID: userId,
          CreatedAt: serverTimestamp()
        });
        return true;
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      throw error;
    }
  }

  public async getBookmarkedPosts(userId: string): Promise<Post[]> {
    try {
      const bookmarksRef = collection(db, COLLECTIONS.BOOKMARKS);
      const q = query(bookmarksRef, where('UserID', '==', userId));
      const snapshot = await getDocs(q);
      
      const posts: Post[] = [];
      for (const bookmarkDoc of snapshot.docs) {
        const data = bookmarkDoc.data();
        const post = await this.getPostById(data.PostID);
        if (post) {
          post.isBookmarkedByMe = true;
          posts.push(post);
        }
      }
      
      return posts;
    } catch (error) {
      console.error('Error getting bookmarked posts:', error);
      return [];
    }
  }

  // Helper method to get a single post by ID
  private async getPostById(postId: string): Promise<Post | null> {
    try {
      const postRef = doc(db, COLLECTIONS.POSTS, postId);
      const postSnap = await getDoc(postRef);
      if (postSnap.exists()) {
        const post = docToPost(postSnap);
        
        // Get user info
        const user = await this.getUser(post.UserID);
        post.user = user || undefined;
        
        // Get likes count
        const likesRef = collection(db, COLLECTIONS.LIKES);
        const likesQuery = query(likesRef, where('PostID', '==', postId));
        const likesSnapshot = await getDocs(likesQuery);
        post.likesCount = likesSnapshot.size;
        
        // Get comments count
        const commentsRef = collection(db, COLLECTIONS.COMMENTS);
        const commentsQuery = query(commentsRef, where('PostID', '==', postId));
        const commentsSnapshot = await getDocs(commentsQuery);
        post.commentsCount = commentsSnapshot.size;
        
        return post;
      }
      return null;
    } catch (error) {
      console.error('Error getting post by ID:', error);
      return null;
    }
  }
}

export const firestore = new FirestoreService();
