/* Счёт РФ — DEMO login by phone + SMS code.
 * Client-side only prototype: no SMS is sent, the demo code is always 1234.
 * Session is stored in localStorage and read by cabinet.html. */
(function () {
  'use strict';
  var SESSION_KEY = 'schetrf-demo-session';
  var DEMO_CODE = '1234';
  var T = {
    ru: { phoneBad: 'Введите номер полностью: +7 и 10 цифр.', codeBad: 'Неверный код. Для демо введите 1234.', codeShort: 'Введите 4 цифры кода.' },
    en: { phoneBad: 'Enter the full number: +7 and 10 digits.', codeBad: 'Wrong code. For the demo, enter 1234.', codeShort: 'Enter the 4-digit code.' }
  };
  function lang() { return document.documentElement.lang === 'en' ? 'en' : 'ru'; }

  function digitsOf(v) {
    var d = String(v || '').replace(/\D/g, '');
    if (d.charAt(0) === '8' || d.charAt(0) === '7') d = d.slice(1);
    return d.slice(0, 10);
  }
  function formatPhone(d) {
    var out = '+7';
    if (d.length) out += ' (' + d.slice(0, 3);
    if (d.length >= 3) out += ')';
    if (d.length > 3) out += ' ' + d.slice(3, 6);
    if (d.length > 6) out += '-' + d.slice(6, 8);
    if (d.length > 8) out += '-' + d.slice(8, 10);
    return out;
  }

  function init() {
    var modal = document.getElementById('login-modal');
    if (!modal) return;
    var phoneForm = document.getElementById('login-phone-form');
    var codeForm = document.getElementById('login-code-form');
    var phone = document.getElementById('login-phone');
    var code = document.getElementById('login-code');
    var phoneErr = document.getElementById('login-phone-err');
    var codeErr = document.getElementById('login-code-err');
    var lastFocus = null;

    function setErr(input, el, msg) {
      el.textContent = msg || '';
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    }
    function open() {
      // Already logged in? Go straight to the cabinet.
      try { if (JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')) { location.href = 'cabinet.html'; return; } } catch (e) { /* ignore */ }
      lastFocus = document.activeElement;
      modal.hidden = false;
      document.body.classList.add('modal-open');
      phoneForm.hidden = false; codeForm.hidden = true;
      setErr(phone, phoneErr, ''); setErr(code, codeErr, '');
      if (!phone.value) phone.value = '+7 ';
      setTimeout(function () { phone.focus(); }, 30);
    }
    function close() {
      modal.hidden = true;
      document.body.classList.remove('modal-open');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    document.querySelectorAll('[data-open-login]').forEach(function (b) { b.addEventListener('click', open); });
    modal.querySelectorAll('[data-close-login]').forEach(function (b) { b.addEventListener('click', close); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) close(); });

    phone.addEventListener('input', function () {
      var d = digitsOf(phone.value);
      phone.value = formatPhone(d);
      if (phoneErr.textContent && d.length === 10) setErr(phone, phoneErr, '');
    });
    phone.addEventListener('focus', function () { if (!phone.value) phone.value = '+7 '; });

    phoneForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = digitsOf(phone.value);
      if (d.length !== 10) { setErr(phone, phoneErr, T[lang()].phoneBad); phone.focus(); return; }
      setErr(phone, phoneErr, '');
      document.getElementById('login-phone-echo').textContent = formatPhone(d);
      phoneForm.hidden = true; codeForm.hidden = false;
      code.value = ''; setErr(code, codeErr, '');
      code.focus();
    });

    code.addEventListener('input', function () { code.value = code.value.replace(/\D/g, '').slice(0, 4); if (codeErr.textContent) setErr(code, codeErr, ''); });

    codeForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = code.value.trim();
      if (v.length !== 4) { setErr(code, codeErr, T[lang()].codeShort); code.focus(); return; }
      if (v !== DEMO_CODE) { setErr(code, codeErr, T[lang()].codeBad); code.select(); return; }
      try {
        localStorage.setItem(SESSION_KEY, JSON.stringify({ phone: formatPhone(digitsOf(phone.value)), loginAt: new Date().toISOString(), demo: true }));
      } catch (err) { /* storage unavailable: cabinet will bounce back */ }
      location.href = 'cabinet.html';
    });

    document.getElementById('login-back').addEventListener('click', function () {
      codeForm.hidden = true; phoneForm.hidden = false; phone.focus();
    });

    if (location.hash === '#login') open();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
