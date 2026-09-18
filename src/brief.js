export function initBrief() {
  const form = document.querySelector('#brief');
  const status = document.querySelector('#form-status');
  const contact = document.querySelector('#contact');
  const button = form.querySelector('[type="submit"]');
  const original = button.innerHTML;
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
  form.addEventListener('input', () => {
    form.elements.name.setCustomValidity('');
    form.elements.phone.setCustomValidity('');
    if (sent) { sent=false; button.disabled=false; button.innerHTML=original; show('', 'idle'); }
  });
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (pending || sent || !form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form));
    if (!data.name.trim()) { form.elements.name.setCustomValidity('Укажите контактное лицо.'); form.elements.name.reportValidity(); return; }
    const phoneDigits=data.phone.replace(/\D/g,'');
    if (phoneDigits.length<7 || phoneDigits.length>15) { form.elements.phone.setCustomValidity('Укажите телефон: от 7 до 15 цифр.'); form.elements.phone.reportValidity(); return; }
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
