import {languages, translate} from './i18n-core.js';
import './i18n.css';

let language = 'ru';
try { const saved = localStorage.getItem('tau-language'); if (languages.includes(saved)) language = saved; } catch {}
export const t = text => translate(text, language);

export function initLanguages() {
  const sources = new WeakMap();
  const attributes = ['aria-label', 'aria-roledescription', 'alt', 'placeholder', 'title'];
  const excluded = 'script,style,noscript,[data-no-translate]';
  // The site mixes HTML and React. Change only text-node data and labels,
  // never element structure, handlers, form values or React-owned children.
  function apply(target, key, current, write) {
    let entries = sources.get(target);
    if (!entries) { entries = new Map(); sources.set(target, entries); }
    let entry = entries.get(key);
    if (!entry || current !== entry.output) entry = {source:current, output:current};
    const output = t(entry.source);
    entry.output = output;
    entries.set(key, entry);
    if (current !== output) write(output);
  }
  function visit(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (!node.parentElement?.closest(`${excluded},textarea`)) apply(node, 'text', node.data, value => { node.data=value; });
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE || node.matches(excluded)) return;
    for (const name of attributes) if (node.hasAttribute(name)) apply(node, name, node.getAttribute(name), value => node.setAttribute(name,value));
    for (const child of node.childNodes) visit(child);
  }
  const observer = new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'childList') record.addedNodes.forEach(visit);
      else if (record.type === 'characterData') visit(record.target);
      else {
        const node = record.target, name = record.attributeName;
        if (!node.closest(excluded) && node.hasAttribute(name)) apply(node,name,node.getAttribute(name),value=>node.setAttribute(name,value));
      }
    }
  });
  const buttons = [...document.querySelectorAll('[data-language]')];
  function update() {
    document.documentElement.lang = language;
    buttons.forEach(button => {
      button.dataset.language = language;
      button.querySelector('.language-label').textContent = {ru:'RU',kk:'KZ',en:'EN'}[language];
      button.setAttribute('aria-label', {ru:'Язык: русский. Переключить на казахский',kk:'Тіл: қазақша. Ағылшын тіліне ауысу',en:'Language: English. Switch to Russian'}[language]);
    });
    visit(document.body);
    document.title = {ru:'TAU CLOUD — дата-центры и облачная инфраструктура',kk:'TAU CLOUD — дата-орталықтар және бұлттық инфрақұрылым',en:'TAU CLOUD — Data centres and cloud infrastructure'}[language];
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = {ru:'Дата-центры и облачные решения TAU CLOUD в Казахстане. Размещение серверов, IaaS, PaaS и строительство ЦОД.',kk:'Қазақстандағы TAU CLOUD дата-орталықтары және бұлттық шешімдері. Серверлерді орналастыру, IaaS, PaaS және дата-орталық салу.',en:'TAU CLOUD data centres and cloud solutions in Kazakhstan. Colocation, IaaS, PaaS and data centre construction.'}[language];
    document.dispatchEvent(new CustomEvent('languagechange', {detail:{language}}));
  }
  buttons.forEach(button => button.addEventListener('click', () => {
    language = languages[(languages.indexOf(language) + 1) % languages.length];
    try { localStorage.setItem('tau-language', language); } catch {}
    update();
  }));
  update();
  observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:attributes});
}
