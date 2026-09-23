import messages from './locales/messages.json' with {type:'json'};

export const languages = ['ru', 'kk', 'en'];
const escape = text => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const phrases = new RegExp(Object.keys(messages).sort((a,b) => b.length-a.length).map(escape).join('|'), 'g');

export function translate(text, language = 'ru') {
  if (language === 'ru' || !languages.includes(language)) return text;
  // One pass: translated text must never be translated a second time.
  return text.replace(phrases, source => messages[source][language]);
}
