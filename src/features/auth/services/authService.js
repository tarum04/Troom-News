import { auth } from '../../../firebase/firebaseConfig';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';

// 🔐 REGISTER
export const register = async (name, email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });

    return {
      id: userCredential.user.uid, // ✅ gunakan "id" agar konsisten
      email: userCredential.user.email,
      name: userCredential.user.displayName,
      profilePicture: userCredential.user.photoURL || null,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// 🔐 LOGIN
export const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    return {
      id: user.uid, // ✅ gunakan "id" bukan "uid" agar cocok dengan AuthContext
      email: user.email,
      name: user.displayName,
      profilePicture: user.photoURL || null,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// 🔓 LOGOUT
export const logout = async () => {
  await signOut(auth);
  return true;
};
