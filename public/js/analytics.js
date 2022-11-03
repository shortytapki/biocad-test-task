import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.12.1/firebase-app.js';

import {
  getFirestore,
  getDocs,
  getDoc,
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
const endpoint = document.querySelector('#endpoint');
const startpoint = document.querySelector('input');
const docSnaps = await getDocs(collection(db, 'devices'));
let data = [];
docSnaps.forEach((snap) => data.push(snap.data()));
let device = data.at(Math.floor(Math.random() * data.length));

const table = document.querySelector('.table');
const header = document.querySelector('.analytics-header');
const deviceSelect = document.querySelector('.select--save');
const notFoundDiv = document.querySelector('.not-found');

startpoint.value = new Date().toISOString().substring(0, 16);

const setInputs = (interval) => {
  const now = new Date();

  if (interval === 'Неделя') {
    endpoint.value = new Date(now.setDate(now.getDate() + 7))
      .toISOString()
      .substring(0, 16);
    return;
  }

  if (interval === '2 Недели') {
    endpoint.value = new Date(now.setDate(now.getDate() + 14))
      .toISOString()
      .substring(0, 16);
    return;
  }

  if (interval === 'Месяц') {
    endpoint.value = new Date(now.setMonth(now.getMonth() + 1))
      .toISOString()
      .substring(0, 16);
    return;
  }

  if (interval === '3 месяца') {
    endpoint.value = new Date(now.setMonth(now.getMonth() + 3))
      .toISOString()
      .substring(0, 16);
    return;
  }

  if (interval === 'Полгода') {
    endpoint.value = new Date(now.setMonth(now.getMonth() + 6))
      .toISOString()
      .substring(0, 16);
    return;
  }

  endpoint.value = new Date(now.setDate(now.getDate() + 1))
    .toISOString()
    .substring(0, 16);
};

// Handle a click on the intervals
const intervals = document.querySelectorAll('.interval');
intervals.forEach((interval) => {
  interval.addEventListener('click', (e) => {
    intervals.forEach((interval) =>
      interval.classList.remove('interval--active')
    );
    e.target.classList.add('interval--active');
    setInputs(e.target.innerText);
  });
});

deviceSelect.insertAdjacentHTML(
  'beforeend',
  data.map(({ name, id }) => `<option data-id="${id}">${name}</option>`)
);

deviceSelect.addEventListener('change', (e) => {
  if (e.target.value !== 'Работа прибора') {
    device = data.filter(({ name }) => e.target.value === name).at(0);
    renderPage(device);
  }
});

document.querySelectorAll('input').forEach((input) => {
  input.addEventListener('change', () => {
    renderActionList(device.actions);
  });
});

const renderActionList = (actions) => {
  table.querySelectorAll('.row-ext').forEach((row) => table.removeChild(row));
  const startDate = new Date(startpoint.value);
  const endDate = new Date(endpoint.value);

  const filteredActions = actions.filter(({ start }) => {
    console.log(start.seconds * 1000);
    console.log(startDate.getTime());
    return (
      start.seconds * 1000 >= startDate.getTime() &&
      start.seconds * 1000 <= endDate.getTime()
    );
  });

  if (filteredActions.length === 0) {
    notFoundDiv.innerText = 'Работ в указанном промежутке на найдено.';
    return;
  }

  filteredActions.forEach((action) => {
    const { start, typemap, tasklist, result, user } = action;
    const renderDate = new Date(start.seconds * 1000);
    const day = renderDate.toLocaleDateString();
    const time = renderDate.toLocaleTimeString().substring(0, 5);
    const taskString = tasklist.reduce(
      (str, task) =>
        (str += `<li><strong>${task.split(':').at(0)}: </strong>${task
          .split(':')
          .at(1)}</li>`),
      ''
    );

    const tmpl = `<div class="table-row row-ext">
                  <div class="table-cell">${day} ${time}</div>
                  <div class="table-cell">
                    <p>${typemap.working ? 'В работе' : 'Свободен'}</p>
                    ${typemap.worktype}
                  </div>
                  <div class="table-cell">
                    <ul>
                      ${taskString}
                    </ul>
                    </div>
                  <div class="table-cell">
                    <div class="res-inner">
                      ${result}
                      <img src="../assets/svg/check.svg" alt="" class="res-check" />
                    </div>
                  </div>
                  <div class="table-cell">${user}</div>
                </div>`;
    table.insertAdjacentHTML('beforeend', tmpl);
    notFoundDiv.innerText = '';
  });
};

const renderPage = (device) => {
  const actions = device?.actions;
  const { name, imgsrc, status } = device;
  header.innerHTML = `<div class="header-img-container">
                      <img src="../assets/images/${imgsrc}" alt="" class="header-img" />
                    </div>
                    <div class="heading">
                      <h1>${name}</h1>
                      <span class="state">S1.4.I14-9.001</span>
                      <span class="state dot">&middot;</span>
                      <span class="state">00-024004</span>
                    </div>
                    <div class="settings-container">
                    <ul class="settings">
                      <li class="settings-cell">
                        <select class="item-status item-status--analytics">
                        <option value="Свободен" ${
                          status === 'free' ? 'selected' : ''
                        }>Свободен</option>
                        <option value="В работе" ${
                          status === 'working' ? 'selected' : ''
                        }>В работе</option>
                        </select>
                      </li>
                      <li class="settings-cell">
                        <img src="../assets/svg/favorite.svg" alt="" />
                      </li>
                      <li class="settings-cell">
                        <img src="../assets/svg/settings.svg" alt="" />
                      </li>
                    </ul>
                  </div>`;

  if (actions) {
    renderActionList(actions);
  } else {
    notFoundDiv.innerText = 'Работ в указанном промежутке на найдено.';
  }
};

setInputs();
renderPage(device);
