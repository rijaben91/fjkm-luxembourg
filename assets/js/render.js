(function () {
  function element(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function loadJson(path) {
    return fetch(path).then(function (response) {
      if (!response.ok) throw new Error('Chargement impossible');
      return response.json();
    });
  }

  function renderGroups(box, groups, base) {
    if (!Array.isArray(groups) || !groups.length) throw new Error('Aucun groupe');
    groups.forEach(function (group) {
      var card = element('article', 'group-card');
      if (/^#[0-9a-f]{3,8}$/i.test(group.color || '')) {
        card.style.borderTopColor = group.color;
      }
      if (group.image) {
        var image = element('img', 'group-image');
        image.src = base + group.image;
        image.alt = group.nom;
        image.loading = 'lazy';
        card.appendChild(image);
      }
      var content = element('div', 'group-card-content');
      content.appendChild(element('h3', '', group.nom));
      if (group.slogan) content.appendChild(element('p', 'group-slogan', group.slogan));
      content.appendChild(element('p', '', group.description));
      if (box.getAttribute('data-view') === 'details') {
        [
          ['Public cible', group.public_cible],
          ['Horaires', group.horaires],
          ['Lieu', group.lieu],
          ['Contact', group.contact]
        ].forEach(function (item) {
          if (!item[1]) return;
          var detail = element('p', 'group-detail');
          detail.appendChild(element('strong', '', item[0] + ' : '));
          detail.appendChild(document.createTextNode(item[1]));
          content.appendChild(detail);
        });
        if (Array.isArray(group.activites) && group.activites.length) {
          content.appendChild(element('h4', '', 'Activités'));
          var activities = element('ul', 'activity-list');
          group.activites.forEach(function (activity) {
            activities.appendChild(element('li', '', activity));
          });
          content.appendChild(activities);
        }
      }
      card.appendChild(content);
      box.appendChild(card);
    });
  }

  function renderEvents(box, data) {
    if (!data || !Array.isArray(data.events)) throw new Error('Événements indisponibles');
    var today = new Date().toISOString().slice(0, 10);
    var events = data.events.slice().sort(function (a, b) {
      return a.date < b.date ? -1 : 1;
    }).filter(function (event) {
      return event.date >= today;
    });
    var limit = parseInt(box.getAttribute('data-limit'), 10) || 0;
    if (limit) events = events.slice(0, limit);
    if (!events.length) {
      box.appendChild(element('p', '', 'Aucun événement à venir.'));
      return;
    }
    events.forEach(function (event) {
      var card = element('article', 'card');
      var date = new Date(event.date + 'T00:00:00').toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      });
      card.appendChild(element('p', 'date', date + (event.time ? ' – ' + event.time : '')));
      card.appendChild(element('h3', '', event.title));
      card.appendChild(element('p', '', event.group + ' · ' + event.location));
      card.appendChild(element('p', '', event.description));
      box.appendChild(card);
    });
  }

  function renderSiteInfo(data) {
    if (data.title) document.title = document.title.replace(/FJKM Luxembourg(?: Fanasina)?/, data.title);
    document.querySelectorAll('[data-site-field]').forEach(function (node) {
      var value = data[node.getAttribute('data-site-field')];
      if (value === undefined) return;
      if (node.tagName === 'A') {
        node.href = 'mailto:' + value;
        node.textContent = value;
      } else {
        node.textContent = value;
      }
    });
  }

  function renderCollection(selector, path, renderer) {
    document.querySelectorAll(selector).forEach(function (box) {
      var base = box.getAttribute('data-base') || '';
      loadJson(base + path).then(function (data) {
        renderer(box, data, base);
      }).catch(function () {
        box.appendChild(element('p', 'load-error', 'Impossible de charger ce contenu pour le moment.'));
      });
    });
  }

  window.FJKMRender = {
    init: function () {
      renderCollection('[data-groups]', 'data/groups.json', function (box, data, base) {
        renderGroups(box, data.groups, base);
      });
      renderCollection('[data-events]', 'data/events.json', function (box, data) {
        renderEvents(box, data);
      });
      var base = document.body.getAttribute('data-base') || '';
      loadJson(base + 'data/site.json').then(function (data) {
        renderSiteInfo(data);
      }).catch(function () {
        document.querySelectorAll('[data-site-error]').forEach(function (node) {
          node.textContent = 'Les informations pratiques ne sont pas disponibles pour le moment.';
        });
      });
    }
  };
})();
