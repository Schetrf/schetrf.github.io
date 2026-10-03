/* Счёт РФ — DEMO personal cabinet (clickable prototype, no backend).
 * Everything here is invented mock data kept in localStorage of this browser. */
(function () {
  'use strict';

  var KEYS = {
    session: 'schetrf-demo-session',
    topups: 'schetrf-demo-topups',     // user top-ups added via the modal
    regExpired: 'schetrf-demo-reg-expired',
    flight: 'schetrf-demo-flight'
  };

  /* ---------- Invented persona (NOT a real person) ---------- */
  var PERSON = {
    surnameRu: 'Каримов', nameRu: 'Азизбек', patronymicRu: 'Рустамович',
    surnameLat: 'KARIMOV', nameLat: 'AZIZBEK', patronymicLat: 'RUSTAMOVICH',
    dob: '14.03.1994', birthPlace: 'Самарканд / SAMARKAND', sex: 'М / M',
    citizenship: 'Узбекистан', citizenshipLat: 'UZBEKISTAN',
    phone: '+7 999 123-45-67',
    docNo: 'DEMO 000000', issued: '20.05.2021', expires: '19.05.2031'
  };

  var REG_PERIOD_DAYS = 90;      // demo registration period length
  var REG_DAYS_LEFT_DEFAULT = 25; // end date = today + 25 days (computed live)
  var OPENING_BALANCE = 3500;

  /* Base statement: offsets in days before today, so dates stay fresh. */
  var BASE_TX = [
    { d: 41, t: '10:12', desc: 'Пополнение наличными через терминал', credit: 25000 },
    { d: 40, t: '12:40', desc: 'Оплата патента (НДФЛ, фиксированный авансовый платёж)', debit: 9300 },
    { d: 40, t: '12:40', desc: 'Комиссия за платёж', debit: 50 },
    { d: 35, t: '09:05', desc: 'Зачисление заработной платы', credit: 62000 },
    { d: 34, t: '19:22', desc: 'Перевод домой (Узбекистан, по номеру карты)', debit: 30000 },
    { d: 34, t: '19:22', desc: 'Комиссия за перевод', debit: 300 },
    { d: 30, t: '08:47', desc: 'Оплата мобильной связи', debit: 600 },
    { d: 25, t: '18:31', desc: 'Оплата покупки: продукты', debit: 2450 },
    { d: 20, t: '14:03', desc: 'Пополнение через СБП', credit: 5000 },
    { d: 15, t: '11:16', desc: 'Оплата полиса ДМС для патента', debit: 4800 },
    { d: 10, t: '20:55', desc: 'Перевод домой (Узбекистан, по номеру карты)', debit: 15000 },
    { d: 10, t: '20:55', desc: 'Комиссия за перевод', debit: 150 },
    { d: 5, t: '09:02', desc: 'Зачисление заработной платы', credit: 31000 },
    { d: 2, t: '07:58', desc: 'Пополнение карты «Тройка»', debit: 1000 }
  ];

  /* ---------- OFFICES: verified via official sources (see README) ---------- */
  var OFFICES = [
    {
      name: 'ГБУ «Миграционный центр» (ММЦ «Сахарово»)',
      what: 'Карта иностранного гражданина, патенты, медосвидетельствование, консультации по учёту через «Амину».',
      address: 'г. Москва, вн. тер. г. муниципальный округ Вороново, Варшавское ш., 64-й км, д. 1, стр. 47',
      hours: 'Ежедневно 08:00–20:00 (по данным mos.ru; график отдельных услуг может отличаться)',
      phones: [{ label: 'Горячая линия', value: '+7 (499) 530-56-88' }],
      sources: [
        { title: 'mos.ru — адрес ММЦ', url: 'https://www.mos.ru/news/item/111655073/' },
        { title: 'mos.ru — часы работы', url: 'https://www.mos.ru/news/item/7185073/' },
        { title: 'Памятка «Амина», 2026 (адрес, горячая линия)', url: 'https://dgp110.mos.ru/images/news/2026/september/%D0%BB%D0%B8%D1%81%D1%82_%D0%B0%D0%BC%D0%B8%D0%BD%D0%B02_2026_%D1%80%D1%83%D1%81.pdf' },
        { title: 'Официальный сайт центра', url: 'https://mc.mos.ru/' }
      ]
    },
    {
      name: 'Представительство ГБУ «Миграционный центр»',
      what: 'Выдача карты иностранного гражданина — только для студентов и лиц старше 65 лет.',
      address: 'г. Москва, 1-й Красногвардейский пр-д, д. 21, стр. 1',
      hours: null,
      phones: [{ label: 'Горячая линия центра', value: '+7 (499) 530-56-88' }],
      note: 'Часы работы официальным источником не подтверждены — уточните на mc.mos.ru.',
      sources: [
        { title: 'Памятка «Амина», 2026 (mos.ru, PDF)', url: 'https://dgp110.mos.ru/images/news/2026/september/%D0%BB%D0%B8%D1%81%D1%82_%D0%B0%D0%BC%D0%B8%D0%BD%D0%B02_2026_%D1%80%D1%83%D1%81.pdf' }
      ]
    },
    {
      name: 'Центры госуслуг «Мои документы» (МФЦ Москвы)',
      what: 'Городские центры госуслуг. Возможность подать уведомление о прибытии для вашей категории уточняйте заранее (для граждан Узбекистана 18+ учёт в Москве — через «Амину»).',
      address: 'Любой центр — адреса в разделе «Центры госуслуг» на mos.ru',
      hours: 'Ежедневно: районные центры 08:00–20:00, флагманские офисы 10:00–22:00',
      phones: [],
      note: 'Телефон не указан: не удалось подтвердить официальным источником.',
      sources: [
        { title: 'mos.ru — режим работы центров', url: 'https://www.mos.ru/news/item/163594073/' }
      ]
    },
    {
      name: 'Управление по вопросам миграции ГУ МВД России по г. Москве',
      what: 'Территориальный орган МВД: приём уведомлений, продление срока пребывания.',
      address: 'г. Москва, ул. Большая Ордынка, д. 16/4, стр. 4',
      hours: null,
      phones: [],
      note: 'Официальный сайт (77.мвд.рф) не удалось открыть для проверки: адрес приведён по открытым справочникам, телефон и часы не указаны. Обязательно уточните на сайте ведомства.',
      sources: [
        { title: '77.мвд.рф — Управление по вопросам миграции', url: 'https://77.xn--b1aew.xn--p1ai/ms/Kontaktnaja_informacija_Upravlenija' }
      ]
    }
  ];

  /* ---------- helpers ---------- */
  function $(id) { return document.getElementById(id); }
  function load(key, fallback) {
    try { var v = localStorage.getItem(key); return v === null ? fallback : JSON.parse(v); } catch (e) { return fallback; }
  }
  function save(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* ignore */ } }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function fmtDate(d) { return pad(d.getDate()) + '.' + pad(d.getMonth() + 1) + '.' + d.getFullYear(); }
  function fmtTime(d) { return pad(d.getHours()) + ':' + pad(d.getMinutes()); }
  function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function dayDiff(a, b) { return Math.round((startOfDay(a) - startOfDay(b)) / 86400000); }
  var moneyFmt = new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  function money(n) { return moneyFmt.format(n) + '\u00a0₽'; }
  function plural(n, one, few, many) {
    var a = Math.abs(n) % 100, b = a % 10;
    if (a > 10 && a < 20) return many;
    if (b > 1 && b < 5) return few;
    if (b === 1) return one;
    return many;
  }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; }

  var session = load(KEYS.session, null);
  if (!session) { location.replace('index.html#login'); return; }

  /* ---------- transactions ---------- */
  function allTx() {
    var today = startOfDay(new Date());
    var list = BASE_TX.map(function (t) {
      var hm = t.t.split(':');
      var d = addDays(today, -t.d); d.setHours(+hm[0], +hm[1]);
      return { date: d, desc: t.desc, debit: t.debit || 0, credit: t.credit || 0 };
    });
    load(KEYS.topups, []).forEach(function (t) {
      list.push({ date: new Date(t.at), desc: t.desc, debit: 0, credit: +t.amount });
    });
    list.sort(function (a, b) { return a.date - b.date; });
    var bal = OPENING_BALANCE;
    list.forEach(function (t) { bal = Math.round((bal - t.debit + t.credit) * 100) / 100; t.balance = bal; });
    return list;
  }
  function currentBalance() { var l = allTx(); return l.length ? l[l.length - 1].balance : OPENING_BALANCE; }

  /* ---------- render: profile ---------- */
  function renderProfile() {
    $('p-name').textContent = PERSON.surnameRu + ' ' + PERSON.nameRu + ' ' + PERSON.patronymicRu;
    $('p-dob').textContent = PERSON.dob;
    $('p-cit').textContent = PERSON.citizenship;
    $('p-phone').textContent = PERSON.phone;
    $('p-session-phone').textContent = session.phone || '—';
  }

  /* ---------- render: registration ---------- */
  function renderReg() {
    var expired = !!load(KEYS.regExpired, false);
    var today = startOfDay(new Date());
    var end = addDays(today, expired ? -3 : REG_DAYS_LEFT_DEFAULT);
    var left = dayDiff(end, today);
    var card = $('reg-card');
    var state = left < 0 ? 'expired' : left <= 7 ? 'red' : left <= 30 ? 'amber' : 'green';
    card.dataset.state = state;

    $('reg-end').textContent = fmtDate(end);
    var pct = Math.max(0, Math.min(100, Math.round(left / REG_PERIOD_DAYS * 100)));
    $('reg-bar').style.width = pct + '%';
    $('reg-progress').setAttribute('aria-valuenow', String(pct));
    $('reg-progress').setAttribute('aria-valuetext', left >= 0 ? ('Осталось ' + left + ' ' + plural(left, 'день', 'дня', 'дней')) : 'Истекла');

    var pill = $('reg-pill');
    if (state === 'expired') {
      $('reg-days-label').textContent = 'Просрочено';
      $('reg-days').textContent = Math.abs(left) + ' ' + plural(left, 'день', 'дня', 'дней');
      pill.textContent = 'Истекла';
      $('reg-hint').textContent = 'Регистрация истекла ' + fmtDate(end) + '. Заполните форму ниже.';
    } else {
      $('reg-days-label').textContent = 'Осталось';
      $('reg-days').textContent = left + ' ' + plural(left, 'день', 'дня', 'дней');
      pill.textContent = state === 'green' ? 'Действует' : state === 'amber' ? 'Скоро истекает' : 'Истекает!';
      $('reg-hint').textContent = state === 'green' ? 'Всё в порядке.' :
        state === 'amber' ? 'Осталось 30 дней или меньше — заранее позаботьтесь о продлении.' :
        'Осталось 7 дней или меньше — продлите учёт как можно скорее.';
    }
    $('reg-expired').hidden = state !== 'expired';
    $('reg-toggle').textContent = expired ? 'Демо: вернуть действующую регистрацию' : 'Демо: регистрация истекла';
    renderFlight();
  }

  function renderFlight() {
    var f = load(KEYS.flight, null);
    var form = $('flight-form'), ok = $('flight-ok');
    if (f) {
      form.hidden = true; ok.hidden = false;
      $('flight-ok-no').textContent = f.flight;
      $('flight-ok-ticket').textContent = f.ticket;
      var at = new Date(f.at);
      $('flight-ok-at').textContent = fmtDate(at) + ' в ' + fmtTime(at);
    } else {
      form.hidden = false; ok.hidden = true;
    }
  }

  function initFlightForm() {
    var form = $('flight-form');
    var fNo = $('flight-no'), tNo = $('ticket-no');
    function setErr(input, errId, msg) {
      $(errId).textContent = msg || '';
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    }
    fNo.addEventListener('input', function () { fNo.value = fNo.value.toUpperCase(); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var flight = fNo.value.trim().toUpperCase().replace(/\s+/g, ' ');
      var ticketDigits = tNo.value.replace(/[\s-]/g, '');
      var ok = true;
      // Loose format: 2–3 letter/digit airline code + 1–4 digits (+ optional letter): HY 602, SU1850, U6-2954
      if (!flight) { setErr(fNo, 'flight-no-err', 'Укажите номер рейса.'); ok = false; }
      else if (!/^[A-ZА-Я0-9]{2,3}[ -]?\d{1,4}[A-ZА-Я]?$/.test(flight) || !/[A-ZА-Я]/.test(flight.slice(0, 3))) { setErr(fNo, 'flight-no-err', 'Формат: код авиакомпании и номер, например HY 602 или SU1850.'); ok = false; }
      else setErr(fNo, 'flight-no-err', '');
      // Loose format: e-ticket number, 10–14 digits (spaces/dashes allowed)
      if (!ticketDigits) { setErr(tNo, 'ticket-no-err', 'Укажите номер билета.'); ok = false; }
      else if (!/^\d{10,14}$/.test(ticketDigits)) { setErr(tNo, 'ticket-no-err', 'Номер билета — 10–14 цифр (обычно 13), пробелы и дефисы допустимы.'); ok = false; }
      else setErr(tNo, 'ticket-no-err', '');
      if (!ok) { (fNo.getAttribute('aria-invalid') === 'true' ? fNo : tNo).focus(); return; }
      save(KEYS.flight, { flight: flight, ticket: ticketDigits, at: new Date().toISOString() });
      renderFlight();
      $('flight-ok').focus();
      toast('Данные билета сохранены');
    });
    $('flight-edit').addEventListener('click', function () {
      var f = load(KEYS.flight, null);
      if (f) { fNo.value = f.flight; tNo.value = f.ticket; }
      localStorage.removeItem(KEYS.flight);
      renderFlight(); fNo.focus();
    });
    $('reg-toggle').addEventListener('click', function () {
      save(KEYS.regExpired, !load(KEYS.regExpired, false));
      renderReg();
    });
  }

  /* ---------- render: balance + statement ---------- */
  function renderBalance() {
    var list = allTx();
    $('balance').textContent = money(list.length ? list[list.length - 1].balance : OPENING_BALANCE);
    var mini = $('mini-tx'); mini.textContent = '';
    list.slice(-3).reverse().forEach(function (t) {
      var li = el('li');
      var left = el('div'); left.appendChild(el('span', 'mt-desc', t.desc)); left.appendChild(el('span', 'mt-date', fmtDate(t.date)));
      li.appendChild(left);
      li.appendChild(el('span', 'mt-amt ' + (t.credit ? 'credit' : 'debit'), (t.credit ? '+' : '−') + money(t.credit || t.debit)));
      mini.appendChild(li);
    });
  }

  function renderStatement() {
    var list = allTx();
    var totalD = 0, totalC = 0;
    var body = $('st-body'); body.textContent = '';
    var from = list.length ? list[0].date : new Date();
    var openRow = el('tr', 'st-open');
    openRow.appendChild(el('td', '', fmtDate(from)));
    openRow.appendChild(el('td', '', 'Входящий остаток'));
    openRow.appendChild(el('td', 'num', '')); openRow.appendChild(el('td', 'num', ''));
    openRow.appendChild(el('td', 'num', money(OPENING_BALANCE)));
    body.appendChild(openRow);
    list.forEach(function (t) {
      totalD += t.debit; totalC += t.credit;
      var tr = el('tr');
      var td = el('td', 'st-date'); td.appendChild(document.createTextNode(fmtDate(t.date))); td.appendChild(el('small', '', fmtTime(t.date)));
      tr.appendChild(td);
      tr.appendChild(el('td', 'st-desc', t.desc));
      tr.appendChild(el('td', 'num debit', t.debit ? money(t.debit) : ''));
      tr.appendChild(el('td', 'num credit', t.credit ? money(t.credit) : ''));
      tr.appendChild(el('td', 'num', money(t.balance)));
      body.appendChild(tr);
    });
    var closing = list.length ? list[list.length - 1].balance : OPENING_BALANCE;
    var foot = $('st-foot'); foot.textContent = '';
    var r1 = el('tr');
    r1.appendChild(el('th', '', '')); r1.firstChild.setAttribute('scope', 'row');
    r1.appendChild(el('td', '', 'Итого обороты'));
    r1.appendChild(el('td', 'num debit', money(totalD)));
    r1.appendChild(el('td', 'num credit', money(totalC)));
    r1.appendChild(el('td', 'num', ''));
    var r2 = el('tr', 'st-close');
    r2.appendChild(el('td', '', fmtDate(new Date())));
    r2.appendChild(el('td', '', 'Исходящий остаток'));
    r2.appendChild(el('td', 'num', '')); r2.appendChild(el('td', 'num', ''));
    r2.appendChild(el('td', 'num', money(closing)));
    foot.appendChild(r1); foot.appendChild(r2);
    // labels for the stacked mobile layout
    var labels = ['Дата', 'Описание', 'Дебет', 'Кредит', 'Остаток'];
    $('st-body').parentNode.querySelectorAll('tbody tr, tfoot tr').forEach(function (tr) {
      Array.prototype.forEach.call(tr.children, function (c, i) {
        c.setAttribute('data-label', labels[i]);
        if (!c.textContent) c.classList.add('empty');
      });
    });

    $('st-owner').textContent = PERSON.surnameRu + ' ' + PERSON.nameRu + ' ' + PERSON.patronymicRu;
    $('st-period').textContent = fmtDate(from) + ' — ' + fmtDate(new Date());
    $('st-open').textContent = money(OPENING_BALANCE);
    $('st-debit').textContent = '−' + money(totalD);
    $('st-credit').textContent = '+' + money(totalC);
    $('st-close').textContent = money(closing);
  }

  /* ---------- top-up modal ---------- */
  function initTopup() {
    var modal = $('topup-modal'), form = $('topup-form'), amount = $('topup-amount'), err = $('topup-err');
    var lastFocus = null;
    function open() {
      lastFocus = document.activeElement;
      modal.hidden = false; document.body.classList.add('modal-open');
      form.reset(); err.textContent = ''; amount.removeAttribute('aria-invalid');
      setTimeout(function () { amount.focus(); }, 30);
    }
    function close() {
      modal.hidden = true; document.body.classList.remove('modal-open');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    document.querySelectorAll('[data-open-topup]').forEach(function (b) { b.addEventListener('click', open); });
    modal.querySelectorAll('[data-close-topup]').forEach(function (b) { b.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) close(); });
    modal.querySelectorAll('[data-amount]').forEach(function (b) {
      b.addEventListener('click', function () { amount.value = b.dataset.amount; err.textContent = ''; amount.focus(); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = parseFloat(String(amount.value).replace(',', '.'));
      if (!isFinite(v) || v < 10 || v > 300000) {
        err.textContent = 'Введите сумму от 10 до 300 000 ₽.'; amount.setAttribute('aria-invalid', 'true'); amount.focus(); return;
      }
      v = Math.round(v * 100) / 100;
      var method = $('topup-method').value;
      var desc = method === 'карта' ? 'Пополнение с карты другого банка (демо)' :
        method === 'терминал' ? 'Пополнение наличными через терминал (демо)' : 'Пополнение через СБП (демо)';
      var list = load(KEYS.topups, []);
      list.push({ at: new Date().toISOString(), amount: v, desc: desc });
      save(KEYS.topups, list);
      close();
      renderBalance(); renderStatement();
      toast('Счёт пополнен на ' + money(v));
    });
  }

  /* ---------- passport ---------- */
  function renderPassport() {
    var rows = [
      ['Фамилия / Surname', PERSON.surnameRu.toUpperCase() + ' / ' + PERSON.surnameLat],
      ['Имя / Given name', PERSON.nameRu.toUpperCase() + ' / ' + PERSON.nameLat],
      ['Отчество / Patronymic', PERSON.patronymicRu.toUpperCase() + ' / ' + PERSON.patronymicLat],
      ['Дата рождения / Date of birth', PERSON.dob],
      ['Место рождения / Place of birth', PERSON.birthPlace],
      ['Пол / Sex', PERSON.sex],
      ['Гражданство / Nationality', PERSON.citizenship.toUpperCase() + ' / ' + PERSON.citizenshipLat],
      ['Серия и номер / No.', PERSON.docNo, 'pp-no'],
      ['Дата выдачи / Date of issue', PERSON.issued],
      ['Действителен до / Date of expiry', PERSON.expires]
    ];
    var dl = $('pp-fields'); dl.textContent = '';
    rows.forEach(function (r) {
      var div = el('div', r[2] || '');
      div.appendChild(el('dt', '', r[0])); div.appendChild(el('dd', '', r[1]));
      dl.appendChild(div);
    });
    $('pp-phone').textContent = PERSON.phone;
  }

  /* ---------- offices ---------- */
  function renderOffices() {
    var ul = $('offices-list'); ul.textContent = '';
    OFFICES.forEach(function (o) {
      var li = el('li', 'card office');
      li.appendChild(el('h2', '', o.name));
      if (o.what) li.appendChild(el('p', 'office-what', o.what));
      var dl = el('dl', 'office-dl');
      function row(k, node) { var d = el('div'); d.appendChild(el('dt', '', k)); var dd = el('dd'); if (typeof node === 'string') dd.textContent = node; else dd.appendChild(node); d.appendChild(dd); dl.appendChild(d); }
      row('Адрес', o.address);
      if (o.hours) row('Часы работы', o.hours);
      o.phones.forEach(function (p) {
        var a = el('a', '', p.value); a.href = 'tel:' + p.value.replace(/[^\d+]/g, '');
        row(p.label, a);
      });
      li.appendChild(dl);
      if (o.note) li.appendChild(el('p', 'office-note', o.note));
      var src = el('p', 'office-src'); src.appendChild(el('span', '', 'Источник: '));
      o.sources.forEach(function (s, i) {
        if (i) src.appendChild(document.createTextNode(' · '));
        var a = el('a', '', s.title); a.href = s.url; a.target = '_blank'; a.rel = 'noopener';
        src.appendChild(a);
      });
      li.appendChild(src);
      ul.appendChild(li);
    });
  }

  /* ---------- routing (hash views) ---------- */
  var VIEWS = ['home', 'history', 'passport', 'offices'];
  function route() {
    var v = (location.hash || '#home').slice(1);
    if (VIEWS.indexOf(v) === -1) v = 'home';
    document.querySelectorAll('[data-view]').forEach(function (s) { s.hidden = s.dataset.view !== v; });
    document.querySelectorAll('[data-view-link]').forEach(function (a) {
      if (a.dataset.viewLink === v) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    if (v === 'history') renderStatement();
    if (v === 'home') { renderReg(); renderBalance(); }
    window.scrollTo(0, 0);
  }

  /* ---------- toast ---------- */
  var toastTimer = null;
  function toast(msg) {
    var t = $('toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, 2600);
  }

  document.addEventListener('DOMContentLoaded', function () {
    renderProfile(); renderReg(); renderBalance(); renderStatement(); renderPassport(); renderOffices();
    initFlightForm(); initTopup();
    $('logout').addEventListener('click', function () {
      localStorage.removeItem(KEYS.session);
      location.replace('index.html');
    });
    $('reset-demo').addEventListener('click', function () {
      [KEYS.topups, KEYS.regExpired, KEYS.flight].forEach(function (k) { localStorage.removeItem(k); });
      renderReg(); renderBalance(); renderStatement();
      toast('Демо-данные сброшены');
    });
    window.addEventListener('hashchange', route);
    route();
  });
})();
