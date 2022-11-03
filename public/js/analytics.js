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

document.querySelector('input').value = new Date()
  .toISOString()
  .substring(0, 16);

const setInputs = (interval) => {
  const endpoint = document.querySelector('#endpoint');
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

const docSnaps = await getDocs(collection(db, 'devices'));

let data = [];

docSnaps.forEach((snap) => data.push(snap.data()));

console.log(data);

const device = data.at(Math.floor(Math.random() * data.length));

const actions = device?.actions;

const table = document.querySelector('.table');
const header = document.querySelector('.analytics-header');

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
  actions.forEach((action) => {
    const { start, typemap, tasklist, result, user } = action;
    const startDate = new Date(start.seconds * 1000);
    const day = startDate.toLocaleDateString();
    const time = startDate.toLocaleTimeString().substring(0, 5);
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
  });
} else {
  table.insertAdjacentHTML(
    'beforeend',
    '<div class="centered" style="margin-top: 3rem; font-size: 3rem">Работ в указанном промежутке на найдено.</div>'
  );
}
