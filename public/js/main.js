import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js';

import {
  getFirestore,
  getDocs,
  getDoc,
  collection,
  doc,
  setDoc,
  query,
  where,
} from 'https://www.gstatic.com/firebasejs/9.12.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: 'AIzaSyD8nIJYkgOw7gKvPNH2fOAdeTwBxKLF48w',
  authDomain: 'botanique-b5560.firebaseapp.com',
  projectId: 'botanique-b5560',
  storageBucket: 'botanique-b5560.appspot.com',
  messagingSenderId: '224487105371',
  appId: '1:224487105371:web:21d94dbe9bec79fcf5307e',
};

const firebase_app = initializeApp(firebaseConfig);
const db = getFirestore(firebase_app);

let data = [];

const getData = async () => {
  const data = [];
  const querySnapshot = await getDocs(collection(db, 'devices'));
  querySnapshot.forEach((doc) => {
    data.push(doc.data());
  });
  return data;
};

data = await getData();

const defaultTmpl =
  data.length > 0 &&
  data.reduce(
    (tmpl, { name, imgsrc, notifications, id }) =>
      tmpl +
      `<div class="cart-item cart-grid" id="${id}">
      <div class="cart-item__left-col">
        <img
          src="../assets/images/${imgsrc}"
          alt=""
          class="cart-item-image"
        />
        <p>
          ${name}
        </p>
      </div>
      <div class="cart-item__right-col">
        <select class="item-status-select">
          <option value="Свободен">Свободен</option>
          <option value="В работе">В работе</option>
        </select>
        <img
          src="../assets/svg/notif_${notifications}.svg"
          alt=""
          class="item-notif-btn"
          id="${id}"
          type="${notifications}"
        />
      </div>
    </div>`,
    ''
  );

const cart = document.querySelector('.cart-items');
cart.innerHTML = defaultTmpl;

document.querySelectorAll('.cart-item').forEach((item) => {
  const id = item.getAttribute('id');
  item.addEventListener('click', (e) => {
    e.stopImmediatePropagation();
    openAnalytics(id);
  });
});

const handleSearch = async (e) => {
  data = await getData();
  const updateCart = (items) => {
    items.map((item) => {
      const { name, imgsrc, notifications, id } = item;
      const tmpl = `<div class="cart-item cart-grid">
      <div class="cart-item__left-col">
        <img
          src="../assets/images/${imgsrc}"
          alt=""
          class="cart-item-image"
        />
        <p>
          ${name}
        </p>
      </div>
      <div class="cart-item__right-col">
        <select class="item-status-select">
          <option value="Свободен">Свободен</option>
          <option value="В работе">В работе</option>
        </select>
        <img
          src="../assets/svg/notif_${notifications}.svg"
          alt=""
          class="item-notif-btn"
          id="${id}"
          type="${notifications}"
        />
      </div>
    </div>`;
      cart.insertAdjacentHTML('beforeend', tmpl);
    });
  };
  cart.innerHTML = '';
  let searchResults;
  const query = e.target.value;
  if (query === '') {
    cart.innerHTML = defaultTmpl;
    return;
  }
  if (parseInt(query)) {
    searchResults = data.filter(({ id }) => id === query);
    updateCart(searchResults);
    return;
  }
  searchResults = data.filter(({ name }) =>
    name.toLowerCase().includes(query.toLowerCase())
  );
  updateCart(searchResults);
};

document
  .querySelector('#searchbar')
  .addEventListener('input', (e) => handleSearch(e));

document.querySelectorAll('.item-notif-btn').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const id = btn.getAttribute('id');
    const type = btn.getAttribute('type');
    const docRef = doc(db, 'devices', id);
    if (type === 'unset') {
      btn.setAttribute('type', 'active');
      btn.setAttribute('src', '../assets/svg/notif_active.svg');
      await setDoc(docRef, { notifications: 'active' }, { merge: true });
    } else if (type === 'active') {
      btn.setAttribute('type', 'disabled');
      btn.setAttribute('src', '../assets/svg/notif_disabled.svg');
      await setDoc(docRef, { notifications: 'disabled' }, { merge: true });
    } else {
      btn.setAttribute('type', 'unset');
      btn.setAttribute('src', '../assets/svg/notif_unset.svg');
      await setDoc(docRef, { notifications: 'unset' }, { merge: true });
    }
  });
});

const openAnalytics = (id) => {
  const doc = data.filter((item) => item.id === id).at(0);
  const analyticsData = JSON.parse(doc.analytics);
  localStorage.setItem(id, JSON.stringify(analyticsData));
  window.open('/analytics', '_self');
};
