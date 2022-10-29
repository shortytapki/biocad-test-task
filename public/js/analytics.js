let results;

for (const key in localStorage) {
  if (localStorage.hasOwnProperty(key)) {
    results = JSON.parse(localStorage.getItem(key));
  }
}

console.log(results);

const tmpl = results.reduce((tmpl, item) => {
  console.log(item);
  tmpl +
    `<div class="table-item table-grid">
          <p class="table-item__start cell">09.10.2021, 15:46</p>
            <div class="type cell">
              <p class="type__green">В работе</p>
              <p class="type__bold">Измерение</p>
            </div>
          <p class="cell">
            <span class="work__bold">Образец/серия:</span>
            000100057935_170000010325_0000251849
          </p>
          <div class="results cell">
            <div class="inner">
              <img src="../assets/svg/check.svg" alt="" />
            </div>
          </div>
          <p class="user cell">morozovava</p>
        </div>`;
}, '');
