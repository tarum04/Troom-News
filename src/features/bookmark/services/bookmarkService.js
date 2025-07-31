import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const db = getFirestore();

// Ambil semua bookmark milik user dari Firestore
export const getBookmarks = async (userId) => {
  if (!userId) return [];

  const bookmarkRef = doc(db, 'bookmarks', userId);
  const docSnap = await getDoc(bookmarkRef);

  if (docSnap.exists()) {
    return docSnap.data().items || [];
  }

  return [];
};

// Tambahkan bookmark baru ke Firestore
export const addBookmark = async (userId, news) => {
  if (!userId || !news) return [];

  const bookmarkRef = doc(db, 'bookmarks', userId);
  const docSnap = await getDoc(bookmarkRef);

  let currentBookmarks = [];

  if (docSnap.exists()) {
    currentBookmarks = docSnap.data().items || [];

    const isAlreadyBookmarked = currentBookmarks.some(item => item.id === news.id);
    if (isAlreadyBookmarked) {
      throw new Error('News already bookmarked');
    }
  }

  const updatedBookmarks = [...currentBookmarks, news];
  await setDoc(bookmarkRef, { items: updatedBookmarks });

  return updatedBookmarks;
};

// Hapus bookmark berdasarkan ID
export const removeBookmark = async (userId, newsId) => {
  if (!userId || !newsId) return [];

  const bookmarkRef = doc(db, 'bookmarks', userId);
  const docSnap = await getDoc(bookmarkRef);

  if (!docSnap.exists()) return [];

  const currentBookmarks = docSnap.data().items || [];
  const updatedBookmarks = currentBookmarks.filter(item => item.id !== newsId);

  await setDoc(bookmarkRef, { items: updatedBookmarks });

  return updatedBookmarks;
};

// Cek apakah berita sudah di-bookmark
export const isBookmarked = async (userId, newsId) => {
  if (!userId || !newsId) return false;

  const bookmarks = await getBookmarks(userId);
  return bookmarks.some(item => item.id === newsId);
};
