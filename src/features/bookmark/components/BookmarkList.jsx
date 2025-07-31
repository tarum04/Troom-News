import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import NewsListItem from '../../news/components/NewsListItem';
import { getBookmarks, removeBookmark } from '../services/bookmarkService';
import './BookmarkList.css';

const BookmarkList = () => {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBookmarks = useCallback(async () => {
    if (!user) {
      setBookmarks([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getBookmarks(user.id);
      setBookmarks(data);
    } catch (err) {
      setError(err.message || 'Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const handleRemoveBookmark = async (newsId) => {
    if (!user) return;

    try {
      const updated = await removeBookmark(user.id, newsId);
      setBookmarks(updated);
    } catch (err) {
      setError(err.message || 'Failed to remove bookmark');
    }
  };

  if (loading) return <div className="loading-indicator">Loading bookmarks...</div>;

  if (error) {
    return (
      <div className="error-message">
        <p>Error: {error}</p>
        <button onClick={fetchBookmarks} className="reload-btn">
          Try Again
        </button>
      </div>
    );
  }

  if (bookmarks.length === 0) {
    return (
      <div className="empty-bookmarks">
        <p>You don't have any bookmarks yet.</p>
      </div>
    );
  }

  return (
    <div className="bookmarks-list">
      {bookmarks.map((news) => (
        <div key={news.id} className="bookmark-item">
          <NewsListItem news={news} />
          <button
            className="action-btn remove remove-bookmark-btn"
            onClick={() => handleRemoveBookmark(news.id)}
            aria-label="Remove bookmark"
            title="Remove bookmark"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Remove
          </button>
        </div>
      ))}
    </div>
  );
};

export default BookmarkList;
