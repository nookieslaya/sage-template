export const esc = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

export const parseArrayInput = (value, fallback = []) => {
  try {
    const parsed = JSON.parse(value);

    return Array.isArray(parsed) ? parsed : fallback;
  } catch (error) {
    return fallback;
  }
};

export const serializeArrayInput = (value = []) => JSON.stringify(value, null, 2);

export const currentEditorLang = () => (document.documentElement.lang || '').toLowerCase().startsWith('pl') ? 'pl' : 'en';

export const getLegacyLocalized = (attributes, key, fallback = '') => {
  const lang = currentEditorLang();
  const primaryLegacy = attributes?.[`${key}${lang === 'pl' ? 'Pl' : 'En'}`];
  const secondaryLegacy = attributes?.[`${key}${lang === 'pl' ? 'En' : 'Pl'}`];

  return attributes?.[key] || primaryLegacy || secondaryLegacy || fallback;
};

export const getItemLegacyLocalized = (item, key, fallback = '') => {
  const lang = currentEditorLang();
  const primaryLegacy = item?.[`${key}${lang === 'pl' ? 'Pl' : 'En'}`];
  const secondaryLegacy = item?.[`${key}${lang === 'pl' ? 'En' : 'Pl'}`];

  return item?.[key] || primaryLegacy || secondaryLegacy || fallback;
};
