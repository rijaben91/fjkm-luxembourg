(function () {
  var btn = document.querySelector('.menu-btn');
  var list = document.querySelector('nav ul');
  if (btn && list) {
    btn.addEventListener('click', function () {
      var open = list.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
    });
  }

  var box = document.getElementById('events-list');
  if (!box) return;
  var limit = parseInt(box.getAttribute('data-limit'), 10) || 0;
  var base = box.getAttribute('data-base') || '';

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  fetch(base + 'data/events.json')
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var today = new Date().toISOString().slice(0, 10);
      var events = data.events.slice().sort(function (a, b) {
        return a.date < b.date ? -1 : 1;
      });
      var upcoming = events.filter(function (e) { return e.date >= today; });
      if (limit) upcoming = upcoming.slice(0, limit);
      if (!upcoming.length) {
        box.appendChild(el('p', '', 'Aucun événement à venir.'));
        return;
      }
      upcoming.forEach(function (e) {
        var c = el('article', 'card');
        var d = new Date(e.date + 'T00:00:00').toLocaleDateString('fr-FR', {
          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        });
        c.appendChild(el('p', 'date', d + (e.time ? ' – ' + e.time : '')));
        c.appendChild(el('h3', '', e.title));
        c.appendChild(el('p', '', e.group + ' · ' + e.location));
        c.appendChild(el('p', '', e.description));
        box.appendChild(c);
      });
    })
    .catch(function () {
      box.appendChild(el('p', '', 'Impossible de charger les événements.'));
    });
})();
