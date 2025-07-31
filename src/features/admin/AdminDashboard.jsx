import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { db } from "../../firebase/firebaseConfig";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";

const AdminDashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [newsList, setNewsList] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      const querySnapshot = await getDocs(collection(db, "news")); // ganti 'news' sesuai koleksi kamu
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNewsList(data);
    };
    fetchNews();
  }, []);

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "news", id));
    setNewsList(newsList.filter(news => news.id !== id));
  };

  if (!currentUser || currentUser.role !== "admin") {
    return <p>Anda tidak memiliki akses</p>;
  }

  return (
    <div>
      <h2>Panel Admin</h2>
      {newsList.map((item) => (
        <div key={item.id}>
          <h3>{item.title}</h3>
          <button onClick={() => handleDelete(item.id)}>Hapus</button>
        </div>
      ))}
    </div>
  );
};

export default AdminDashboard;
