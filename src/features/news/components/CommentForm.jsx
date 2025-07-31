import React, { useState } from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import { useNews } from '../hooks/useNews';
import Button from '../../../components/common/Button/Button';
import './CommentForm.css';
import defaultAvatar from '../../../assets/image/Profile.jpg';

const CommentForm = ({
  newsId,
  parentCommentId = null,
  onCommentAdded,
  onCancelReply,
  parentAuthorName = ''
}) => {
  const { user } = useAuth();
  const { addComment, addReply } = useNews();

  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const commentData = {
        content: comment.trim(),
        author: {
          id: user?.uid || user?.id,
          name: user?.name,
          profilePicture: user?.profilePicture || defaultAvatar,
        },
      };

      let result;
      if (parentCommentId) {
        result = await addReply(newsId, parentCommentId, commentData);
      } else {
        result = await addComment(newsId, commentData);
      }

      setComment('');
      onCommentAdded?.(result);
      onCancelReply?.(); // jika sedang reply, sembunyikan form reply

    } catch (err) {
      setError(err.message || 'Gagal menambahkan komentar');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`comment-form-container ${parentCommentId ? 'reply-form-container' : ''}`}>
      {error && <div className="form-error">{error}</div>}

      <form className="comment-form" onSubmit={handleSubmit}>
        <div className="comment-input-group">
          <img
            src={user?.profilePicture || defaultAvatar}
            alt={user?.name || 'User'}
            className="comment-avatar"
          />

          <input
            type="text"
            placeholder={
              parentCommentId
                ? `Replying to ${parentAuthorName || 'user'}`
                : 'What are your thoughts?'
            }
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="comment-input"
            disabled={isLoading}
          />
        </div>

        <div className="comment-buttons">
          <Button
            type="submit"
            variant="primary"
            size="small"
            disabled={isLoading || !comment.trim()}
          >
            {isLoading ? 'Mengirim...' : parentCommentId ? 'Reply' : 'Post'}
          </Button>

          {parentCommentId && (
            <Button
              type="button"
              variant="secondary"
              size="small"
              onClick={onCancelReply}
              disabled={isLoading}
              className="cancel-reply-btn"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CommentForm;
