/* Not For Sale stories hub: the pictures move only while they are on screen (the theme's app.js
   does the fade-in reveals). The lead story's phone tilts toward the pointer. */
(function () {
  'use strict';
  document.documentElement.classList.add('hub-js');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      var el = e.target, on = e.isIntersecting, svg = el.querySelector(':scope > svg');
      if (on) el.classList.add('is-in');
      el.classList.toggle('is-live', on);
      if (svg && svg.pauseAnimations && !reduce) { if (on) svg.unpauseAnimations(); else svg.pauseAnimations(); }
    });
  }, { threshold: .2 });
  Array.prototype.forEach.call(document.querySelectorAll('.hub-art'), function (el) {
    var svg = el.querySelector(':scope > svg');
    // the route and the minibus (SMIL) wait until on screen; with reduced motion they hold at the end of the ride
    if (svg && svg.pauseAnimations) { svg.pauseAnimations(); svg.setCurrentTime(reduce ? 8.5 : 0); }
    io.observe(el);
  });

  var feature = document.querySelector('.hub-feature'), phone = feature && feature.querySelector('.hub-phone');
  if (phone && !reduce && matchMedia('(hover: hover)').matches) {
    feature.addEventListener('pointermove', function (e) {
      var r = feature.getBoundingClientRect();
      phone.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 16 + 'deg');
      phone.style.setProperty('--rx', ((e.clientY - r.top) / r.height - .5) * -12 + 'deg');
    });
    feature.addEventListener('pointerleave', function () { phone.style.removeProperty('--ry'); phone.style.removeProperty('--rx'); });
  }
})();
