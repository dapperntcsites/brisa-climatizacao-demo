import { validateQuote, formatQuote } from './quote.mjs';

const dialog = document.querySelector('#quote-dialog');
const form = document.querySelector('#quote-form');
const result = document.querySelector('#quote-result');
const summary = document.querySelector('#quote-summary');
const status = document.querySelector('#quote-status');
const menuToggle = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('#mobile-menu');
let returnFocus;

function closeMenu() {
  mobileMenu.hidden = true;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Abrir menu');
}

function clearErrors() {
  for (const name of ['service', 'quantity', 'property']) {
    document.querySelector(`#${name}-error`).textContent = '';
    form.elements[name].removeAttribute('aria-invalid');
  }
  status.textContent = '';
}

document.querySelectorAll('[data-open-quote]').forEach((button) => {
  button.addEventListener('click', () => {
    returnFocus = button;
    closeMenu();
    clearErrors();
    form.hidden = false;
    result.hidden = true;
    if (button.dataset.service) form.elements.service.value = button.dataset.service;
    dialog.showModal();
    document.body.classList.add('modal-open');
    form.elements.service.focus();
  });
});

document.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('keydown', (event) => {
  if (event.key !== 'Tab') return;
  const focusable = [...dialog.querySelectorAll('button, input, select, textarea, a[href], [tabindex="0"]')]
    .filter((element) => !element.disabled && element.getClientRects().length > 0);
  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  if (returnFocus?.offsetParent !== null) returnFocus?.focus();
  else menuToggle.focus();
});

dialog.addEventListener('click', (event) => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  clearErrors();
  const validated = validateQuote(Object.fromEntries(new FormData(form)));
  if (!validated.ok) {
    for (const [name, message] of Object.entries(validated.errors)) {
      document.querySelector(`#${name}-error`).textContent = message;
      form.elements[name].setAttribute('aria-invalid', 'true');
    }
    form.elements[Object.keys(validated.errors)[0]].focus();
    status.textContent = 'Confira os campos indicados para continuar.';
    return;
  }
  summary.value = formatQuote(validated.value);
  form.hidden = true;
  result.hidden = false;
  const heading = document.querySelector('#result-title');
  heading.tabIndex = -1;
  heading.focus();
});

document.querySelector('.edit-quote').addEventListener('click', () => {
  result.hidden = true;
  form.hidden = false;
  clearErrors();
  form.elements.service.focus();
});

document.querySelector('#copy-quote').addEventListener('click', async () => {
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(summary.value);
    status.textContent = 'Resumo copiado! Esta simulação não envia pedidos.';
  } catch {
    summary.focus();
    summary.select();
    status.textContent = 'A cópia automática não está disponível. O texto está selecionado: use Copiar ou Ctrl+C.';
  }
});

menuToggle.addEventListener('click', () => {
  const opening = mobileMenu.hidden;
  mobileMenu.hidden = !opening;
  menuToggle.setAttribute('aria-expanded', String(opening));
  menuToggle.setAttribute('aria-label', opening ? 'Fechar menu' : 'Abrir menu');
});
mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('click', (event) => {
  if (!mobileMenu.hidden && !event.target.closest('.site-header')) closeMenu();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !dialog.open && !mobileMenu.hidden) {
    closeMenu();
    menuToggle.focus();
  }
});
window.matchMedia('(min-width: 651px)').addEventListener('change', (event) => {
  if (event.matches) closeMenu();
});
