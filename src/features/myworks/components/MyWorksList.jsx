import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import NewsListItem from '../../news/components/NewsListItem';
import { getUserNews, deleteUserNews } from '../services/MyWorksService';
import Button from '../../../components/common/Button/Button';
import './MyWorksList.css';

const MyWorksList = () => {
  const { user } = useAuth();
  const [userNews, setUserNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null); // ✅ state untuk ID yang sedang dihapus

  const fetchUserNews = useCallback(async () => {
    if (!user || !user.id) {
      setUserNews([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const news = await getUserNews(user.id);
      setUserNews(news);
    } catch (err) {
      setError(err.message || 'Failed to load your news');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserNews();
  }, [fetchUserNews]);

  const handleDelete = async (id) => {
    const confirm = window.confirm(
      'Are you sure you want to delete this news? This action cannot be undone.'
    );
    if (!confirm) return;

    try {
      setDeletingId(id); // ✅ hanya set ID yang sedang dihapus
      await deleteUserNews(user.id, id);
      setUserNews((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete news');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (timestamp) => {
    try {
      if (!timestamp) return 'Unknown date';
      const dateObj = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      if (isNaN(dateObj)) return 'Invalid date';
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      return dateObj.toLocaleDateString(undefined, options);
    } catch {
      return 'Invalid date';
    }
  };

  if (loading && !error && !deletingId) {
    // ✅ hanya tampilkan saat load awal dan tidak ada error
    return (
      <div className="loading-indicator">
        <span>Loading your news...</span>
      </div>
    );
  }

  if (error && !loading) {
    return (
      <div className="error-message">
        <p>Error: {error}</p>
        <button onClick={fetchUserNews} className="reload-btn">
          Try Again
        </button>
      </div>
    );
  }

  if (userNews.length === 0) {
    return (
      <div className="empty-works">
        <div className="empty-icon">📰</div>
        <h3>No news articles yet</h3>
        <p>You haven't created any news yet.</p>
        <Link to="/add-news" className="btn-add-news">
          <Button variant="primary">Create Your First News</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="my-works-container">
      <div className="my-works-list">
        <div className="my-works-header">
          <div className="header-content">
            <h2>Your Published News</h2>
            <p className="header-subtitle">
              Manage and edit your published articles
            </p>
          </div>
          <Link to="/add-news" className="btn-add-news">
            <Button variant="primary" size="small">
              <span className="btn-icon">+</span>
              Add News
            </Button>
          </Link>
        </div>

        <div className="works-stats">
          <div className="stat-item">
            <span className="stat-number">{userNews.length}</span>
            <span className="stat-label">Total Articles</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">
              {
                userNews.filter(
                  (news) =>
                    new Date(news.publishedAt) >
                    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                ).length
              }
            </span>
            <span className="stat-label">Last 30 Days</span>
          </div>
        </div>

        <div className="works-list">
          {userNews.map((news) => (
            <div key={news.id} className="work-item">
              <div className="work-meta">
                <div className="meta-info">
                  <span className="work-status">
                    <span className="status-dot published"></span>
                    Published
                  </span>
                  <span className="work-date">
                    Last Updated: {formatDate(news.updatedAt)}
                  </span>
                </div>
                <div className="work-actions">
                  <Link to={`/edit-news/${news.id}`} className="action-btn edit-btn">
                    ✎ Edit
                  </Link>
                  <button
                    className="action-btn delete-btn"
                    onClick={() => handleDelete(news.id)}
                    disabled={deletingId === news.id}
                  >
                    {deletingId === news.id ? 'Deleting...' : '× Delete'}
                  </button>
                </div>
              </div>

              <div className="work-content">
                <NewsListItem news={news} />
                <div className="work-footer">
                  <div className="work-tags">
                    {news.tags &&
                      news.tags.map((tag) => (
                        <span key={tag} className="work-tag">
                          #{tag}
                        </span>
                      ))}
                  </div>
                  <div className="work-views">
                    <span className="views-count">👁️ {news.views || 0} views</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="works-pagination">
          <p className="pagination-info">
            Showing {userNews.length} of {userNews.length} articles
          </p>
        </div>
      </div>
    </div>
  );
};

export default MyWorksList;
