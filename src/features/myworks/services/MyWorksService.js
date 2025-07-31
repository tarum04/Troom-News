// src/myworks/services/MyWorksService.js
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  deleteDoc,
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../../firebase/firebaseConfig';

// Collection name di Firebase
const NEWS_COLLECTION = 'news';

// Get semua news yang dibuat oleh user tertentu
export const getUserNews = async (userId) => {
  try {
    console.log('DEBUG: getUserNews called with userId:', userId);
    
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Pertama, coba ambil semua news untuk debug
    console.log('DEBUG: Fetching all news first...');
    const allNewsQuery = query(collection(db, NEWS_COLLECTION));
    const allSnapshot = await getDocs(allNewsQuery);
    
    console.log('DEBUG: Total news in database:', allSnapshot.size);
    allSnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('DEBUG: News doc:', {
        id: doc.id,
        authorId: data.authorId,
        'author.id': data.author?.id,
        title: data.title
      });
    });

    // Sekarang coba query dengan authorId
    console.log('DEBUG: Querying with authorId:', userId);
    let newsQuery;
    
    try {
      // Coba dengan authorId field
      newsQuery = query(
        collection(db, NEWS_COLLECTION),
        where('authorId', '==', userId)
      );
      
      let querySnapshot = await getDocs(newsQuery);
      console.log('DEBUG: Found with authorId:', querySnapshot.size);
      
      // Jika tidak ada hasil, coba dengan author.id
      if (querySnapshot.size === 0) {
        console.log('DEBUG: Trying with author.id field...');
        newsQuery = query(
          collection(db, NEWS_COLLECTION),
          where('author.id', '==', userId)
        );
        querySnapshot = await getDocs(newsQuery);
        console.log('DEBUG: Found with author.id:', querySnapshot.size);
      }
      
      const userNews = [];
      querySnapshot.forEach((doc) => {
        const newsData = {
          id: doc.id,
          ...doc.data()
        };
        console.log('DEBUG: Adding news:', newsData.title);
        userNews.push(newsData);
      });

      console.log('DEBUG: Final userNews array:', userNews.length, 'items');
      return userNews;
      
    } catch (queryError) {
      console.log('DEBUG: Query failed, trying without orderBy...');
      // Jika query gagal (mungkin karena index), coba tanpa orderBy
      newsQuery = query(
        collection(db, NEWS_COLLECTION),
        where('authorId', '==', userId)
      );
      
      const querySnapshot = await getDocs(newsQuery);
      const userNews = [];
      querySnapshot.forEach((doc) => {
        userNews.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return userNews;
    }

  } catch (error) {
    console.error('Error fetching user news:', error);
    throw new Error(`Failed to fetch user news: ${error.message}`);
  }
};

// Delete news milik user (dengan verifikasi)
export const deleteUserNews = async (userId, newsId) => {
  try {
    if (!userId || !newsId) {
      throw new Error('User ID and News ID are required');
    }

    // Reference ke document news
    const newsRef = doc(db, NEWS_COLLECTION, newsId);
    
    // Hapus document
    await deleteDoc(newsRef);
    
    return { success: true, message: 'News deleted successfully' };
  } catch (error) {
    console.error('Error deleting user news:', error);
    throw new Error(`Failed to delete news: ${error.message}`);
  }
};

// Update news milik user
export const updateUserNews = async (userId, newsId, updateData) => {
  try {
    if (!userId || !newsId) {
      throw new Error('User ID and News ID are required');
    }

    // Reference ke document news
    const newsRef = doc(db, NEWS_COLLECTION, newsId);
    
    // Data yang akan diupdate dengan timestamp
    const dataToUpdate = {
      ...updateData,
      updatedAt: serverTimestamp()
    };

    // Update document
    await updateDoc(newsRef, dataToUpdate);
    
    return { success: true, message: 'News updated successfully' };
  } catch (error) {
    console.error('Error updating user news:', error);
    throw new Error(`Failed to update news: ${error.message}`);
  }
};

// Get statistics untuk user's news
export const getUserNewsStats = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const userNews = await getUserNews(userId);
    
    return {
      totalNews: userNews.length,
      publishedNews: userNews.filter(news => news.status === 'published').length,
      draftNews: userNews.filter(news => news.status === 'draft').length,
      totalViews: userNews.reduce((total, news) => total + (news.views || 0), 0)
    };
  } catch (error) {
    console.error('Error fetching user news stats:', error);
    throw new Error(`Failed to fetch news statistics: ${error.message}`);
  }
};