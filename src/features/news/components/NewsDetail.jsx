import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { useNews } from '../hooks/useNews';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import { FaRegHeart, FaHeart, FaFlag } from 'react-icons/fa';

// ...import sama seperti sebelumnya
import './NewsDetail.css';
import defaultAvatar from '../../../assets/image/Profile.jpg';
import { toggleLikeNews } from '../services/newsService';
import { submitNewsReport } from '../services/newsService';


const NewsDetail = ({ news, onRefresh }) => {
  const { user } = useAuth();
  const { deleteNews, updateComment, deleteComment, updateNewsInContext } = useNews();
  const navigate = useNavigate();

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(news.likes?.length || 0);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportCategory, setReportCategory] = useState('');

  const isOwnerOrAdmin =
    user && (news.author?.id === user.id || user.uid === news.author?.id || user.role === 'admin');

  useEffect(() => {
    if (user && news.likes) {
      setIsLiked(news.likes.includes(user.uid || user.id));
    }
    setLikeCount(news.likes?.length || 0);
  }, [news.likes, user]);

  const handleLikeClick = async () => {
    if (!user) {
      alert('Login terlebih dahulu untuk menyukai berita ini.');
      return;
    }

    try {
      const updatedLikes = await toggleLikeNews(news.id, user.uid || user.id);
      setIsLiked(updatedLikes.includes(user.uid || user.id));
      setLikeCount(updatedLikes.length);
      updateNewsInContext({ ...news, likes: updatedLikes });
    } catch (error) {
      console.error('Gagal memperbarui suka:', error);
    }
  };

  const handleReportSubmit = async (e) => {
  e.preventDefault();
  if (!user) return alert('Silakan login untuk melaporkan.');
  if (!reportReason || !reportCategory) return alert('Harap isi kategori dan alasan laporan.');

  try {
    await submitNewsReport({
      newsId: news.id,
      userId: user.uid || user.id,
      category: reportCategory,
      reason: reportReason
    });

    alert('Laporan Anda telah dikirim.');
    setShowReportForm(false);
    setReportReason('');
    setReportCategory('');
  } catch (error) {
    console.error('Gagal mengirim laporan:', error);
    alert('Gagal mengirim laporan.');
  }
};


  const handleDelete = async () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus berita ini?')) {
      try {
        await deleteNews(news.id);
        navigate('/my-works');
      } catch (err) {
        alert('Gagal menghapus berita: ' + (err.message || 'Error tidak diketahui'));
      }
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Yakin hapus komentar ini?')) {
      try {
        await deleteComment(news.id, commentId);
      } catch (err) {
        alert('Gagal menghapus komentar: ' + (err.message || 'Error tidak diketahui'));
      }
    }
  };

  const handleUpdateComment = async (commentId, newContent) => {
    try {
      await updateComment(news.id, commentId, newContent);
    } catch (err) {
      alert('Gagal memperbarui komentar: ' + (err.message || 'Error tidak diketahui'));
    }
  };

  const handleCommentAddedToNews = () => {
    if (onRefresh) onRefresh();
  };

  const formatDate = (timestamp) => {
    try {
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return 'Invalid date';
    }
  };

  const parseMarkdownLink = (markdown) => {
    const match = /\[(.+?)\]\((.+?)\)/.exec(markdown);
    return match ? { text: match[1], url: match[2] } : null;
  };

  return (
    <div className="news-detail">
      <div className="news-header">
        <h1 className="news-title">{news.title}</h1>
        <div className="news-meta">
          <div className="news-author">
            <img
              src={news.author?.profilePicture || defaultAvatar}
              alt={news.author?.name || 'User'}
              className="author-avatar"
            />
            <span className="author-name">{news.author?.name || 'User'}</span>
          </div>
          <span className="news-date">
            Diupload: {formatDate(news.createdAt)}
            {news.updatedAt && ` | Diperbarui: ${formatDate(news.updatedAt)}`}
          </span>
        </div>
      </div>

      <div className="news-image">
        <img src={news.image} alt={news.title} />
      </div>

      <div className="news-content">
        <p>{news.content}</p>
        {news.link && (() => {
          const link = parseMarkdownLink(news.link);
          return link ? (
            <p className="news-link">
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                {link.text}
              </a>
            </p>
          ) : null;
        })()}
      </div>

      <div className="news-actions">
        <div className="news-stats">
          <span className="news-comments">{news.comments?.length || 0} Komentar</span>
          <span
            className={`news-likes ${isLiked ? 'liked' : ''}`}
            onClick={handleLikeClick}
            role="button"
          >
            {isLiked ? <FaHeart className="like-icon active" /> : <FaRegHeart className="like-icon" />}
            {likeCount} Suka
          </span>
        </div>

        <div className="news-author-actions">
          <button
            className="btn-report"
            onClick={() => setShowReportForm((prev) => !prev)}
          >
             <FaFlag className="report-flag-icon" />
            {showReportForm ? 'Tutup Laporan' : 'Laporkan'}
          </button>
          {isOwnerOrAdmin && (
            <>
              <Link to={`/edit-news/${news.id}`} className="btn-edit">
                <i className="edit-icon"></i> Edit
              </Link>
              <button className="btn-delete" onClick={handleDelete}>
                <i className="delete-icon"></i> Hapus
              </button>
            </>
          )}
        </div>
      </div>

      {showReportForm && (
        <form className="report-form" onSubmit={handleReportSubmit}>
          <label>
            Kategori Laporan:
            <select value={reportCategory} onChange={(e) => setReportCategory(e.target.value)}>
              <option value="">--Pilih Kategori--</option>
              <option value="Hoax">Hoax / Berita Palsu</option>
              <option value="SARA">SARA / Ujaran Kebencian</option>
              <option value="Spam">Spam / Iklan</option>
              <option value="Lainnya">Lainnya</option>
            </select>
          </label>
          <label>
            Alasan:
            <textarea
              placeholder="Jelaskan alasan Anda..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            />
          </label>
          <button type="submit" className="btn-submit-report">Kirim Laporan</button>
        </form>
      )}

      <div className="news-comments-section">
        <h3 className="comments-title">Komentar</h3>
        {user ? (
          <CommentForm newsId={news.id} onCommentAdded={handleCommentAddedToNews} />
        ) : (
          <div className="comments-login-prompt">
            <p>
              <Link to="/login">Login</Link> atau{' '}
              <Link to="/register">daftar</Link> untuk memberikan komentar.
            </p>
          </div>
        )}

        <CommentList
          comments={news.comments || []}
          newsId={news.id}
          currentUserId={user?.uid || user?.id}
          currentUserRole={user?.role}
          onDelete={handleDeleteComment}
          onUpdate={handleUpdateComment}
        />
      </div>
    </div>
  );
};

export default NewsDetail;
