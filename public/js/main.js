/* INITIAL RENDERING */
const searchBar = document.querySelector('#searchbar');
searchBar.value = '';

const getData = async () => {
  const res = await fetch('/api/main-db');
  return await res.json();
};

let data = await getData();

const generateDefaultTmpl = (data) => {
  const defaultTmpl =
    data.length > 0 &&
    data.reduce(
      (tmpl, { id, name, imgsrc, notifications, status }) =>
        tmpl +
        `<li class="devices-item row" id="${id}">
          <img src="../assets/images/${imgsrc}" alt="" class="item-img" />
          <p class="item-name" id="${id}">${name}</p>
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
  return defaultTmpl;
};
const devicesList = document.querySelector('.devices');
devicesList.insertAdjacentHTML('beforeend', generateDefaultTmpl(data));

const setNotif = async (type, id) => await fetch(`/api/${type}${id}`);
const addNotifHandlers = () => {
  document.querySelectorAll('.svg-container').forEach((container) => {
    container.addEventListener('click', async () => {
      const btn = container.childNodes[1];
      const id = btn.getAttribute('id');
      const type = btn.getAttribute('type');
      if (type === 'unset') {
        btn.setAttribute('type', 'active');
        btn.setAttribute('src', '../assets/svg/notif_active.svg');
        await setNotif('active', id);
      } else if (type === 'active') {
        btn.setAttribute('type', 'disabled');
        btn.setAttribute('src', '../assets/svg/notif_disabled.svg');
        await setNotif('disabled', id);
      } else {
        btn.setAttribute('type', 'unset');
        btn.setAttribute('src', '../assets/svg/notif_unset.svg');
        await setNotif('unset', id);
      }
    });
  });
};

const addOpenAnalytics = () => {
  const openAnalytics = (id) => {
    sessionStorage.setItem('fromMain', true);
    sessionStorage.setItem('id', id);
    window.open('/analytics', '_self');
  };
  document.querySelectorAll('.item-name').forEach((item) => {
    const id = item.getAttribute('id');
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      openAnalytics(id);
    });
  });
};

addNotifHandlers();
addOpenAnalytics();

/* RENDERING THE SEARCH RESULTS */
const handleSearch = async (e) => {
  data = await getData();
  const updateCart = (items) => {
    items.map((item) => {
      const { name, imgsrc, notifications, id } = item;
      const tmpl = `<li class="devices-item row" id="${id}">
                      <img src="../assets/images/${imgsrc}" alt="" class="item-img" />
                      <p class="item-name" id=${id}>${name}</p>
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
      addOpenAnalytics();
    });
  };

  devicesList.innerHTML = '';
  let searchResults;
  const query = e.target.value;

  if (query === '') {
    data = await getData();
    devicesList.innerHTML = generateDefaultTmpl(data);
    addNotifHandlers();
    addOpenAnalytics();
    return;
  }

  if (parseInt(query)) {
    searchResults = data.filter(({ id }) => id === query);
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

/* CHANGING THE STATUS OF DEVICES */
const setStatus = async (state, id) => await fetch(`/api/${state}${id}`);
document.querySelectorAll('.item-status').forEach((select) => {
  select.addEventListener('change', async (e) => {
    e.stopImmediatePropagation();
    if (e.target.value === 'В работе') await setStatus('working', e.target.id);
    else await setStatus('free', e.target.id);
  });
});
