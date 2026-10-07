(function () {
  var btn = document.querySelector('.menu-btn');
  var list = document.querySelector('nav ul');
  if (btn && list) {
    btn.addEventListener('click', function () {
      var open = list.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
    });
  }

  var base = document.body.getAttribute('data-base') || '';
  var ready = window.FJKMI18n ? window.FJKMI18n.init(base) : Promise.resolve();
  if (window.FJKMRender) {
    ready.then(function () {
      window.FJKMRender.init();
      document.addEventListener('fjkm:langchange', window.FJKMRender.init);
    });
  }
})();
