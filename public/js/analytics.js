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

// Set initial values of date inputs
const now = new Date();

document.querySelectorAll('input').forEach((input, idx) => {
  input.value = now.toISOString().substring(0, 16);
  if (idx !== 0)
    input.value = new Date(now.setDate(now.getDate() + 1))
      .toISOString()
      .substring(0, 16);
});

const docRef = doc(db, 'devices', '4');
const docSnap = await getDoc(docRef);

const data = docSnap.data();

const actions = data.actions;

const table = document.querySelector('.table');

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
