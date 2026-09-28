import {t} from './i18n.js';

function initContactInputs(form) {
  const sanitize = (input, clean) => {
    const update = () => {
      const caret = clean(input.value.slice(0, input.selectionStart)).length;
      input.value = clean(input.value);
      input.setSelectionRange(caret, caret);
    };
    input.addEventListener('input', event => { if (!event.isComposing) update(); });
    input.addEventListener('compositionend', update);
    input.addEventListener('paste', event => {
      event.preventDefault();
      input.setRangeText(clean(event.clipboardData.getData('text')), input.selectionStart, input.selectionEnd, 'end');
      input.dispatchEvent(new Event('input', {bubbles:true}));
    });
  };
  sanitize(form.elements.bin, value => value.replace(/\D/g, '').slice(0, 12));
  sanitize(form.elements.name, value => value.replace(/[^\p{L}\p{M} -]/gu, ''));

  const phone = form.elements.phone;
  const prefix = '+7 (7';
  const format = digits => prefix + digits.slice(0, 2)
    + (digits.length >= 2 ? ') ' : '') + digits.slice(2, 5)
    + (digits.length > 5 ? '-' + digits.slice(5, 7) : '')
    + (digits.length > 7 ? '-' + digits.slice(7, 9) : '');
  const update = () => {
    const value = phone.value;
    let digits = value.replace(/\D/g, '');
    let skipped = 0;
    if (value.startsWith(prefix) || /^[78]7\d{9}$/.test(digits)) skipped = 2;
    else if (/^7\d{9}$/.test(digits)) skipped = 1;
    const count = Math.max(0, value.slice(0, phone.selectionStart).replace(/\D/g, '').length - skipped);
    digits = digits.slice(skipped, skipped + 9);
    phone.value = format(digits);
    let caret = prefix.length, remaining = Math.min(count, digits.length);
    while (remaining && caret < phone.value.length) {
      if (/\d/.test(phone.value[caret])) remaining--;
      caret++;
    }
    while (caret < phone.value.length && /\D/.test(phone.value[caret])) caret++;
    phone.setSelectionRange(caret, caret);
  };
  phone.addEventListener('focus', () => { if (!phone.value) phone.value = prefix; });
  phone.addEventListener('input', update);
  phone.addEventListener('paste', event => {
    const digits = event.clipboardData.getData('text').replace(/\D/g, '');
    if (/^(?:[78])?7\d{9}$/.test(digits)) {
      event.preventDefault();
      phone.value = digits;
      phone.dispatchEvent(new Event('input', {bubbles:true}));
    }
  });
  phone.addEventListener('beforeinput', event => {
    if (!event.inputType.startsWith('delete')) {
      if (phone.selectionStart < prefix.length && phone.selectionEnd < phone.value.length) {
        phone.setSelectionRange(prefix.length, Math.max(prefix.length, phone.selectionEnd));
      }
      return;
    }
    let start = Math.max(prefix.length, phone.selectionStart);
    let end = Math.max(prefix.length, phone.selectionEnd);
    if (start === end) {
      if (event.inputType.endsWith('Backward')) {
        while (start > prefix.length && /\D/.test(phone.value[start - 1])) start--;
        start = Math.max(prefix.length, start - 1);
      } else {
        while (end < phone.value.length && /\D/.test(phone.value[end])) end++;
        end++;
      }
    }
    event.preventDefault();
    phone.setRangeText('', start, end, 'start');
    phone.dispatchEvent(new Event('input', {bubbles:true}));
  });
}

export function initBrief() {
  const form = document.querySelector('#brief');
  const status = document.querySelector('#form-status');
  const contact = document.querySelector('#contact');
  const button = form.querySelector('[type="submit"]');
  const original = button.innerHTML;
  initContactInputs(form);
  let pending = false, sent = false;
  const show = (message, state) => {
    status.setAttribute('role', state === 'error' ? 'alert' : 'status');
    status.dataset.state = state;
    status.textContent = message;
  };
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { contact.classList.add('is-visible'); observer.disconnect(); }
    }, {threshold:.1});
    observer.observe(contact);
  } else contact.classList.add('is-visible');
  document.addEventListener('languagechange', () => {
    form.elements.name.setCustomValidity('');
    form.elements.phone.setCustomValidity('');
  });
  form.addEventListener('input', () => {
    form.elements.name.setCustomValidity('');
    form.elements.phone.setCustomValidity('');
    if (sent) { sent=false; button.disabled=false; button.innerHTML=original; show('', 'idle'); }
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (pending || sent || !form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form));
    if (!/\p{L}/u.test(data.name) || !/^[\p{L}\p{M} -]+$/u.test(data.name)) { form.elements.name.setCustomValidity(t('Укажите контактное лицо.')); form.elements.name.reportValidity(); return; }
    const phoneDigits=data.phone.replace(/\D/g,'');
    if (!/^77\d{9}$/.test(phoneDigits)) { form.elements.phone.setCustomValidity(t('Укажите телефон в формате +7 (7XX) XXX-XX-XX.')); form.elements.phone.reportValidity(); return; }
    pending = true;
    form.setAttribute('aria-busy','true');
    const controls = [...form.querySelectorAll('input, select, textarea, button')];
    controls.forEach(control => control.disabled=true);
    button.innerHTML='Отправляем заявку <span class="brief-spinner" aria-hidden="true"></span>';
    show('Передаём заявку в TAU CLOUD…','pending');
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(),45000);
    try {
      const response = await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:controller.signal});
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.ok !== true) throw new Error(response.status===429 ? 'Слишком много попыток. Подождите минуту и попробуйте снова.' : result.error || 'Не удалось отправить заявку. Попробуйте ещё раз или напишите на info@taucloud.kz.');
      sent=true;
      show('Заявка отправлена на info@taucloud.kz. Спасибо! Мы свяжемся с вами по указанным контактам.','success');
      button.innerHTML='Заявка отправлена <span aria-hidden="true">✓</span>';
    } catch(error) {
      show(error.name==='AbortError' || error instanceof TypeError ? 'Не удалось получить подтверждение отправки. Данные сохранены в форме. Проверьте соединение; повторная отправка может создать дубликат. Также можно написать на info@taucloud.kz.' : error.message,'error');
    } finally {
      clearTimeout(timeout); pending=false; form.removeAttribute('aria-busy');
      controls.forEach(control => control.disabled=false);
      button.disabled=sent;
      if (!sent) button.innerHTML=original;
    }
  });
}
