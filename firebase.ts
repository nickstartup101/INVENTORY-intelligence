import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// ຄ່າ default ແມ່ນຄ່າຈາກ firebase-applet-config ເດີມ.
// ແນະນຳໃຫ້ຍ້າຍໄປໃສ່ .env.local ຕາມ .env.local.example ເມື່ອຂຶ້ນ production.
const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'la-dolce-menu-1a3c8',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '1:936747598617:web:050be806ba29f54fdafb88',
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyD6vBXduQDmDreOGra1alNZF2jnoUIYqJM',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'la-dolce-menu-1a3c8.firebaseapp.com',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'la-dolce-menu-1a3c8.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '936747598617',
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
