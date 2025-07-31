import React, { useEffect, useState } from 'react';
import { db } from '../../firebase/firebaseConfig';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  deleteDoc,
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './AdminReportPage.css';

const REPORT_THRESHOLD = 3;

const AdminReportPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsMap, setNewsMap] = useState({});
  const [reportCountMap, setReportCountMap] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'news_reports'));
        const fetchedReports = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        const newsIds = [...new Set(fetchedReports.map(r => r.newsId))];

        const newsData = {};
        for (let id of newsIds) {
          const docRef = doc(db, 'news', id);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            newsData[id] = snap.data();
          }
        }

        // Hitung jumlah laporan per berita
        const countMap = {};
        fetchedReports.forEach(r => {
          countMap[r.newsId] = (countMap[r.newsId] || 0) + 1;
        });

        // Auto-takedown
        for (let newsId in countMap) {
          if (
            countMap[newsId] >= REPORT_THRESHOLD &&
            newsData[newsId] &&
            !newsData[newsId].isTakenDown
          ) {
            await updateDoc(doc(db, 'news', newsId), {
              isTakenDown: true,
            });
            newsData[newsId].isTakenDown = true;
          }
        }

        setNewsMap(newsData);
        setReportCountMap(countMap);
        setReports(fetchedReports);
        setLoading(false);
      } catch (err) {
        console.error('Gagal memuat laporan:', err);
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleDeleteReport = async (reportId, newsId) => {
    if (!window.confirm('Yakin ingin menghapus laporan ini?')) return;

    try {
      await deleteDoc(doc(db, 'news_reports', reportId));
      const updatedReports = reports.filter(r => r.id !== reportId);
      setReports(updatedReports);

      const remainingReports = updatedReports.filter(r => r.newsId === newsId);
      const newsRef = doc(db, 'news', newsId);

      if (remainingReports.length >= REPORT_THRESHOLD) {
        await updateDoc(newsRef, { isTakenDown: true });
      } else {
        await updateDoc(newsRef, { isTakenDown: false });
      }
    } catch (err) {
      console.error('Gagal menghapus laporan:', err);
    }
  };

  const handleViewNews = (newsId) => {
    navigate(`/news/${newsId}`); // Pastikan halaman ini ada
  };

  const formatDate = (timestamp) => {
    try {
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="admin-report-page">
      <div className="admin-report-header">
        <h2>📋 Laporan Berita Masuk</h2>
        <button className="btn-back" onClick={() => navigate(-1)}>
          ← Kembali
        </button>
      </div>

      {loading ? (
        <p>Memuat laporan...</p>
      ) : reports.length === 0 ? (
        <p>Tidak ada laporan masuk.</p>
      ) : (
        <div className="report-table-wrapper">
          <table className="report-table">
            <thead>
              <tr>
                <th>Judul Berita</th>
                <th>Jumlah Laporan</th>
                <th>Status</th>
                <th>Pelapor</th>
                <th>Kategori</th>
                <th>Alasan</th>
                <th>Tanggal</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => {
                const news = newsMap[report.newsId];
                const count = reportCountMap[report.newsId] || 0;
                return (
                  <tr key={report.id}>
                    <td>{news?.title || 'Judul tidak ditemukan'}</td>
                    <td style={{ textAlign: 'center' }}>{count}</td>
                    <td>
                      {news?.isTakenDown ? (
                        <span className="status taken-down">Taken Down</span>
                      ) : (
                        <span className="status active">Aktif</span>
                      )}
                    </td>
                    <td>{report.userId}</td>
                    <td>{report.category}</td>
                    <td>{report.reason}</td>
                    <td>{formatDate(report.createdAt)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-view"
                          onClick={() => handleViewNews(report.newsId)}
                        >
                          Lihat Berita
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() =>
                            handleDeleteReport(report.id, report.newsId)
                          }
                        >
                          Hapus Laporan
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminReportPage;
