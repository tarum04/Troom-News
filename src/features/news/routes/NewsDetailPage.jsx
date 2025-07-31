import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNews } from '../hooks/useNews';
import NewsDetail from '../components/NewsDetail';
import {
  FacebookShareButton,
  WhatsappShareButton,
  TwitterShareButton,
  FacebookIcon,
  WhatsappIcon,
} from 'react-share';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FaXTwitter } from 'react-icons/fa6'; // X (Twitter rebrand icon)

import './NewsDetailPage.css';

const NewsDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentNews, loading, error, getNewsById } = useNews();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        await getNewsById(id);
      } catch (err) {
        console.error(err);
        if (err.message === 'News not found') {
          navigate('/');
        }
      }
    };

    fetchNews();
  }, [id, getNewsById, navigate]);

  if (loading) {
    return <div className="loading-indicator">Loading...</div>;
  }

  if (error) {
    return (
      <div className="error-message">
        <p>Error: {error}</p>
        <button onClick={() => getNewsById(id)} className="reload-btn">Try Again</button>
      </div>
    );
  }

  if (!currentNews) {
    return <div className="loading-indicator">Loading...</div>;
  }

  const shareUrl = window.location.href;

  return (
    <div className="news-detail-page">
      <NewsDetail news={currentNews} onRefresh={() => getNewsById(id)} />

      <div className="share-container">
        <h3 className="share-title">Bagikan Berita Ini</h3>
        <div className="share-buttons">
          <FacebookShareButton url={shareUrl} quote={currentNews.title}>
            <FacebookIcon size={40} round />
          </FacebookShareButton>

          <WhatsappShareButton url={shareUrl} title={currentNews.title}>
            <WhatsappIcon size={40} round />
          </WhatsappShareButton>

          <TwitterShareButton url={shareUrl} title={currentNews.title}>
            <div className="custom-x-icon" title="Bagikan ke X">
              <FaXTwitter size={24} />
            </div>
          </TwitterShareButton>

          <CopyToClipboard text={shareUrl} onCopy={() => setCopied(true)}>
            <button className="copy-link-btn">
              {copied ? '✅ Tautan Disalin' : '🔗 Salin Link'}
            </button>
          </CopyToClipboard>
        </div>
      </div>
    </div>
  );
};

export default NewsDetailPage;
