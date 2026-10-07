(function () {
  var STORAGE_KEY = 'fjkm-lang';
  var DEFAULT_LANG = 'fr';
  var LANGS = ['fr', 'mg'];

  var messages = {};
  var dates = {};

  function isSupported(lang) {
    return LANGS.indexOf(lang) !== -1;
  }

  // La langue vient de l'URL (/fr/... ou /mg/...), reflétée par <html lang>.
  function detectLang() {
    var match = window.location.pathname.match(/\/(fr|mg)(?:\/|$)/);
    if (match) return match[1];
    var declared = document.documentElement.lang;
    return isSupported(declared) ? declared : DEFAULT_LANG;
  }

  var current = detectLang();

  function remember(lang) {
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}
  }

  function t(key, vars) {
    var text = (messages[current] && messages[current][key]) || (messages[DEFAULT_LANG] && messages[DEFAULT_LANG][key]);
    if (text === undefined) return undefined;
    if (vars) {
      Object.keys(vars).forEach(function (name) {
        text = text.replace('{' + name + '}', vars[name]);
      });
    }
    return text;
  }

  function localized(item, field) {
    var translation = item && item.i18n && item.i18n[current];
    if (translation && translation[field] !== undefined && translation[field] !== '') return translation[field];
    return item ? item[field] : undefined;
  }

  function formatDate(date) {
    var set = dates[current] || dates[DEFAULT_LANG];
    if (!set || !set.days || !set.months) return date.toISOString().slice(0, 10);
    return set.days[date.getDay()] + ' ' + date.getDate() + ' ' + set.months[date.getMonth()] + ' ' + date.getFullYear();
  }

  function apply(root) {
    root = root || document;
    document.documentElement.lang = current;
    root.querySelectorAll('[data-i18n]').forEach(function (node) {
      var text = t(node.getAttribute('data-i18n'));
      if (text !== undefined) node.textContent = text;
    });
    root.querySelectorAll('[data-i18n-attr]').forEach(function (node) {
      var vars = { n: node.getAttribute('data-i18n-n') };
      node.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var parts = pair.split(':');
        var text = parts.length === 2 ? t(parts[1], vars) : undefined;
        if (text !== undefined) node.setAttribute(parts[0], text);
      });
    });
    var select = root.querySelector('.lang-select');
    if (select) select.value = select.querySelector('option[lang="' + current + '"]').value;
  }

  function load(base) {
    return fetch((base || '') + 'data/i18n.json').then(function (response) {
      if (!response.ok) throw new Error('Traductions indisponibles');
      return response.json();
    }).then(function (data) {
      LANGS.forEach(function (lang) {
        messages[lang] = (data[lang] && data[lang].messages) || {};
        dates[lang] = (data[lang] && data[lang].dates) || {};
      });
    });
  }

  function bindSwitch() {
    var select = document.querySelector('.lang-select');
    if (!select) return;
    select.addEventListener('change', function () {
      var option = select.options[select.selectedIndex];
      remember(option.getAttribute('lang'));
      window.location.href = option.value + window.location.search + window.location.hash;
    });
  }

  // Le HTML contient le français : en cas d'échec du chargement, il reste affiché.
  function init(base) {
    remember(current);
    bindSwitch();
    return load(base).catch(function () {}).then(function () {
      apply();
    });
  }

  window.FJKMI18n = {
    languages: LANGS,
    defaultLang: DEFAULT_LANG,
    storageKey: STORAGE_KEY,
    getLang: function () { return current; },
    t: t,
    localized: localized,
    formatDate: formatDate,
    apply: apply,
    init: init
  };
})();
