/* ═══════════════════════════════════════════════════════════
   Derrick John F. Azaola — portfolio
   Theme · nav highlight · screenshot viewer · compare · assistant
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var EMAIL = 'djazaola24@gmail.com';

  /* ── Theme ──────────────────────────────────────────────── */
  var root = document.documentElement;
  var toggle = document.getElementById('themeToggle');
  var label = document.getElementById('themeLabel');

  function readTheme() {
    try {
      var saved = localStorage.getItem('pf-theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) { /* storage blocked */ }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark' : 'light';
  }

  function paintLabel(theme) {
    if (label) label.textContent = theme === 'dark' ? 'DARK' : 'LIGHT';
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    paintLabel(theme);
    try { localStorage.setItem('pf-theme', theme); } catch (e) { /* ignore */ }
  }

  paintLabel(readTheme());

  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = readTheme() === 'dark' ? 'light' : 'dark';
      var reduced = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // No view transitions, or the visitor asked for less motion: ramp the
      // colours with a plain CSS transition instead of snapping.
      if (!root.startViewTransition || reduced) {
        root.classList.add('theming');
        applyTheme(next);
        window.setTimeout(function () { root.classList.remove('theming'); }, 560);
        return;
      }

      // The new palette is revealed by a circle growing out of the toggle.
      // The radius is the distance to the furthest corner — anything smaller
      // and the wipe finishes before it has covered the page.
      var rect = toggle.getBoundingClientRect();
      var x = rect.left + rect.width / 2;
      var y = rect.top + rect.height / 2;
      var far = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );

      var vt = root.startViewTransition(function () { applyTheme(next); });

      // Wait for `ready`: the snapshots don't exist until then, so animating
      // the pseudo-element any earlier silently does nothing.
      vt.ready.then(function () {
        root.animate(
          {
            clipPath: [
              'circle(0px at ' + x + 'px ' + y + 'px)',
              'circle(' + far + 'px at ' + x + 'px ' + y + 'px)'
            ]
          },
          {
            duration: 620,
            easing: 'cubic-bezier(.3,.7,.2,1)',
            pseudoElement: '::view-transition-new(root)'
          }
        );
      }).catch(function () { /* transition skipped; the theme still applied */ });
    });
  }

  /* ── Copy email ─────────────────────────────────────────── */
  Array.prototype.forEach.call(
    document.querySelectorAll('[data-copy-email]'),
    function (btn) {
      var original = btn.textContent;
      var revert = null;

      function flash(text) {
        btn.textContent = text;
        btn.classList.add('is-copied');
        window.clearTimeout(revert);
        revert = window.setTimeout(function () {
          btn.textContent = original;
          btn.classList.remove('is-copied');
        }, 1800);
      }

      // Last resort for browsers without the clipboard API, or an insecure
      // origin where it's blocked: select the text so Ctrl+C still works.
      function selectInstead() {
        try {
          var range = document.createRange();
          range.selectNodeContents(btn);
          var sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        } catch (e) { /* nothing more to offer */ }
      }

      btn.addEventListener('click', function () {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(EMAIL).then(
            function () { flash('copied ✓'); },
            function () { selectInstead(); flash('press Ctrl+C'); }
          );
        } else {
          selectInstead();
          flash('press Ctrl+C');
        }
      });
    }
  );

  /* ── Nav highlight ──────────────────────────────────────── */
  // An observer rather than a scroll handler: the browser does the maths off
  // the main thread, so this costs nothing while scrolling.
  var navLinks = document.querySelectorAll('.topnav a');

  if (navLinks.length && window.IntersectionObserver) {
    var linkFor = {};
    var sections = [];

    Array.prototype.forEach.call(navLinks, function (a) {
      var id = a.getAttribute('href').slice(1);
      var section = document.getElementById(id);
      if (section) {
        linkFor[id] = a;
        sections.push(section);
      }
    });

    // Sections are taller than the viewport, so "is it visible" isn't the
    // question — this narrows the observed band to a strip under the bar.
    var spy = new IntersectionObserver(function (entries) {
      Array.prototype.forEach.call(entries, function (entry) {
        if (!entry.isIntersecting) return;
        Array.prototype.forEach.call(navLinks, function (a) {
          a.classList.remove('is-current');
        });
        var link = linkFor[entry.target.id];
        if (link) link.classList.add('is-current');
      });
    }, { rootMargin: '-72px 0px -70% 0px', threshold: 0 });

    Array.prototype.forEach.call(sections, function (s) { spy.observe(s); });
  }

  /* ── Scroll reveal ──────────────────────────────────────── */
  var reduced = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reduced && window.IntersectionObserver) {
    var risers = new IntersectionObserver(function (entries, obs) {
      Array.prototype.forEach.call(entries, function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        obs.unobserve(entry.target);   // one-shot; it shouldn't replay
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });

    Array.prototype.forEach.call(
      document.querySelectorAll('[data-reveal]'),
      function (el) {
        el.classList.add('reveal');
        risers.observe(el);
      }
    );
  }

  /* ── Portrait swap ──────────────────────────────────────── */
  var portrait = document.querySelector('.portrait');
  if (portrait) {
    var photos = portrait.querySelectorAll('.ph');
    var broken = 0;

    Array.prototype.forEach.call(photos, function (img) {
      function fail() {
        img.classList.add('missing');
        broken++;
        if (broken >= photos.length) {
          portrait.style.cursor = 'default';
          portrait.removeAttribute('tabindex');
        }
      }
      img.addEventListener('error', fail);
      // Cached failures can land before this listener attaches.
      if (img.complete && img.naturalWidth === 0) fail();
    });

    portrait.addEventListener('click', function () {
      portrait.classList.toggle('is-touched');
    });
    document.addEventListener('click', function (e) {
      if (!portrait.contains(e.target)) portrait.classList.remove('is-touched');
    });
  }

  /* ── Compare slider ─────────────────────────────────────── */
  Array.prototype.forEach.call(
    document.querySelectorAll('.compare'),
    function (frame) {
      var range = frame.querySelector('.cmp-range');
      if (!range) return;

      function paint() { frame.style.setProperty('--pos', range.value + '%'); }

      range.addEventListener('input', paint);
      range.addEventListener('change', paint);
      // Double-click resets to centre, which is otherwise fiddly to hit.
      frame.addEventListener('dblclick', function () {
        range.value = 50;
        paint();
      });
      paint();
    }
  );

  /* ── Screenshot viewer ──────────────────────────────────── */
  // Groups are read from the DOM rather than a parallel JS list, so adding a
  // screenshot is a markup change only and the two can never drift apart.
  var lb = document.getElementById('lightbox');

  if (lb && typeof lb.showModal === 'function') {
    var lbImg = lb.querySelector('.lb-img');
    var lbCap = lb.querySelector('.lb-cap');
    var lbProject = lb.querySelector('.lb-project');
    var lbCount = lb.querySelector('.lb-count');
    var lbThumbs = lb.querySelector('.lb-thumbs');
    var arrows = lb.querySelectorAll('.lb-arrow');

    var PROJECT_NAME = { cargo: 'CARGO', rqms: 'RQMS', clothe: 'CLOTHE COVE' };

    var groups = {};
    Array.prototype.forEach.call(
      document.querySelectorAll('.shot[data-group]'),
      function (btn) {
        var g = btn.getAttribute('data-group');
        (groups[g] = groups[g] || []).push(btn);
      }
    );

    var current = [];
    var groupKey = '';
    var index = 0;

    function paintThumbs() {
      lbThumbs.textContent = '';
      if (current.length < 2) return;
      current.forEach(function (btn, i) {
        var t = document.createElement('button');
        t.type = 'button';
        t.textContent = String(i + 1).padStart(2, '0');
        t.setAttribute('aria-label', btn.getAttribute('data-cap') || '');
        if (i === index) t.className = 'is-on';
        t.addEventListener('click', function () { show(i, i > index ? 1 : -1); });
        lbThumbs.appendChild(t);
      });
    }

    function show(i, dir) {
      index = (i + current.length) % current.length;
      var btn = current[index];
      var img = btn.querySelector('img');

      lbImg.src = img.getAttribute('src');
      lbImg.alt = img.getAttribute('alt') || '';
      lbCap.textContent = btn.getAttribute('data-cap') || '';
      lbProject.textContent = PROJECT_NAME[groupKey] || '';
      lbCount.textContent = current.length > 1
        ? (index + 1) + ' / ' + current.length
        : '';

      Array.prototype.forEach.call(arrows, function (a) {
        a.hidden = current.length < 2;
      });

      // Restart the slide. Removing the class isn't enough on its own —
      // re-adding it in the same frame is a no-op unless the layout is read
      // in between, which is what offsetWidth forces.
      lbImg.classList.remove('is-next', 'is-prev');
      if (dir) {
        void lbImg.offsetWidth;
        lbImg.classList.add(dir > 0 ? 'is-next' : 'is-prev');
      }
      paintThumbs();
    }

    Object.keys(groups).forEach(function (g) {
      groups[g].forEach(function (btn, i) {
        btn.addEventListener('click', function () {
          groupKey = g;
          current = groups[g];
          show(i);
          lb.showModal();
        });
      });
    });

    Array.prototype.forEach.call(
      lb.querySelectorAll('[data-lb-step]'),
      function (btn) {
        btn.addEventListener('click', function () {
          var step = Number(btn.getAttribute('data-lb-step'));
          show(index + step, step);
        });
      }
    );

    Array.prototype.forEach.call(
      lb.querySelectorAll('[data-lb-close]'),
      function (btn) { btn.addEventListener('click', function () { lb.close(); }); }
    );

    // The dialog fills the viewport, so a click landing on it rather than on
    // the image or a control means the backdrop was hit.
    lb.addEventListener('click', function (e) {
      if (e.target === lb) lb.close();
    });

    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1, 1); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); show(index - 1, -1); }
    });

    lb.addEventListener('close', function () { lbImg.removeAttribute('src'); });
  }

  /* ── Assistant ──────────────────────────────────────────── */
  // A local knowledge base, not a model: no API key, no network call, no cost,
  // and it can't invent a claim about him that isn't written here.
  var KB = [
    ['What is he building now?',
     'Panzi — an AI smart pantry system. You photograph your shelf; it recognises the items, tracks inventory, estimates freshness and suggests what to cook before anything spoils. React Native, Python and a vision API, built with a team.'],
    ['Biggest project?',
     'CarGO — a full ride-hailing and parcel platform: a native Android app for riders and drivers plus a web ops console. Driver onboarding, bookings, GCash payouts, SOS alerts, audit logs. 33 Supabase edge functions behind it.'],
    ['What is his stack?',
     'Web: HTML, CSS, JavaScript, TypeScript, PHP, React. Mobile: Kotlin, React Native, Android Studio. Backend: Supabase, PostgreSQL, Firebase, Python, MySQL. Plus Photoshop, Illustrator, After Effects and CapCut on the design side.'],
    ['Is he available?',
     'Yes — open to internships, junior developer roles and freelance work in development or AI video. Email djazaola24@gmail.com; he answers everything.'],
    ['Has he led a team?',
     'Yes. He led a five-person team on the Registrar Queue Management System — a public display board, a staff console with priority and no-show handling, and printable tickets with QR receipts.']
  ];

  var panel = document.getElementById('chatPanel');
  var log = document.getElementById('chatLog');
  var suggest = document.getElementById('chatSuggest');
  var fab = document.getElementById('chatToggle');
  var closeBtn = document.getElementById('chatClose');

  if (panel && log && suggest) {
    function say(who, text) {
      var el = document.createElement('div');
      el.className = 'msg msg-' + who;
      el.textContent = text;
      log.appendChild(el);
      log.scrollTop = log.scrollHeight;
    }

    say('a', "Hi — ask me anything about Derrick's work, stack or availability.");

    KB.forEach(function (pair) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = pair[0];
      b.addEventListener('click', function () {
        say('u', pair[0]);
        say('a', pair[1]);
      });
      suggest.appendChild(b);
    });

    function openChat() {
      panel.hidden = false;
      if (closeBtn) closeBtn.focus();
    }
    function closeChat() {
      panel.hidden = true;
      if (fab) fab.focus();
    }

    if (fab) {
      fab.addEventListener('click', function () {
        if (panel.hidden) openChat(); else closeChat();
      });
    }
    if (closeBtn) closeBtn.addEventListener('click', closeChat);

    Array.prototype.forEach.call(
      document.querySelectorAll('[data-open-chat]'),
      function (b) { b.addEventListener('click', openChat); }
    );

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) closeChat();
    });
  }

  /* ── Footer year ────────────────────────────────────────── */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
