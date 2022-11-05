const endpoint = document.querySelector('#endpoint');
const startpoint = document.querySelector('input');

const getData = async () => {
  const res = await fetch('/api/main-db');
  return await res.json();
};

let data = await getData();
let device;
const fromMainId = sessionStorage.getItem('id');
sessionStorage.getItem('fromMain')
  ? (device = data.filter(({ id }) => id === fromMainId).at(0))
  : (device = data.at(Math.floor(Math.random() * data.length)));

const table = document.querySelector('.table');
const header = document.querySelector('.analytics-header');
const deviceSelect = document.querySelector('.select--save');
const notFoundDiv = document.querySelector('.not-found');
const intervals = document.querySelectorAll('.interval');

startpoint.value = new Date().toISOString().substring(0, 16);

const setInputs = (interval) => {
  const init = new Date(startpoint.value);

  if (interval === 'Неделя') {
    endpoint.value = new Date(init.setDate(init.getDate() + 7))
      .toISOString()
      .substring(0, 16);
    return;
  }

  if (interval === '2 Недели') {
    endpoint.value = new Date(init.setDate(init.getDate() + 14))
      .toISOString()
      .substring(0, 16);
    return;
  }

  if (interval === 'Месяц') {
    endpoint.value = new Date(init.setMonth(init.getMonth() + 1))
      .toISOString()
      .substring(0, 16);
    return;
  }

  if (interval === '3 месяца') {
    endpoint.value = new Date(init.setMonth(init.getMonth() + 3))
      .toISOString()
      .substring(0, 16);
    return;
  }

  if (interval === 'Полгода') {
    endpoint.value = new Date(init.setMonth(init.getMonth() + 6))
      .toISOString()
      .substring(0, 16);
    return;
  }

  endpoint.value = new Date(init.setDate(init.getDate() + 1))
    .toISOString()
    .substring(0, 16);
};

// Handle a click on the intervals
intervals.forEach((interval) => {
  interval.addEventListener('click', (e) => {
    intervals.forEach((interval) =>
      interval.classList.remove('interval--active')
    );
    e.target.classList.add('interval--active');
    setInputs(e.target.innerText);
    renderActionList(device.actions);
  });
});

deviceSelect.insertAdjacentHTML(
  'beforeend',
  data.map(({ name, id }) => `<option data-id="${id}">${name}</option>`)
);

// INITIAL RENDERING
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

// CHANGE DEVICE AND RE-RENDER
deviceSelect.addEventListener('change', (e) => {
  if (e.target.value !== 'Работа прибора') {
    device = data.filter(({ name }) => e.target.value === name).at(0);
    renderPage(device);
  }
});

// RE-RENDER LIST
function renderActionList(actions) {
  table.querySelectorAll('.row-ext').forEach((row) => table.removeChild(row));
  const startDate = new Date(startpoint.value);
  const endDate = new Date(endpoint.value);

  const filteredActions = actions.filter(
    ({ start }) =>
      start.seconds * 1000 >= startDate.getTime() &&
      start.seconds * 1000 <= endDate.getTime()
  );

  if (filteredActions.length === 0) {
    notFoundDiv.innerText = 'Работ в указанном промежутке на найдено.';
    return;
  }

  filteredActions.forEach((action) => {
    const { start, worktype, finished, tasklist, result, user } = action;
    const renderDate = new Date(start.seconds * 1000);
    const day = renderDate.toLocaleDateString();
    const time = renderDate.toLocaleTimeString().substring(0, 5);
    const longComment = result.length > 39;
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
                    <p>${finished ? '' : 'В работе'}</p>
                    ${worktype}
                  </div>
                  <div class="table-cell">
                    <ul>
                      ${taskString}
                    </ul>
                    </div>
                  <div class="table-cell">
                    <div class="res-inner">
                      <p class="comment">${
                        longComment
                          ? result.substring(0, 40) + '<br>...'
                          : result
                      }<p>
                      <img src="../assets/svg/check.svg" alt="" class="res-check" />
                    </div>
                  </div>
                  <div class="table-cell">${user}</div>
                </div>`;
    table.insertAdjacentHTML('beforeend', tmpl);
    notFoundDiv.innerText = '';
  });
}

document.querySelectorAll('input').forEach((input) => {
  input.addEventListener('change', () => {
    renderActionList(device.actions);
  });
});

// SAVING REPORT
document.querySelector('.save-btn').addEventListener('click', () => {
  console.log('here');
  const element = document.querySelector('.analytics');
  html2pdf(element);
});

// CHANGE STATUS
const setStatus = async (state, id) => await fetch(`/api/${state}${id}`);
document
  .querySelector('.item-status--analytics')
  .addEventListener('change', async (e) => {
    if (e.target.value === 'В работе') await setStatus('working', device.id);
    else await setStatus('free', device.id);
  });
