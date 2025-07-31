import { db } from '../../../firebase/firebaseConfig';
import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  arrayRemove,
  arrayUnion,
} from 'firebase/firestore';

// Fetch all news
export const fetchNews = async () => {
  const q = query(collection(db, 'news'), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Fetch news by ID
export const fetchNewsById = async (id) => {
  const ref = doc(db, 'news', id);
  const snapshot = await getDoc(ref);
  if (!snapshot.exists()) throw new Error('News not found');
  return { id: snapshot.id, ...snapshot.data() };
};

// Add news
export const addNews = async (newsData) => {
  const docRef = await addDoc(collection(db, 'news'), {
    ...newsData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    comments: [],
    likes: [],
    likesCount: 0,
  });
  return { id: docRef.id, ...newsData };
};

// Update news
export const updateNews = async (id, data) => {
  const ref = doc(db, 'news', id);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
  return { id, ...data };
};

// Delete news
export const deleteNews = async (id) => {
  const ref = doc(db, 'news', id);
  await deleteDoc(ref);
  return true;
};

// Add comment
export const addComment = async (newsId, comment) => {
  const newsRef = doc(db, 'news', newsId);
  const snapshot = await getDoc(newsRef);
  if (!snapshot.exists()) throw new Error('News not found');

  const news = snapshot.data();
  const updatedComments = [
    ...(news.comments || []),
    {
      ...comment,
      id: String((news.comments?.length || 0) + 1),
      createdAt: new Date().toISOString(),
    },
  ];

  await updateDoc(newsRef, {
    comments: updatedComments,
    updatedAt: serverTimestamp(),
  });

  return { id: newsId, ...news, comments: updatedComments };
};

// Add reply to comment
export const addReply = async (newsId, parentCommentId, reply) => {
  const newsRef = doc(db, 'news', newsId);
  const snapshot = await getDoc(newsRef);
  if (!snapshot.exists()) throw new Error('News not found');

  const news = snapshot.data();
  const updatedComments = (news.comments || []).map((comment) => {
    if (comment.id === parentCommentId) {
      const updatedReplies = [
        ...(comment.replies || []),
        {
          ...reply,
          id: String(((comment.replies || []).length || 0) + 1),
          createdAt: new Date().toISOString(),
        },
      ];
      return { ...comment, replies: updatedReplies };
    }
    return comment;
  });

  await updateDoc(newsRef, {
    comments: updatedComments,
    updatedAt: serverTimestamp(),
  });

  return { id: newsId, ...news, comments: updatedComments };
};

// Toggle like
export const toggleLikeNews = async (newsId, userId) => {
  const newsRef = doc(db, 'news', newsId);
  const newsSnap = await getDoc(newsRef);
  if (!newsSnap.exists()) throw new Error('News not found');

  const newsData = newsSnap.data();
  const currentLikes = newsData.likes || [];
  const hasLiked = currentLikes.includes(userId);

  const updatedLikes = hasLiked
    ? currentLikes.filter((id) => id !== userId)
    : [...currentLikes, userId];

  await updateDoc(newsRef, {
    likes: hasLiked ? arrayRemove(userId) : arrayUnion(userId),
    likesCount: updatedLikes.length,
    updatedAt: serverTimestamp(),
  });

  const updatedSnap = await getDoc(newsRef);
  return updatedSnap.data().likes || [];
};

// Search news
export const searchNews = async (queryText) => {
  const news = await fetchNews();
  const lower = queryText.toLowerCase();
  return news.filter(item =>
    (item.title?.toLowerCase() || '').includes(lower) ||
    (item.content?.toLowerCase() || '').includes(lower)
  );
};

// Delete comment by ID (admin or author)
export const deleteComment = async (newsId, commentId) => {
  const newsRef = doc(db, 'news', newsId);
  const snapshot = await getDoc(newsRef);
  if (!snapshot.exists()) throw new Error('News not found');

  const news = snapshot.data();

  const filteredComments = (news.comments || []).filter(comment => comment.id !== commentId);

  // Juga hapus reply jika itu adalah parent
  const cleanedComments = filteredComments.map(comment => {
    const replies = comment.replies?.filter(reply => reply.id !== commentId);
    return { ...comment, replies };
  });

  await updateDoc(newsRef, {
    comments: cleanedComments,
    updatedAt: serverTimestamp(),
  });

  return { id: newsId, ...news, comments: cleanedComments };
};

// ✅ Submit report to Firestore
export const submitNewsReport = async ({ newsId, userId, category, reason }) => {
  const reportsRef = collection(db, 'news_reports');
  const report = {
    newsId,
    userId,
    category,
    reason,
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(reportsRef, report);
  return docRef.id;
};

export const toggleCommentLike = async (newsId, commentId, userId) => {
  const newsRef = doc(db, 'news', newsId);
  const snapshot = await getDoc(newsRef);
  if (!snapshot.exists()) throw new Error('News not found');

  const newsData = snapshot.data();
  const updatedComments = (newsData.comments || []).map((comment) => {
    if (comment.id === commentId) {
      const likedBy = comment.likedBy || [];
      const hasLiked = likedBy.includes(userId);

      const updatedLikedBy = hasLiked
        ? likedBy.filter((id) => id !== userId)
        : [...likedBy, userId];

      return {
        ...comment,
        likedBy: updatedLikedBy,
        likesCount: updatedLikedBy.length
      };
    }
    return comment;
  });

  await updateDoc(newsRef, {
    comments: updatedComments,
    updatedAt: serverTimestamp()
  });

  return { id: newsId, ...newsData, comments: updatedComments };
};

