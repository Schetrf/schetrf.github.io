/* Счёт РФ — minimal vanilla JS: language switch, mobile menu, lead form. */
(function () {
  'use strict';

  /* ==========================================================
   * TODO(owner): replace placeholder contacts with real ones.
   * Also update the same values in index.html (#contact section).
   * ========================================================== */
  var CONTACTS = {
    phone: '+7 (000) 000-00-00',          // TODO: real phone / WhatsApp
    telegram: 'schetrf_placeholder',      // TODO: real Telegram username (without @)
    email: 'hello@schetrf.example'        // TODO: real email
  };

  var STORAGE_KEY = 'schetrf-lang';
  var TITLES = {
    ru: 'Счёт РФ — счёт в цифровых рублях для приехавших в Россию',
    en: 'Schet RF — a digital ruble account for those who have come to Russia'
  };
  var MESSAGES = {
    ru: {
      nameRequired: 'Пожалуйста, укажите имя.',
      phoneRequired: 'Укажите номер телефона.',
      telegramBad: 'Telegram: @username — 5–32 символа, латиница, цифры и _.',
      phoneBad: 'Проверьте номер: +7 и 10 цифр (например, +7 999 123-45-67) или международный формат с + (8–15 цифр).',
      consentRequired: 'Нужно согласие на обработку данных.',
      menuOpen: 'Открыть меню', menuClose: 'Закрыть меню',
      subject: 'Заявка с сайта Счёт РФ',
      fName: 'Имя', fPhone: 'Телефон', fTelegram: 'Telegram', fCitizenship: 'Гражданство', fMessage: 'Сообщение',
      fTicket: 'Номер билета', fPassport: 'Паспорт',
      passportAttach: 'файл выбран на устройстве, НЕ отправлен — приложу вручную',
      fileTooBig: 'Файл больше 10 МБ. Выберите файл меньшего размера.',
      fileType: 'Подходят только изображения или PDF.',
      ticketBad: 'Номер билета: только цифры, буквы, пробелы и дефисы (6–30 символов).'
    },
    en: {
      nameRequired: 'Please enter your name.',
      phoneRequired: 'Please enter your phone number.',
      telegramBad: 'Telegram: @username — 5–32 characters, Latin letters, digits and _.',
      phoneBad: 'Check the number: +7 and 10 digits (e.g. +7 999 123-45-67) or international format with + (8–15 digits).',
      consentRequired: 'Consent to data processing is required.',
      menuOpen: 'Open menu', menuClose: 'Close menu',
      subject: 'Request from Schet RF website',
      fName: 'Name', fPhone: 'Phone', fTelegram: 'Telegram', fCitizenship: 'Citizenship', fMessage: 'Message',
      fTicket: 'Ticket number', fPassport: 'Passport',
      passportAttach: 'file selected on device, NOT sent — I will attach it manually',
      fileTooBig: 'The file is larger than 10 MB. Please choose a smaller file.',
      fileType: 'Only images or PDF files are accepted.',
      ticketBad: 'Ticket number: digits, letters, spaces and dashes only (6–30 characters).'
    }
  };

  var currentLang = 'ru';

  /* ---------- i18n via data attributes ----------
   * Russian is the source text in the HTML. English lives in:
   *   data-en              -> textContent
   *   data-en-placeholder  -> placeholder attribute
   *   data-en-aria-label   -> aria-label attribute
   * The original Russian is cached in data-ru* on first switch. */
  function applyLang(lang) {
    if (lang !== 'ru' && lang !== 'en') lang = 'ru';
    currentLang = lang;

    document.querySelectorAll('[data-en]').forEach(function (el) {
      if (el.dataset.ru === undefined) el.dataset.ru = el.textContent;
      el.textContent = lang === 'en' ? el.dataset.en : el.dataset.ru;
    });
    document.querySelectorAll('[data-en-placeholder]').forEach(function (el) {
      if (el.dataset.ruPlaceholder === undefined) el.dataset.ruPlaceholder = el.getAttribute('placeholder') || '';
      el.setAttribute('placeholder', lang === 'en' ? el.dataset.enPlaceholder : el.dataset.ruPlaceholder);
    });
    document.querySelectorAll('[data-en-aria-label]').forEach(function (el) {
      if (el.dataset.ruAriaLabel === undefined) el.dataset.ruAriaLabel = el.getAttribute('aria-label') || '';
      el.setAttribute('aria-label', lang === 'en' ? el.dataset.enAriaLabel : el.dataset.ruAriaLabel);
    });

    document.querySelectorAll('[data-en-alt]').forEach(function (el) {
      if (el.dataset.ruAlt === undefined) el.dataset.ruAlt = el.getAttribute('alt') || '';
      el.setAttribute('alt', lang === 'en' ? el.dataset.enAlt : el.dataset.ruAlt);
    });

    document.documentElement.lang = lang;
    if (TITLES[lang]) document.title = TITLES[lang];
    document.querySelectorAll('.lang-btn').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
    });
    // Clear any visible validation errors so they don't stay in the old language
    document.querySelectorAll('.field-error').forEach(function (e) { e.textContent = ''; });
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }
  }

  function initialLang() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('lang');
    if (q === 'ru' || q === 'en') return q;
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'ru' || saved === 'en') return saved;
    } catch (e) { /* ignore */ }
    return 'ru'; // Russian is the primary language
  }

  /* ---------- Contacts ---------- */
  function applyContacts() {
    var phoneDigits = CONTACTS.phone.replace(/[^\d+]/g, '');
    document.querySelectorAll('[data-contact="phone"]').forEach(function (a) {
      a.href = 'tel:' + phoneDigits; a.textContent = CONTACTS.phone;
    });
    document.querySelectorAll('[data-contact="telegram"]').forEach(function (a) {
      a.href = 'https://t.me/' + CONTACTS.telegram; a.textContent = '@' + CONTACTS.telegram;
    });
    document.querySelectorAll('[data-contact="email"]').forEach(function (a) {
      a.href = 'mailto:' + CONTACTS.email; a.textContent = CONTACTS.email;
    });
  }

  /* ---------- Mobile menu ---------- */
  function initMenu() {
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('main-nav');
    if (!toggle || !nav) return;
    function setOpen(open) {
      nav.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      var label = open ? MESSAGES[currentLang].menuClose : MESSAGES[currentLang].menuOpen;
      toggle.setAttribute('aria-label', label);
    }
    toggle.addEventListener('click', function () { setOpen(!nav.classList.contains('open')); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { setOpen(false); toggle.focus(); }
    });
  }

  /* ---------- Lead form (no real submission) ---------- */
  function initForm() {
    var form = document.getElementById('lead-form');
    var success = document.getElementById('form-success');
    if (!form || !success) return;

    /* Phone: Russian +7 / 8 + 10 digits, or international E.164 (+ and 8–15 digits). Returns normalized string or ''. */
    function normalizePhone(v) {
      var raw = String(v || '').trim();
      if (!/^[+\d\s()\-]+$/.test(raw)) return '';
      var d = raw.replace(/\D/g, '');
      if (raw.charAt(0) === '+') {
        if (d.charAt(0) === '7') return d.length === 11 ? '+7 ' + d.slice(1, 4) + ' ' + d.slice(4, 7) + '-' + d.slice(7, 9) + '-' + d.slice(9) : '';
        return (d.length >= 8 && d.length <= 15) ? '+' + d : '';
      }
      if (d.length === 11 && (d.charAt(0) === '8' || d.charAt(0) === '7')) d = d.slice(1);
      if (d.length === 10 && d.charAt(0) === '9') return '+7 ' + d.slice(0, 3) + ' ' + d.slice(3, 6) + '-' + d.slice(6, 8) + '-' + d.slice(8);
      if (d.length === 10) return '+7 ' + d.slice(0, 3) + ' ' + d.slice(3, 6) + '-' + d.slice(6, 8) + '-' + d.slice(8);
      return '';
    }
    var phoneInput = form.elements.phone;
    phoneInput.addEventListener('input', function () {
      var cleaned = phoneInput.value.replace(/[^+\d\s()\-]/g, '');
      if (cleaned !== phoneInput.value) phoneInput.value = cleaned;
      if (document.getElementById('f-phone-err').textContent && normalizePhone(cleaned)) setError(phoneInput, 'f-phone-err', '');
    });

    function setError(input, errId, msg) {
      var err = document.getElementById(errId);
      if (err) err.textContent = msg || '';
      if (input) {
        input.setAttribute('aria-invalid', msg ? 'true' : 'false');
        if (msg) input.setAttribute('aria-describedby', errId); else input.removeAttribute('aria-describedby');
      }
    }

    /* ---- Passport file: local preview only, never uploaded (static site, no backend) ---- */
    var MAX_FILE = 10 * 1024 * 1024;
    var fileInput = document.getElementById('f-passport');
    var camInput = document.getElementById('f-passport-camera');
    var preview = document.getElementById('f-passport-preview');
    var previewImg = document.getElementById('f-passport-img');
    var previewName = document.getElementById('f-passport-name');
    var selectedFile = null, previewUrl = null;

    function clearFile() {
      selectedFile = null;
      if (previewUrl) { URL.revokeObjectURL(previewUrl); previewUrl = null; }
      if (fileInput) fileInput.value = '';
      if (camInput) camInput.value = '';
      if (preview) { preview.hidden = true; previewImg.hidden = true; previewImg.removeAttribute('src'); previewName.textContent = ''; }
    }
    function fmtSize(b) { return b >= 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB'; }
    function onFile(input) {
      var f = input.files && input.files[0];
      var m = MESSAGES[currentLang];
      if (!f) return;
      var isImg = /^image\//.test(f.type) || /\.(jpe?g|png|gif|webp|heic|heif|bmp)$/i.test(f.name);
      var isPdf = f.type === 'application/pdf' || /\.pdf$/i.test(f.name);
      if (!isImg && !isPdf) { clearFile(); setError(fileInput, 'f-passport-err', m.fileType); return; }
      if (f.size > MAX_FILE) { clearFile(); setError(fileInput, 'f-passport-err', m.fileTooBig); return; }
      setError(fileInput, 'f-passport-err', '');
      clearFile();
      selectedFile = f;
      previewName.textContent = f.name + ' · ' + fmtSize(f.size);
      if (isImg && /^image\/(jpeg|png|gif|webp|bmp|svg\+xml)$/.test(f.type)) {
        previewUrl = URL.createObjectURL(f);
        previewImg.src = previewUrl; previewImg.hidden = false;
      }
      preview.hidden = false;
    }
    if (fileInput) {
      fileInput.addEventListener('change', function () { onFile(fileInput); });
      camInput.addEventListener('change', function () { onFile(camInput); });
      document.getElementById('f-passport-remove').addEventListener('click', function () { clearFile(); fileInput.focus(); });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var m = MESSAGES[currentLang];
      var name = form.elements.name, phone = form.elements.phone, consent = form.elements.consent;
      var ok = true, firstBad = null;

      if (!name.value.trim()) { setError(name, 'f-name-err', m.nameRequired); ok = false; firstBad = firstBad || name; }
      else setError(name, 'f-name-err', '');
      var phoneNorm = normalizePhone(phone.value);
      if (!phone.value.trim()) { setError(phone, 'f-phone-err', m.phoneRequired); ok = false; firstBad = firstBad || phone; }
      else if (!phoneNorm) { setError(phone, 'f-phone-err', m.phoneBad); ok = false; firstBad = firstBad || phone; }
      else setError(phone, 'f-phone-err', '');
      var tg = form.elements.telegram, tgv = tg.value.trim().replace(/^https?:\/\/t\.me\//i, '').replace(/^@/, '');
      if (tgv && !/^[A-Za-z][A-Za-z0-9_]{4,31}$/.test(tgv)) { setError(tg, 'f-telegram-err', m.telegramBad); ok = false; firstBad = firstBad || tg; }
      else setError(tg, 'f-telegram-err', '');
      var ticket = form.elements.ticket;
      var tv = ticket.value.trim();
      if (tv && !/^[0-9A-Za-zА-Яа-яЁё][0-9A-Za-zА-Яа-яЁё \-]{4,28}[0-9A-Za-zА-Яа-яЁё]$/.test(tv)) { setError(ticket, 'f-ticket-err', m.ticketBad); ok = false; firstBad = firstBad || ticket; }
      else setError(ticket, 'f-ticket-err', '');
      if (document.getElementById('f-passport-err').textContent) { ok = false; firstBad = firstBad || fileInput; }
      if (!consent.checked) { setError(consent, 'f-consent-err', m.consentRequired); ok = false; firstBad = firstBad || consent; }
      else setError(consent, 'f-consent-err', '');
      if (!ok) { firstBad.focus(); return; }

      var body = [
        m.fName + ': ' + name.value.trim(),
        m.fPhone + ': ' + phoneNorm,
        m.fTelegram + ': ' + (tgv ? '@' + tgv : '—'),
        m.fCitizenship + ': ' + (form.elements.citizenship.value.trim() || '—'),
        m.fTicket + ': ' + (tv || '—'),
        m.fPassport + ': ' + (selectedFile ? selectedFile.name + ' (' + m.passportAttach + ')' : '—'),
        m.fMessage + ': ' + (form.elements.message.value.trim() || '—')
      ].join('\n');

      var mailto = 'mailto:' + CONTACTS.email +
        '?subject=' + encodeURIComponent(m.subject) +
        '&body=' + encodeURIComponent(body);
      // Telegram usernames can't receive prefilled text via t.me links;
      // the share link lets the user forward the text to any chat (incl. ours).
      var tgShare = 'https://t.me/share/url?url=' + encodeURIComponent('https://schetrf.github.io/') +
        '&text=' + encodeURIComponent(m.subject + '\n' + body + '\n→ @' + CONTACTS.telegram);

      document.getElementById('send-email').href = mailto;
      document.getElementById('send-telegram').href = tgShare;

      document.getElementById('success-file-note').hidden = !selectedFile;
      form.hidden = true;
      success.hidden = false;
      success.focus();

      // Open the user's email client with the prepared message (placeholder address until set).
      window.location.href = mailto;
    });

    document.getElementById('form-reset').addEventListener('click', function () {
      form.reset();
      clearFile();
      setError(fileInput, 'f-passport-err', '');
      success.hidden = true;
      form.hidden = false;
      form.elements.name.focus();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    applyContacts();
    applyLang(initialLang());
    document.querySelectorAll('.lang-btn').forEach(function (b) {
      b.addEventListener('click', function () { applyLang(b.dataset.lang); });
    });
    initMenu();
    initForm();
  });
})();
