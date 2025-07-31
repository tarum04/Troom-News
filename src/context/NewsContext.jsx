import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo
} from 'react';

import {
  fetchNews,
  fetchNewsById,
  searchNews,
  addNews,
  deleteNews,
  addComment,
  addReply,
  updateNews
} from '../features/news/services/newsService';
import { toggleCommentLike as toggleCommentLikeService } from '../features/news/services/newsService';



export const NewsContext = createContext();

export const NewsProvider = ({ children }) => {
  const [news, setNews] = useState([]);
  const [currentNews, setCurrentNews] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadNews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const newsData = await fetchNews();
      setNews(newsData);
    } catch (err) {
      setError(err.message || 'Failed to load news');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  const getNewsById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const newsItem = await fetchNewsById(id);
      setCurrentNews(newsItem);
      return newsItem;
    } catch (err) {
      setError(err.message || 'Failed to load news');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeleteComment = useCallback(async (newsId, commentId) => {
    setLoading(true);
    setError(null);
    try {
      const newsItem = news.find(item => item.id === newsId);
      if (!newsItem) throw new Error('News tidak ditemukan');

      const updatedComments = (newsItem.comments || []).filter(
        (comment) => comment.id !== commentId
      );

      await updateNews(newsId, { comments: updatedComments });

      const updatedNews = { ...newsItem, comments: updatedComments };

      setNews(prev => prev.map(item => item.id === newsId ? updatedNews : item));
      if (currentNews?.id === newsId) {
        setCurrentNews(updatedNews);
      }

      return updatedNews;
    } catch (err) {
      setError(err.message || 'Gagal menghapus komentar');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [news, currentNews]);

  const handleAddNews = useCallback(async (newsData) => {
    setLoading(true);
    setError(null);
    try {
      const newNews = await addNews(newsData);
      setNews(prev => [newNews, ...prev]);
      return newNews;
    } catch (err) {
      setError(err.message || 'Failed to add news');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeleteNews = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      await deleteNews(id);
      setNews(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete news');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAddComment = useCallback(async (newsId, comment) => {
    setLoading(true);
    setError(null);
    try {
      const updatedNews = await addComment(newsId, comment);
      setNews(prev =>
        prev.map(item => (item.id === newsId ? updatedNews : item))
      );
      if (currentNews?.id === newsId) {
        setCurrentNews(updatedNews);
      }
      return updatedNews;
    } catch (err) {
      setError(err.message || 'Failed to add comment');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentNews]);

  const handleAddReply = useCallback(async (newsId, parentCommentId, reply) => {
    setLoading(true);
    setError(null);
    try {
      const updatedNews = await addReply(newsId, parentCommentId, reply);
      setNews(prev =>
        prev.map(item => (item.id === newsId ? updatedNews : item))
      );
      if (currentNews?.id === newsId) {
        setCurrentNews(updatedNews);
      }
      return updatedNews;
    } catch (err) {
      setError(err.message || 'Failed to add reply');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentNews]);

  const handleUpdateNews = useCallback(async (id, data) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await updateNews(id, data);
      setNews(prev => prev.map(item => (item.id === id ? updated : item)));
      if (currentNews?.id === id) {
        setCurrentNews(updated);
      }
      return updated;
    } catch (err) {
      setError(err.message || 'Failed to update news');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentNews]);

  const handleSearchNews = useCallback(async (query) => {
    setLoading(true);
    setError(null);
    try {
      const results = await searchNews(query);
      return results;
    } catch (err) {
      setError(err.message || 'Search failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateNewsInContext = useCallback((updatedNewsItem) => {
    setNews(prevNews =>
      prevNews.map(newsItem =>
        newsItem.id === updatedNewsItem.id ? updatedNewsItem : newsItem
      )
    );
    if (currentNews?.id === updatedNewsItem.id) {
      setCurrentNews(updatedNewsItem);
    }
  }, [currentNews]);

  const handleToggleCommentLike = useCallback(async (newsId, commentId, userId) => {
  setLoading(true);
  setError(null);
  try {
    const updatedNews = await toggleCommentLikeService(newsId, commentId, userId);
    setNews(prev => prev.map(item => item.id === newsId ? updatedNews : item));
    if (currentNews?.id === newsId) {
      setCurrentNews(updatedNews);
    }
  } catch (err) {
    setError(err.message || 'Failed to toggle comment like');
  } finally {
    setLoading(false);
  }
}, [currentNews]);

  const contextValue = useMemo(() => ({
    news,
    currentNews,
    loading,
    error,
    loadNews,
    getNewsById,
    addNews: handleAddNews,
    deleteNews: handleDeleteNews,
    addComment: handleAddComment,
    addReply: handleAddReply,
    updateNews: handleUpdateNews,
    deleteComment: handleDeleteComment,
    searchNews: handleSearchNews,
    updateNewsInContext,
    toggleCommentLike: handleToggleCommentLike,
  }), [
    news,
    currentNews,
    loading,
    error,
    loadNews,
    getNewsById,
    handleAddNews,
    handleDeleteNews,
    handleAddComment,
    handleAddReply,
    handleUpdateNews,
    handleSearchNews,
    updateNewsInContext,
    handleDeleteComment,
    handleToggleCommentLike,
  ]);

  return (
    <NewsContext.Provider value={contextValue}>
      {children}
    </NewsContext.Provider>
  );
};
