import express from 'express';
import path from 'path';
import { config } from 'dotenv';

import { initializeApp } from 'firebase/app';

import {
  getFirestore,
  getDocs,
  collection,
  doc,
  setDoc,
} from 'firebase/firestore';

config();

const firebase_app = initializeApp(JSON.parse(process.env.FIREBASE_CONFIG));
const db = getFirestore(firebase_app);

const __dirname = path.resolve();

const app = express();
app.use(express.static('./public'));

app.get('/', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public/html', 'main.html'));
});

app.get('/:page', async (req, res) => {
  req.params === 'analytics'
    ? res.sendFile(path.resolve(__dirname, 'public/html', 'analytics.html'))
    : res.sendFile(path.resolve(__dirname, 'public/html', 'error.html'));
});

app.get('/api/:param', async (req, res) => {
  const getData = async () => {
    const data = [];
    const querySnapshot = await getDocs(collection(db, 'devices'));
    querySnapshot.forEach((doc) => {
      data.push(doc.data());
    });
    return data;
  };

  const { param } = req.params;

  if (param === 'main-db') {
    const data = await getData();
    res.send(data);
    return;
  }

  if (param.includes('active')) {
    const id = param.replace('active', '');
    const docRef = doc(db, 'devices', id);
    await setDoc(docRef, { notifications: 'active' }, { merge: true });
  }

  if (param.includes('disabled')) {
    const id = param.replace('disabled', '');
    const docRef = doc(db, 'devices', id);
    await setDoc(docRef, { notifications: 'disabled' }, { merge: true });
    return;
  }

  if (param.includes('unset')) {
    const id = param.replace('unset', '');
    const docRef = doc(db, 'devices', id);
    await setDoc(docRef, { notifications: 'unset' }, { merge: true });
    return;
  }

  if (param.includes('working')) {
    const docRef = doc(db, 'devices', param.replace('working', ''));
    await setDoc(docRef, { status: 'working' }, { merge: true });
  }

  if (param.includes('free')) {
    const docRef = doc(db, 'devices', param.replace('free', ''));
    await setDoc(docRef, { status: 'free' }, { merge: true });
  }
  return;
});

console.log(`Server is running on port: ${process.env.PORT}`);
app.listen(process.env.PORT);
