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
    ru: 'Счёт РФ — помощь иностранцам в открытии банковского счёта в России',
    en: 'Schet RF — help for foreigners opening a bank account in Russia'
  };
  var MESSAGES = {
    ru: {
      nameRequired: 'Пожалуйста, укажите имя.',
      contactRequired: 'Укажите телефон, WhatsApp или Telegram для связи.',
      consentRequired: 'Нужно согласие на обработку данных.',
      menuOpen: 'Открыть меню', menuClose: 'Закрыть меню',
      subject: 'Заявка с сайта Счёт РФ',
      fName: 'Имя', fContact: 'Контакт', fCitizenship: 'Гражданство', fMessage: 'Сообщение'
    },
    en: {
      nameRequired: 'Please enter your name.',
      contactRequired: 'Please enter a phone number, WhatsApp or Telegram.',
      consentRequired: 'Consent to data processing is required.',
      menuOpen: 'Open menu', menuClose: 'Close menu',
      subject: 'Request from Schet RF website',
      fName: 'Name', fContact: 'Contact', fCitizenship: 'Citizenship', fMessage: 'Message'
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

    function setError(input, errId, msg) {
      var err = document.getElementById(errId);
      if (err) err.textContent = msg || '';
      if (input) {
        input.setAttribute('aria-invalid', msg ? 'true' : 'false');
        if (msg) input.setAttribute('aria-describedby', errId); else input.removeAttribute('aria-describedby');
      }
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var m = MESSAGES[currentLang];
      var name = form.elements.name, contact = form.elements.contact, consent = form.elements.consent;
      var ok = true, firstBad = null;

      if (!name.value.trim()) { setError(name, 'f-name-err', m.nameRequired); ok = false; firstBad = firstBad || name; }
      else setError(name, 'f-name-err', '');
      if (!contact.value.trim()) { setError(contact, 'f-contact-err', m.contactRequired); ok = false; firstBad = firstBad || contact; }
      else setError(contact, 'f-contact-err', '');
      if (!consent.checked) { setError(consent, 'f-consent-err', m.consentRequired); ok = false; firstBad = firstBad || consent; }
      else setError(consent, 'f-consent-err', '');
      if (!ok) { firstBad.focus(); return; }

      var body = [
        m.fName + ': ' + name.value.trim(),
        m.fContact + ': ' + contact.value.trim(),
        m.fCitizenship + ': ' + (form.elements.citizenship.value.trim() || '—'),
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

      form.hidden = true;
      success.hidden = false;
      success.focus();

      // Open the user's email client with the prepared message (placeholder address until set).
      window.location.href = mailto;
    });

    document.getElementById('form-reset').addEventListener('click', function () {
      form.reset();
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
