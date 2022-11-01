import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js';

import {
  getFirestore,
  getDocs,
  collection,
  doc,
  setDoc,
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
const searchBar = document.querySelector('#searchbar');
searchBar.value = '';

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
    (tmpl, { id, name, imgsrc, notifications, status }) =>
      tmpl +
      `<li class="devices-item row" id="${id}">
        <img src="../assets/images/${imgsrc}" alt="" class="item-img" />
        <p class="item-name">${name}</p>
        <select class="item-status" id="${id}">
          <option value="Свободен" ${
            status === 'free' ? 'selected' : ''
          }>Свободен</option>
          <option value="В работе" ${
            status === 'working' ? 'selected' : ''
          }>В работе</option>
        </select>
        <div class="svg-container centered">
          <img
            src="../assets/svg/notif_${notifications}.svg"
            alt=""
            class="notif-btn"
            id="${id}"
            type=${notifications}
          />
      </div>
    </li>`,
    ''
  );

const devicesList = document.querySelector('.devices');
devicesList.insertAdjacentHTML('beforeend', defaultTmpl);

document.querySelectorAll('.devices-item').forEach((item) => {
  const id = item.getAttribute('id');
  item.addEventListener('click', (e) => {
    e.stopImmediatePropagation();
    // openAnalytics(id);
  });
});

const handleSearch = async (e) => {
  data = await getData();
  const updateCart = (items) => {
    items.map((item) => {
      const { name, imgsrc, notifications, id } = item;
      const tmpl = `<li class="devices-item row" id="${id}">
                      <img src="../assets/images/${imgsrc}" alt="" class="item-img" />
                      <p class="item-name">${name}</p>
                      <select class="item-status" id=${id}>
                        <option value="Свободен">Свободен</option>
                        <option value="В работе">В работе</option>
                      </select>
                      <div class="svg-container centered">
                        <img
                          src="../assets/svg/notif_${notifications}.svg"
                          alt=""
                          class="notif-btn"
                          id="${id}"
                          type="${notifications}"
                        />
                      </div>
                    </li>`;
      devicesList.insertAdjacentHTML('beforeend', tmpl);
      addNotifHandlers();
    });
  };

  devicesList.innerHTML = '';
  let searchResults;
  const query = e.target.value;
  if (query === '') {
    devicesList.innerHTML = defaultTmpl;
    return;
  }
  if (parseInt(query)) {
    searchResults = data.filter(({ id }) => id === query);
    console.log(searchResults.length);
    searchResults.length
      ? updateCart(searchResults)
      : (devicesList.innerHTML =
          '<li class="devices-item row centered typo-1">Приборов не найдено</li>');

    return;
  }
  searchResults = data.filter(({ name }) =>
    name.toLowerCase().includes(query.toLowerCase())
  );
  searchResults.length
    ? updateCart(searchResults)
    : (devicesList.innerHTML =
        '<li class="devices-item row centered typo-1">Приборов не найдено</li>');
};

searchBar.addEventListener('input', (e) => handleSearch(e));

const addNotifHandlers = () => {
  document.querySelectorAll('.svg-container').forEach((container) => {
    container.addEventListener('click', async () => {
      const btn = container.childNodes[1];
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
};

addNotifHandlers();

document.querySelectorAll('.item-status').forEach((select) => {
  select.addEventListener('change', async (e) => {
    const docRef = doc(db, 'devices', e.target.id);
    if (e.target.value === 'В работе')
      await setDoc(docRef, { status: 'working' }, { merge: true });
    else await setDoc(docRef, { status: 'free' }, { merge: true });
  });
});

const openAnalytics = (id) => {
  const doc = data.filter((item) => item.id === id).at(0);
  const analyticsData = JSON.parse(doc.analytics);
  localStorage.setItem(id, JSON.stringify(analyticsData));
  window.open('/analytics', '_self');
};
