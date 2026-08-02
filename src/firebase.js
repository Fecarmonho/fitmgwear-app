import { initializeApp } from "firebase/app";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB2t0DPn-t_-bYuEJKd3X0h8j6v6bSTuAg",
  authDomain: "fitmgwear-app.firebaseapp.com",
  projectId: "fitmgwear-app",
  storageBucket: "fitmgwear-app.firebasestorage.app",
  messagingSenderId: "324978242715",
  appId: "1:324978242715:web:c0eae2c0ebd6ad8626c23e",
  measurementId: "G-NF8VNZ0GXD"
};

const app = initializeApp(firebaseConfig);
// Cache local (IndexedDB): nas próximas aberturas os dados vêm do próprio
// aparelho e só as mudanças são baixadas — abre mais rápido, gasta menos
// cota do Firebase e continua funcionando com internet ruim.
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});
const auth = getAuth(app);

export { db, auth };
