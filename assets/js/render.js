(function () {
  function element(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function t(key) {
    var text = window.FJKMI18n && window.FJKMI18n.t(key);
    return text === undefined || text === false ? key : text;
  }

  function tr(item, field) {
    return window.FJKMI18n ? window.FJKMI18n.localized(item, field) : item[field];
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
        image.alt = tr(group, 'nom');
        image.loading = 'lazy';
        card.appendChild(image);
      }
      var content = element('div', 'group-card-content');
      content.appendChild(element('h3', '', tr(group, 'nom')));
      if (tr(group, 'slogan')) content.appendChild(element('p', 'group-slogan', tr(group, 'slogan')));
      content.appendChild(element('p', '', tr(group, 'description')));
      if (box.getAttribute('data-view') === 'details') {
        [
          [t('groups.targetAudience'), tr(group, 'public_cible')],
          [t('groups.schedule'), tr(group, 'horaires')],
          [t('groups.place'), tr(group, 'lieu')],
          [t('groups.contact'), tr(group, 'contact')]
        ].forEach(function (item) {
          if (!item[1]) return;
          var detail = element('p', 'group-detail');
          detail.appendChild(element('strong', '', item[0] + ' : '));
          detail.appendChild(document.createTextNode(item[1]));
          content.appendChild(detail);
        });
        var activityList = tr(group, 'activites');
        if (Array.isArray(activityList) && activityList.length) {
          content.appendChild(element('h4', '', t('groups.activities')));
          var activities = element('ul', 'activity-list');
          activityList.forEach(function (activity) {
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
    if (!data || !Array.isArray(data.events)) throw new Error(t('events.unavailable'));
    var today = new Date().toISOString().slice(0, 10);
    var events = data.events.slice().sort(function (a, b) {
      return a.date < b.date ? -1 : 1;
    }).filter(function (event) {
      return event.date >= today;
    });
    var limit = parseInt(box.getAttribute('data-limit'), 10) || 0;
    if (limit) events = events.slice(0, limit);
    if (!events.length) {
      box.appendChild(element('p', '', t('events.none')));
      return;
    }
    events.forEach(function (event) {
      var card = element('article', 'card');
      var date = window.FJKMI18n
        ? window.FJKMI18n.formatDate(new Date(event.date + 'T00:00:00'))
        : event.date;
      card.appendChild(element('p', 'date', date + (event.time ? ' – ' + event.time : '')));
      card.appendChild(element('h3', '', tr(event, 'title')));
      card.appendChild(element('p', '', tr(event, 'group') + ' · ' + tr(event, 'location')));
      card.appendChild(element('p', '', tr(event, 'description')));
      box.appendChild(card);
    });
  }

  function renderSiteInfo(data) {
    document.querySelectorAll('[data-site-error]').forEach(function (node) {
      node.textContent = '';
    });
    var title = tr(data, 'title');
    if (title) document.title = document.title.replace(/FJKM Luxembourg(?: Fanasina)?/, title);
    document.querySelectorAll('[data-site-field]').forEach(function (node) {
      var value = tr(data, node.getAttribute('data-site-field'));
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
      box.textContent = '';
      loadJson(base + path).then(function (data) {
        renderer(box, data, base);
      }).catch(function () {
        box.appendChild(element('p', 'load-error', t('error.load')));
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
          node.textContent = t('error.site');
        });
      });
    }
  };
})();
