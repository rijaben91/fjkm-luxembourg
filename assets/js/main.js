(function () {
  var btn = document.querySelector('.menu-btn');
  var list = document.querySelector('nav ul');
  if (btn && list) {
    btn.addEventListener('click', function () {
      var open = list.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
    });
  }

  if (window.FJKMRender) window.FJKMRender.init();
})();
