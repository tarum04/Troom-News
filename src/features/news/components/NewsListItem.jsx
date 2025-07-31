import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaRegHeart, FaHeart, FaRegBookmark, FaBookmark, FaRegComment, FaFlag } from 'react-icons/fa';
import Card from '../../../components/common/Card/Card';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { useNews } from '../hooks/useNews';
import {
  addBookmark,
  removeBookmark,
  isBookmarked
} from '../../bookmark/services/bookmarkService';
import { toggleLikeNews } from '../services/newsService';
import defaultAvatar from '../../../assets/image/Profile.jpg';
import './NewsListItem.css';

const NewsListItem = ({ news }) => {
  const { user } = useAuth();
  const { updateNewsInContext } = useNews();

  const [bookmarked, setBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(news.likes?.length || 0);

  useEffect(() => {
    if (user && news.likes) {
      setIsLiked(news.likes.includes(user.uid || user.id));
    }
    setLikeCount(news.likes?.length || 0);
  }, [news.likes, user, news.id]);

  const handleLikeClick = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Login terlebih dahulu untuk menyukai berita ini.");
      return;
    }

    try {
      const updatedLikes = await toggleLikeNews(news.id, user.uid || user.id);
      setIsLiked(updatedLikes.includes(user.uid || user.id));
      setLikeCount(updatedLikes.length);

      // update global context
      updateNewsInContext({ ...news, likes: updatedLikes });
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  const handleBookmarkClick = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (bookmarked) {
        await removeBookmark(user.id, news.id);
        setBookmarked(false);
      } else {
        await addBookmark(user.id, news);
        setBookmarked(true);
      }
    } catch (err) {
      console.error('Bookmark action failed:', err);
    }
  };

  useEffect(() => {
    const checkBookmark = async () => {
      if (user) {
        const status = await isBookmarked(user.id, news.id);
        setBookmarked(status);
      }
    };
    checkBookmark();
  }, [user, news.id]);

  const formatDate = (timestamp) => {
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      if (isNaN(date)) return "Invalid date";
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return "Invalid date";
    }
  };

  const handleReportClick = (e) => {
    e.preventDefault();
    alert('Untuk melaporkan berita, silakan buka halaman detail.');
  };

  return (
    <Card className="news-item" padding={false}>
      <Link to={`/news/${news.id}`} className="news-item-link">
        <div className="news-item-content">
          <div className="news-item-author">
            <img
              src={news.author?.profilePicture || defaultAvatar}
              alt={news.author?.name || "Author"}
              className="author-avatar"
              loading="lazy"
              width="24"
              height="24"
            />
            <span className="author-name">{news.author?.name || "Unknown Author"}</span>
          </div>

          <h3 className="news-item-title">{news.title}</h3>
          <p className="news-item-excerpt">{news.content}</p>

          <div className="news-item-footer">
            <span className="news-item-date">{formatDate(news.createdAt)}</span>

            <div className="news-item-stats">
              <span className="news-item-comments">
                <FaRegComment className="icon comment-icon" />
                {Array.isArray(news.comments) ? news.comments.length : 0}
              </span>

              <span className="news-item-likes" onClick={handleLikeClick}>
                {isLiked ? (
                  <FaHeart className="icon like-icon active" />
                ) : (
                  <FaRegHeart className="icon like-icon" />
                )}
                {likeCount}
              </span>

              <span className="news-item-bookmark" onClick={handleBookmarkClick}>
                {bookmarked ? (
                  <FaBookmark className="icon bookmark-icon active" />
                ) : (
                  <FaRegBookmark className="icon bookmark-icon" />
                )}
              </span>

              <span
                className="news-item-report"
                title="Laporkan berita ini"
                onClick={handleReportClick}
              >
                <FaFlag className="icon report-icon" />
              </span>
            </div>
          </div>
        </div>

        <div className="news-item-image">
          <img
            src={news.image}
            alt={news.title}
            loading="lazy"
            width="280"
            height="100%"
          />
        </div>
      </Link>
    </Card>
  );
};

NewsListItem.displayName = 'NewsListItem';
export default NewsListItem;
