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
      // startViewTransition lives on `document`, NOT on documentElement —
      // checking it on `root` is always undefined, which silently sends every
      // switch down this fallback and the wipe never runs.
      if (!document.startViewTransition || reduced) {
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

      // `document` starts the transition; `root` is what carries the
      // pseudo-elements the clip-path below animates.
      var vt = document.startViewTransition(function () { applyTheme(next); });

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

  /* ── Hamburger ──────────────────────────────────────────── */
  // The panel is shown by CSS at the phone breakpoint; this only manages the
  // open state, so on wider screens the class is inert and the nav is always
  // visible whatever the button last did.
  var navToggle = document.getElementById('navToggle');
  var topnav = document.getElementById('topnav');

  if (navToggle && topnav) {
    function setNav(open) {
      topnav.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }

    navToggle.addEventListener('click', function () {
      setNav(topnav.classList.contains('is-open') === false);
    });

    // Following a link should close it — the target is behind the panel.
    Array.prototype.forEach.call(topnav.querySelectorAll('a'), function (a) {
      a.addEventListener('click', function () { setNav(false); });
    });

    document.addEventListener('click', function (e) {
      if (!topnav.contains(e.target) && !navToggle.contains(e.target)) setNav(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setNav(false);
    });
  }

  /* ── Screenshot carousel ────────────────────────────────── */
  // Controls for the phone-width carousel. Injected rather than written into
  // the markup so a group with a single screenshot never gets arrows, and so
  // the page without JS is still a swipeable scroller.
  Array.prototype.forEach.call(
    document.querySelectorAll('.shots'),
    function (strip) {
      var shots = strip.querySelectorAll('.shot');
      if (shots.length < 2) return;

      var nav = document.createElement('div');
      nav.className = 'shots-nav';

      var prev = document.createElement('button');
      prev.type = 'button';
      prev.textContent = '‹';
      prev.setAttribute('aria-label', 'Previous screenshot');

      var next = document.createElement('button');
      next.type = 'button';
      next.textContent = '›';
      next.setAttribute('aria-label', 'Next screenshot');

      var count = document.createElement('span');
      count.className = 'shots-count';

      nav.appendChild(prev);
      nav.appendChild(next);
      nav.appendChild(count);
      strip.parentNode.insertBefore(nav, strip.nextSibling);

      function index() {
        // Which shot is nearest the centre of the viewport of the scroller.
        return Math.round(strip.scrollLeft / (strip.scrollWidth / shots.length));
      }

      function paint() {
        var i = Math.min(index(), shots.length - 1);
        count.textContent = (i + 1) + ' / ' + shots.length;
        prev.disabled = i <= 0;
        next.disabled = i >= shots.length - 1;
      }

      function go(step) {
        var target = shots[Math.max(0, Math.min(shots.length - 1, index() + step))];
        if (target) {
          strip.scrollTo({ left: target.offsetLeft - strip.offsetLeft, behavior: 'smooth' });
        }
      }

      prev.addEventListener('click', function () { go(-1); });
      next.addEventListener('click', function () { go(1); });
      strip.addEventListener('scroll', paint, { passive: true });
      paint();
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

    // On phones the carousel already shows one screenshot at a time, so a
    // full-screen dialog on top of it is a second viewer over the first.
    // Checked per click rather than once, so rotating the device is handled.
    var phone = window.matchMedia('(max-width:640px)');

    Object.keys(groups).forEach(function (g) {
      groups[g].forEach(function (btn, i) {
        btn.addEventListener('click', function () {
          if (phone.matches) return;
          groupKey = g;
          current = groups[g];
          show(i);
          lb.showModal();
        });
      });
    });

    // If the viewport narrows while it's open — rotation, or a resized
    // window — close it rather than leaving a modal that can't be reached.
    phone.addEventListener('change', function (e) {
      if (e.matches && lb.open) lb.close();
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
     'Panzi — an AI smart pantry app, built with a team and running on iOS with real accounts. You photograph your shelf; it logs the items, reads or estimates use-by dates, warns before food goes off and suggests Filipino recipes from what you have. He also built its admin console: usage, users, recipes, AI API costs and an audit log.'],
    ['Biggest project?',
     'CarGO — a full ride-hailing and parcel platform: a native Android app for riders and drivers plus a web ops console. Driver onboarding, bookings, GCash payouts, SOS alerts, audit logs. 33 Supabase edge functions behind it.'],
    ['What is his stack?',
     'Web: HTML, CSS, JavaScript, TypeScript, PHP, React. Mobile: Kotlin, React Native, Android Studio. Backend: Supabase, PostgreSQL, Firebase, Python, MySQL. Design and video: Photoshop, Illustrator, After Effects, Figma, plus Google Flow, ElevenLabs and CapCut.'],
    ['What is the AI video work?',
     'Freelance short-form product ads for TikTok, end to end. He researches the ads already performing in the niche, writes the hook and script with Claude, generates the footage in Google Flow, voices it in ElevenLabs and cuts it in CapCut. The client posts the finished video. Most recently he delivered 18 ads to one e-commerce client in nine days, each in an American and an Asian version.'],
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

  /* ── Back to top ────────────────────────────────────────── */
  // Shown once the contact block enters view — the bottom of the page. An
  // observer on that section rather than a scroll handler, so nothing runs
  // on every frame of a scroll.
  var toTop = document.getElementById('toTop');
  var contact = document.getElementById('contact');

  if (toTop) {
    if (contact && window.IntersectionObserver) {
      var atBottom = new IntersectionObserver(function (entries) {
        toTop.classList.toggle('is-on', entries[0].isIntersecting);
      }, { rootMargin: '0px 0px -25% 0px', threshold: 0 });
      atBottom.observe(contact);
    } else {
      // No observer: better a button that's always there than one that never
      // appears, since it can't be reached any other way.
      toTop.classList.add('is-on');
    }

    toTop.addEventListener('click', function () {
      var reducedNow = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      try {
        window.scrollTo({ top: 0, behavior: reducedNow ? 'auto' : 'smooth' });
      } catch (e) {
        window.scrollTo(0, 0);   // older browsers reject the options object
      }
    });
  }

  /* ── Guide cursor ───────────────────────────────────────── */
  // A second pointer with a name tag that tours the hero once per browser
  // session: it reaches for each thing, types a line about it, then drifts
  // off the right edge and leaves a "take the tour again" pill behind.
  //
  // Everything runs off one rAF clock, so the tour simply stops while the
  // tab is hidden or the assistant / screenshot viewer is open, and picks up
  // where it was. `goal` is where the hand means to be; `shown` chases it on
  // a damped spring, so nothing ever snaps.
  (function () {
    var guide = document.getElementById('guide');
    var promptEl = document.getElementById('guidePrompt');
    var desktop = window.matchMedia && window.matchMedia(
      '(min-width:1024px) and (hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)');
    if (!guide || !promptEl || !desktop || !desktop.matches || !window.Promise) return;

    var tag = guide.querySelector('.gd-tag');
    var nameEl = guide.querySelector('.gd-name');
    var clip = guide.querySelector('.gd-clip');
    var textEl = guide.querySelector('.gd-clip .gd-text');
    var measure = guide.querySelector('.gd-measure');
    var caret = guide.querySelector('.gd-caret');
    var chatPanel = document.getElementById('chatPanel');
    var viewer = document.getElementById('lightbox');
    var graphemes = window.Intl && Intl.Segmenter ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null;

    function rand(min, max) { return min + Math.random() * (max - min); }
    function clamp(v, min, max) { return Math.min(Math.max(v, min), max); }
    function all(selector) { return Array.prototype.slice.call(document.querySelectorAll(selector)); }

    function store(key, value) {
      try {
        if (value === undefined) return sessionStorage.getItem(key);
        sessionStorage.setItem(key, value);
      } catch (e) { /* storage blocked: the tour just plays every load */ }
      return null;
    }

    // In order. A step whose targets are off screen is skipped; a `free` one
    // falls back to open space in the middle of the viewport.
    var steps = [
      { els: function () { return all('.hero h1'); }, at: 'above', free: true,
        text: "Hi! I'm Derrick, welcome to my portfolio! 👋" },
      { els: function () { return all('.hero .actions .btn, .hero .actions .copy-btn'); }, at: 'below',
        text: 'Email me here, or just copy my address.' },
      { els: function () { return all('.hero .facts'); }, at: 'left',
        text: 'The short version: school, course, track and grad year.' },
      { els: function () { return all('#topnav a'); }, at: 'below',
        text: 'Jump straight to any section from up here.' },
      { els: function () { return all('#themeToggle'); }, at: 'on',
        text: 'Prefer it dark? Flip the theme here.' },
      { els: function () { return all('#chatToggle'); }, at: 'on',
        text: 'Got questions? Ask my assistant anything about me.' },
      { free: true, text: "That's the tour. Scroll around and enjoy! ✌️" }
    ];

    // ── Clock ──
    var SPRING = 190, DAMPING = 2 * Math.sqrt(SPRING) * 0.82;
    var goal = { x: 0, y: 0 };
    var shown = { x: 0, y: 0, vx: 0, vy: 0 };
    var waiters = [];
    var clock = 0, last = 0, running = false, away = false;
    var move = null, rest = null, hovered = null, typing = false, tremor = 1;

    function isAway() {
      return (chatPanel && !chatPanel.hidden) || (viewer && viewer.open);
    }

    function frame(now) {
      if (!running) return;
      var dt = Math.min(now - last, 50);
      last = now;

      var nowAway = isAway();
      if (nowAway !== away) {
        away = nowAway;
        guide.classList.toggle('is-away', away);
      }

      if (!away) {
        clock += dt;

        if (move) {
          var p = Math.min((clock - move.t0) / move.dur, 1);
          var u = Math.pow(p, move.skew);                      // quick launch, long settle
          var e = u * u * u * (u * (u * 6 - 15) + 10);         // minimum-jerk, the way a hand moves
          var to = move.to();
          var bow = 3 * (1 - e) * (1 - e) * e * move.b1 + 3 * (1 - e) * e * e * move.b2;
          goal.x = move.from.x + (to.x - move.from.x) * e + move.nx * bow;
          goal.y = move.from.y + (to.y - move.from.y) * e + move.ny * bow;
          if (p === 1) {
            var done = move.done;
            rest = move.to;
            move = null;
            done();
          }
        } else if (rest) {
          var at = rest();                                     // stay pinned to the target if the page moves
          goal.x = at.x; goal.y = at.y;
        }

        // Sub-stepped so a long frame can't make the spring overshoot wildly.
        var hops = Math.ceil(dt / 12), h = dt / hops / 1000;
        for (var i = 0; i < hops; i++) {
          shown.vx += (SPRING * (goal.x - shown.x) - DAMPING * shown.vx) * h;
          shown.vy += (SPRING * (goal.y - shown.y) - DAMPING * shown.vy) * h;
          shown.x += shown.vx * h;
          shown.y += shown.vy * h;
        }

        // A resting hand is never perfectly still — except while it types.
        tremor += ((typing ? 0 : 1) - tremor) * Math.min(dt / 280, 1);
        var x = shown.x + (Math.sin(clock / 830 + 1.3) * 1.5 + Math.sin(clock / 310 + 4.1) * 0.6) * tremor;
        var y = shown.y + (Math.cos(clock / 1010 + 0.4) * 1.3 + Math.sin(clock / 370 + 2.2) * 0.55) * tremor;
        guide.style.transform = 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0)';

        for (var w = waiters.length - 1; w >= 0; w--) {
          if (waiters[w].at <= clock) waiters.splice(w, 1)[0].done();
        }
      }
      requestAnimationFrame(frame);
    }

    function sleep(ms) {
      return new Promise(function (done) { waiters.push({ at: clock + ms, done: done }); });
    }

    // One continuous stroke to a live point, bowed to one side (sometimes an
    // S-curve) so no two reaches follow the same path.
    function glide(to, dur) {
      return new Promise(function (done) {
        var from = { x: goal.x, y: goal.y }, target = to();
        var dx = target.x - from.x, dy = target.y - from.y, dist = Math.hypot(dx, dy) || 1;
        var b1 = Math.min(dist * rand(0.08, 0.28), 64) * (Math.random() < 0.5 ? -1 : 1);
        var b2 = Math.random() < 0.3 ? -b1 * rand(0.3, 0.8) : b1 * rand(0.4, 1.1);
        move = { from: from, to: to, t0: clock, dur: dur, skew: rand(0.72, 0.94),
                 nx: -dy / dist, ny: dx / dist, b1: b1, b2: b2, done: done };
      });
    }

    // Lands a few pixels off each time, and on a long reach sometimes over- or
    // undershoots before a small corrective nudge.
    function moveTo(to, opts) {
      opts = opts || {};
      var off = { x: rand(-2.5, 2.5), y: rand(-1.5, 1.5) };
      var aim = opts.direct ? to : function () { var t = to(); return { x: t.x + off.x, y: t.y + off.y }; };
      var target = aim(), dx = target.x - goal.x, dy = target.y - goal.y, dist = Math.hypot(dx, dy) || 1;
      var dur = (opts.dur || clamp(210 + Math.sqrt(dist) * 25, 330, 1000)) * rand(0.88, 1.15);
      var roll = Math.random();
      if (opts.direct || dist < 160 || roll > 0.65) return glide(aim, dur);

      var miss = clamp(dist * rand(0.025, 0.06), 5, 22) * (roll < 0.4 ? 1 : -1);
      var drift = rand(-0.5, 0.5) * miss;
      var ox = dx / dist * miss - dy / dist * drift, oy = dy / dist * miss + dx / dist * drift;
      return glide(function () { var t = aim(); return { x: t.x + ox, y: t.y + oy }; }, dur)
        .then(function () { return sleep(rand(40, 110)); })
        .then(function () { return glide(aim, rand(140, 230)); });
    }

    // ── Targets ──
    function visible(el) {
      var r = el.getBoundingClientRect();
      return r.width > 0 && r.top >= 0 && r.bottom <= innerHeight;
    }

    function anchor(el, at) {
      return function () {
        var r = el.getBoundingClientRect();
        if (at === 'above') return { x: r.left + 6, y: r.top - 24 };
        if (at === 'below') return { x: r.left + r.width / 2, y: r.bottom + 2 };
        if (at === 'left') return { x: r.left - 10, y: r.top + r.height / 2 };
        if (at === 'on') return { x: r.left + r.width * 0.55, y: r.top + r.height * 0.6 };
        return { x: r.right + 5, y: r.top + r.height / 2 };
      };
    }

    function openSpace() {
      var point = { x: innerWidth * rand(0.44, 0.56), y: innerHeight * rand(0.4, 0.5) };
      return function () { return point; };
    }

    function setHover(el) {
      if (hovered) hovered.classList.remove('is-guided');
      hovered = el || null;
      if (hovered) hovered.classList.add('is-guided');
    }

    // ── Bubble ──
    function compose(text) {
      var parts = graphemes
        ? Array.from(graphemes.segment(text), function (s) { return s.segment; })
        : Array.from(text);
      var chars = parts.map(function (part) {
        var span = document.createElement('span');
        span.className = 'gd-ch';
        span.textContent = part;
        return span;
      });
      measure.replaceChildren.apply(measure, chars);
      var boxes = chars.map(function (span) {
        return { right: span.offsetLeft + span.offsetWidth, top: span.offsetTop, bottom: span.offsetTop + span.offsetHeight };
      });
      // Rounded up: a fraction of a pixel short and the last word wraps
      // differently in the bubble than it did here.
      return { parts: parts, chars: chars, boxes: boxes,
               width: Math.ceil(measure.getBoundingClientRect().width), height: measure.offsetHeight };
    }

    // Flip the bubble above and/or left of the arrow when it would run off screen.
    function place(point, layout, prefer) {
      var w = Math.max(nameEl.offsetWidth, layout.width) + 22;
      var h = nameEl.offsetHeight + layout.height + 10;
      var fitsBelow = point.y + 19 + h + 10 <= innerHeight;
      var fitsAbove = point.y - h - 10 >= 0;
      guide.classList.toggle('is-up', fitsAbove && (prefer === 'above' || !fitsBelow));
      guide.classList.toggle('is-left', point.x + 16 + w + 10 > innerWidth);
    }

    function type(layout) {
      textEl.style.width = layout.width + 'px';
      textEl.replaceChildren.apply(textEl, layout.chars.concat(caret));
      tag.classList.add('is-talking', 'is-typing');
      typing = true;
      var pace = rand(0.85, 1.25), width = 0, i = 0;

      function next() {
        if (i >= layout.chars.length) {
          typing = false;
          tag.classList.remove('is-typing');
          return Promise.resolve();
        }
        var box = layout.boxes[i], part = layout.parts[i];
        layout.chars[i].classList.add('is-on');
        width = Math.max(width, box.right);
        clip.style.width = Math.ceil(width) + 2 + 'px';
        clip.style.height = box.bottom + 'px';
        caret.style.transform = 'translate(' + box.right + 'px,' + box.top + 'px)';

        var wait = rand(7, 20) * pace;
        if (/[.!?]/.test(part)) wait = rand(80, 150);
        else if (/[,:]/.test(part)) wait = rand(45, 90);
        else if (part === ' ' && Math.random() < 0.12) wait += rand(60, 150);   // thinking of the next word
        else if (Math.random() < 0.07) wait += rand(30, 80);                    // a small stumble
        i++;
        return sleep(wait).then(next);
      }
      return next();
    }

    function hush() {
      clip.style.width = clip.style.height = '0px';
      tag.classList.remove('is-talking', 'is-typing');
    }

    function say(step) {
      var els = step.els ? step.els().filter(visible) : [];
      if (!els.length && !step.free) return Promise.resolve();
      var points = els.length
        ? els.map(function (el) { return anchor(el, step.at); })
        : [openSpace()];
      var layout = compose(step.text);
      hush();
      place(points[0](), layout, els.length ? step.at : null);
      setHover(els[0]);

      return moveTo(points[0])
        .then(function () { return sleep(rand(60, 140)); })
        .then(function () { return type(layout); })
        .then(function () {
          if (points.length < 2) return sleep((850 + layout.chars.length * 20) * rand(0.95, 1.15));
          // A group: let the line land, then sweep across the rest of it.
          var chain = sleep(rand(550, 800));
          points.slice(1).forEach(function (point, k) {
            chain = chain
              .then(function () { return sleep(rand(90, 190)); })
              .then(function () { setHover(els[k + 1]); return moveTo(point, { dur: rand(240, 340) }); });
          });
          return chain.then(function () { return sleep(rand(550, 750)); });
        })
        .then(function () { setHover(null); });
    }

    // ── Replay pill ──
    function showPrompt() {
      if (store('pf-tour-prompt') !== 'off') promptEl.classList.add('is-on');
    }

    promptEl.querySelector('[data-guide-replay]').addEventListener('click', function () {
      promptEl.classList.remove('is-on');
      start();
    });
    promptEl.querySelector('[data-guide-dismiss]').addEventListener('click', function () {
      promptEl.classList.remove('is-on');
      store('pf-tour-prompt', 'off');
    });

    function run() {
      var chain = sleep(500).then(function () {
        guide.classList.add('is-here');
        store('pf-tour-seen', '1');
      });
      steps.forEach(function (step) {
        chain = chain.then(function () { return say(step); });
      });
      // Tour over: wander off the right edge.
      return chain
        .then(function () { hush(); return sleep(rand(300, 500)); })
        .then(function () {
          var exit = { x: innerWidth + 90, y: innerHeight * rand(0.18, 0.42) };
          return moveTo(function () { return exit; }, { direct: true });
        })
        .then(function () { guide.classList.remove('is-here'); return sleep(500); })
        .then(function () { running = false; showPrompt(); });
    }

    // Enters from just off the right edge.
    function start() {
      if (running) return;
      running = true;
      move = rest = null;
      goal.x = shown.x = innerWidth + 40;
      goal.y = shown.y = innerHeight * rand(0.5, 0.7);
      shown.vx = shown.vy = 0;
      guide.classList.remove('is-up', 'is-left');
      guide.style.transform = 'translate3d(' + goal.x + 'px,' + goal.y + 'px,0)';
      requestAnimationFrame(function (now) { last = now; frame(now); });
      run();
    }

    // Plays by itself once per browser session (or with ?tour in the URL);
    // after that it's on request from the pill.
    if (store('pf-tour-seen') !== '1' || /[?&]tour\b/.test(location.search)) start();
    else showPrompt();
  })();

  /* ── Footer year ────────────────────────────────────────── */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
