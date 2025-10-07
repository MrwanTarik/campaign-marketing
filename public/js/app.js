
// Utilities
function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

function getLang() {
  const urlLang = new URLSearchParams(location.search).get('lang');
  if (urlLang && ['ar','en','tr'].includes(urlLang)) return urlLang;
  const stored = localStorage.getItem('lang');
  if (stored && ['ar','en','tr'].includes(stored)) return stored;
  // default Arabic per request
  return 'ar';
}

function setLang(lang) {
  localStorage.setItem('lang', lang);
  const url = new URL(location.href);
  url.searchParams.set('lang', lang);
  // keep session_id if present
  if (window.__sessionId) url.searchParams.set('sid', window.__sessionId);
  location.replace(url.toString());
}

function applyTranslations(lang) {
  const dict = TRANSLATIONS[lang];
  document.documentElement.lang = lang;
  document.documentElement.dir = (lang === 'ar') ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) el.textContent = dict[key];
  });
}

// Logging
async function logEvent(payload, opts={}) {
  const body = JSON.stringify(payload);
  // Use sendBeacon when possible for unload scenarios
  if (opts.beacon && navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' });
    navigator.sendBeacon('/api/log', blob);
    return;
  }
  try {
    await fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: !!opts.keepalive
    });
  } catch(e) {
    // ignore
  }
}

// Session handling
(function initSession(){
  const url = new URL(location.href);
  const sid = url.searchParams.get('sid') || localStorage.getItem('session_id') || uuidv4();
  window.__sessionId = sid;
  localStorage.setItem('session_id', sid);
  if (!url.searchParams.get('sid')) {
    url.searchParams.set('sid', sid);
    history.replaceState({}, '', url.toString());
  }
})();

// Expose helpers globally
window.__siteUtils = { getLang, setLang, applyTranslations, logEvent };
