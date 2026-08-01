/* ═══════════════════════════════════════════════════════════
   Derrick John F. Azaola — portfolio
   Theme toggle · nav highlight · assistant widget
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

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (label) label.textContent = theme === 'dark' ? 'LIGHT' : 'DARK';
  }

  applyTheme(readTheme());

  /* Both palettes are cross-faded as whole-page snapshots, which is the only
     way the background gradients blend too — CSS can't interpolate between
     two gradient images. The fade itself lives in styles.css; all this does
     is hand the swap to the browser so it has something to snapshot.

     Deliberately not gated on prefers-reduced-motion: this is a cross-fade
     with no movement, the thing reduced-motion users are spared is travel,
     and an unannounced full-page colour flip is the harsher option. The
     stylesheet shortens it under that setting instead. */
  function revealTheme(theme) {
    if (!document.startViewTransition) {
      // Older browsers: the CSS colour transitions carry what they can, and
      // the toggle's dot flips so the click still gets an answer.
      if (toggle) {
        toggle.classList.remove('is-switching');
        void toggle.offsetWidth; // restart the animation on a rapid re-click
        toggle.classList.add('is-switching');
      }
      applyTheme(theme);
      return;
    }

    document.startViewTransition(function () { applyTheme(theme); });
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      revealTheme(next);
      try { localStorage.setItem('pf-theme', next); } catch (e) { /* ignore */ }
    });

    toggle.addEventListener('animationend', function () {
      toggle.classList.remove('is-switching');
    });
  }

  /* ── Copy email ─────────────────────────────────────────── */
  // One in the hero, one in the closing contact block; each keeps its own
  // label and timer so confirming on one doesn't disturb the other.
  Array.prototype.forEach.call(
    document.querySelectorAll('[data-copy-email]'),
    function (btn) {
      var label = btn.textContent;
      var revert = null;

      function flash(text) {
        btn.textContent = text;
        btn.classList.add('is-copied');
        window.clearTimeout(revert);
        revert = window.setTimeout(function () {
          btn.textContent = label;
          btn.classList.remove('is-copied');
        }, 1600);
      }

      // Last resort for browsers without the clipboard API, or an insecure
      // origin where it's blocked: select the address so Ctrl+C still works.
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
            function () { flash('Copied ✓'); },
            function () { selectInstead(); flash('Press Ctrl+C'); }
          );
        } else {
          selectInstead();
          flash('Press Ctrl+C');
        }
      });
    }
  );

  /* ── Nav highlight ──────────────────────────────────────── */
  // Marks the section currently under the sticky bar. An observer rather than
  // a scroll handler: the browser does the maths off the main thread, so this
  // costs nothing while scrolling.
  var navLinks = document.querySelectorAll('.navpill-links a');

  if (navLinks.length && window.IntersectionObserver) {
    var linkFor = {};
    var targets = [];

    Array.prototype.forEach.call(navLinks, function (a) {
      var id = a.getAttribute('href').slice(1);
      var section = document.getElementById(id);
      if (section) {
        linkFor[id] = a;
        targets.push(section);
      }
    });

    // Sections are taller than the viewport, so "is it visible" isn't the
    // question — this narrows the observed band to a strip just under the bar
    // and highlights whichever section is crossing it.
    var spy = new IntersectionObserver(function (entries) {
      Array.prototype.forEach.call(entries, function (entry) {
        if (!entry.isIntersecting) return;
        Array.prototype.forEach.call(navLinks, function (a) {
          a.classList.remove('is-current');
        });
        var link = linkFor[entry.target.id];
        if (link) link.classList.add('is-current');
      });
    }, { rootMargin: '-84px 0px -75% 0px', threshold: 0 });

    Array.prototype.forEach.call(targets, function (s) { spy.observe(s); });
  }

  /* ── Scroll reveal ──────────────────────────────────────── */
  // The .reveal class is added here rather than in the markup, so a browser
  // without IntersectionObserver — or a visitor whose script never runs —
  // simply sees the finished page instead of a blank one.
  var reducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reducedMotion && window.IntersectionObserver) {
    // The hero is skipped on purpose: it's above the fold, and fading in the
    // first thing a visitor sees reads as the page loading slowly.
    var rise = document.querySelectorAll('.block, .card, .project, .pass');

    var riser = new IntersectionObserver(function (entries, obs) {
      Array.prototype.forEach.call(entries, function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        obs.unobserve(entry.target);   // one-shot; it shouldn't replay on the way back up
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.06 });

    Array.prototype.forEach.call(rise, function (el) {
      el.classList.add('reveal');
      riser.observe(el);
    });

    // Rows inside a list arrive one after another. The index is per list, so
    // each project list starts its count again from zero rather than
    // inheriting a growing delay from the section above it.
    Array.prototype.forEach.call(
      document.querySelectorAll('.project-list, .card'),
      function (list) {
        Array.prototype.forEach.call(
          list.querySelectorAll('.project, .feature-grid li, .stack-row li'),
          function (item, i) {
            // Capped: past about five the last row waits long enough that it
            // reads as the page still loading.
            item.style.setProperty('--i', Math.min(i, 5));
          }
        );
      }
    );
  }

  /* ── Screenshot viewer ──────────────────────────────────── */
  // Each .project-shots strip is its own group, so the arrows walk that
  // project's screenshots and don't wander into the next project's.
  var lb = document.getElementById('lightbox');

  if (lb && typeof lb.showModal === 'function') {
    var lbImg = lb.querySelector('.lightbox-img');
    var lbCap = lb.querySelector('.lightbox-cap');
    var arrows = lb.querySelectorAll('.lightbox-arrow');
    var group = [];
    var index = 0;

    function show(i, dir) {
      // Wrap at both ends so the arrows never dead-end.
      index = (i + group.length) % group.length;
      var link = group[index];
      var img = link.querySelector('img');

      lbImg.src = link.getAttribute('href');
      lbImg.alt = img ? img.getAttribute('alt') : '';
      lbCap.textContent = group.length > 1
        ? (index + 1) + ' / ' + group.length + ' — ' + lbImg.alt
        : lbImg.alt;

      Array.prototype.forEach.call(arrows, function (a) {
        a.hidden = group.length < 2;
      });

      // Restart the slide. Removing the class isn't enough on its own —
      // re-adding it in the same frame is a no-op unless the layout is read
      // in between, which is what offsetWidth forces.
      lbImg.classList.remove('is-next', 'is-prev');
      lbCap.classList.remove('is-step');
      if (dir) {
        void lbImg.offsetWidth;
        lbImg.classList.add(dir > 0 ? 'is-next' : 'is-prev');
        lbCap.classList.add('is-step');
      }
    }

    Array.prototype.forEach.call(
      document.querySelectorAll('.project-shots'),
      function (strip) {
        var links = strip.querySelectorAll('a');

        Array.prototype.forEach.call(links, function (link, i) {
          link.addEventListener('click', function (e) {
            // Leave the modifier combinations to the browser — someone
            // ctrl-clicking wants a background tab, not a dialog.
            if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
            e.preventDefault();
            group = Array.prototype.slice.call(links);
            show(i);
            lb.showModal();
          });
        });
      }
    );

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

    // The dialog element fills the viewport, so a click landing on it rather
    // than on the image means the backdrop was hit.
    lb.addEventListener('click', function (e) {
      if (e.target === lb) lb.close();
    });

    lb.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1, 1); }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); show(index - 1, -1); }
    });

    // Frees the memory once the viewer is dismissed.
    lb.addEventListener('close', function () { lbImg.removeAttribute('src'); });
  }

  /* ── Footer year ────────────────────────────────────────── */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ── Hero photo: hover swap, tap swap, graceful fallback ─── */
  var photoBox = document.querySelector('.hero-photo');
  if (photoBox) {
    var photos = photoBox.querySelectorAll('.photo');
    var broken = 0;

    Array.prototype.forEach.call(photos, function (img) {
      function fail() {
        img.classList.add('missing');
        broken++;
        // Both files absent → drop the hover affordance and the pointer
        // cursor so the placeholder doesn't pretend to be interactive.
        if (broken >= photos.length) {
          photoBox.classList.add('no-photos');
          photoBox.style.cursor = 'default';
          photoBox.removeAttribute('tabindex');
        }
      }
      img.addEventListener('error', fail);
      // Cached failures can land before this listener attaches.
      if (img.complete && img.naturalWidth === 0) fail();
    });

    // Touch devices have no hover: tap toggles, tapping elsewhere resets.
    photoBox.addEventListener('click', function () {
      if (photoBox.classList.contains('no-photos')) return;
      photoBox.classList.toggle('is-touched');
    });
    document.addEventListener('click', function (e) {
      if (!photoBox.contains(e.target)) photoBox.classList.remove('is-touched');
    });
  }

  /* ── Before/after comparison sliders ────────────────────── */
  // The <input type="range"> does the work — pointer, touch and keyboard
  // all arrive as 'input' events, so there's no drag maths to get wrong.
  Array.prototype.forEach.call(
    document.querySelectorAll('.compare'),
    function (box) {
      var range = box.querySelector('.compare-range');
      if (!range) return;

      function paint() {
        box.style.setProperty('--pos', range.value + '%');
      }
      range.addEventListener('input', paint);
      paint();

      // Double-click / double-tap snaps back to the middle.
      box.addEventListener('dblclick', function () {
        range.value = 50;
        paint();
      });
    }
  );

  /* ── Knowledge base ─────────────────────────────────────── */
  // Each entry: keywords that must appear (any of), and the answer.
  // Scored by how many distinct keywords match.
  var KB = [
    {
      k: ['panzi', 'pantry', 'current project', 'working on', 'doing right now', 'building'],
      a: 'Panzi is the AI Smart Pantry System he\'s building with his team. You photograph what\'s on your shelf, and it recognises the items, tracks your inventory, estimates freshness, recommends recipes and generates shopping lists before anything spoils. It\'s built with React Native, Python and a vision API.'
    },
    {
      k: ['stack', 'technolog', 'language', 'tools', 'skills', 'framework'],
      a: 'Web: HTML, CSS, JavaScript, TypeScript, PHP, React. Mobile: Kotlin, React Native, Android Studio. Backend & data: Supabase, PostgreSQL, Firebase, Python, MySQL. Design & motion: Photoshop, Illustrator, Canva, After Effects (plus some Figma and Lightroom). Video & AI media: CapCut, ElevenLabs, Google Flow.\n\nMost of the code side is public at github.com/luvdrk — Kotlin, React, Supabase and PostgreSQL all come from CarGO. The design work is at behance.net/derrickazaola1.'
    },
    {
      k: ['build', 'built', 'project', 'portfolio', 'made', 'experience', 'repo', 'repos', 'github',
          'you built', 'you build', 'you made', 'your work'],
      a: 'Four projects on github.com/luvdrk. CarGO is the big one — a ride-hailing and parcel platform split across two repos (a Kotlin Android app and a React operations console), roughly 2.9 MB of code. Then the Informative Panzi Website in TypeScript, a Registrar Queue Management System in PHP, and Clothe Cove, a clothing store front-end in HTML and CSS.'
    },
    {
      k: ['cargo', 'ride', 'hailing', 'hail', 'parcel', 'driver', 'biggest', 'largest', 'complex', 'impressive', 'best'],
      a: 'CarGO is his largest project — a ride-hailing and parcel delivery platform in two repos. cargo-app is the native Android side in Kotlin (about 1.9 MB), and cargo-admin is a React operations console (about 900 KB) covering drivers, trips, parcels, routes, remittance, SOS alerts, reports and audit logs. Behind both sits a Supabase backend with 33 edge functions handling driver onboarding, document review, GCash payouts and push notifications via Firebase.'
    },
    {
      k: ['supabase', 'backend', 'postgres', 'postgresql', 'server', 'api', 'edge'],
      a: 'His backend work is mostly Supabase and PostgreSQL, from CarGO — 33 edge functions covering bookings, fare rates, driver balances and payouts, remittance enforcement, document handling and SOS reporting, plus Firebase for push notifications.'
    },
    {
      k: ['rqms', 'php', 'registrar', 'queue'],
      a: 'The Registrar Queue Management System is a PHP web system for handling registrar queues — around 290 KB of application code, last worked on in October 2025. It\'s at github.com/luvdrk/Website-RQMS.'
    },
    {
      k: ['typescript', 'ts'],
      a: 'TypeScript shows up in two places: the Informative Panzi Website, which is his most recently updated repo, and parts of the CarGO app.'
    },
    {
      k: ['clothe', 'cove', 'clothing', 'store', 'shop', 'ecommerce'],
      a: 'Clothe Cove is a clothing store front-end — catalogue and cart, hand-written in HTML and CSS. It\'s at github.com/luvdrk/Website.'
    },
    {
      k: ['available', 'hire', 'hiring', 'internship', 'intern', 'job', 'role', 'freelance', 'open to'],
      a: 'Yes — he\'s open to internships, junior developer roles, and freelance projects in both development and AI video. The fastest way to reach him is ' + EMAIL + '.'
    },
    {
      k: ['school', 'study', 'studying', 'university', 'college', 'course', 'degree', 'education', 'phinma', 'upang', 'graduate', 'graduation'],
      a: 'He\'s a third-year BS Information Technology student at PHINMA University of Pangasinan, on the System Development track. Expected graduation is 2027.'
    },
    {
      k: ['design', 'designer', 'graphic', 'graphics', 'photoshop', 'illustrator', 'canva', 'behance', 'logo', 'poster', 'jersey', 'overlay', 'banner', 'art', 'creative', 'cole grphx', 'figma', 'lightroom'],
      a: 'He\'s been doing graphic design since 2018 under the name Cole Grphx — jerseys, roster graphics, stream overlays, logos, banners and posters, mostly team and gaming branding. Photoshop, Illustrator and Canva are his main tools, plus After Effects for motion; he\'s also worked in Figma and Lightroom. It\'s self-directed rather than client work. Portfolio at behance.net/derrickazaola1, page at facebook.com/ColeDesigns123.'
    },
    {
      k: ['after effects', 'motion', 'anime', 'edits', 'tiktok', 'animation', 'animated'],
      a: 'Alongside static design he does motion work in After Effects, posting anime edits on TikTok as coleeditsae. Same self-directed habit as the graphic design — it\'s practice, not client work.'
    },
    {
      k: ['video', 'editing', 'editor', 'capcut', 'elevenlabs', 'flow', 'content', 'ai video'],
      a: 'Since 2025 he\'s freelanced in AI video content creation — scripting, generating and editing short-form video using Google Flow, ElevenLabs and CapCut.'
    },
    {
      k: ['contact', 'email', 'reach', 'message', 'get in touch', 'mail'],
      a: 'Email him at ' + EMAIL + '. He replies to internship, junior role and freelance enquiries.'
    },
    {
      k: ['where', 'located', 'location', 'based', 'live', 'city', 'country', 'philippines', 'pangasinan', 'remote'],
      a: 'He\'s based in Pangasinan, Philippines.'
    },
    {
      k: ['kotlin', 'android', 'mobile'],
      a: 'Kotlin is his main mobile language — the CarGO Android app is about 1.9 MB of it, the largest single codebase he\'s written. He also works in React Native, which is what Panzi is built on.'
    },
    {
      k: ['python', 'data', 'database', 'mysql'],
      a: 'Python drives the recognition side of Panzi. For data he works with PostgreSQL through Supabase on CarGO, and MySQL on the PHP side.'
    },
    {
      k: ['name', 'who are you', 'who is', 'about him', 'about you', 'tell me about', 'yourself'],
      a: 'Derrick John F. Azaola — a third-year IT student at PHINMA University of Pangasinan on the System Development track. He builds small, working things end to end: mobile apps, web systems and AI-assisted tools. Right now that\'s Panzi, plus freelance AI video work.'
    },
    {
      k: ['resume', 'résumé', 'cv', 'link', 'links', 'profile', 'profiles', 'code', 'source', 'onlinejobs', 'hire', 'social'],
      a: 'Everything is linked in the Elsewhere panel: github.com/luvdrk for code, behance.net/derrickazaola1 for design, facebook.com/ColeDesigns123 for the design page, tiktok.com/@coleeditsae for the edits, and an OnlineJobs.ph profile for hiring. The Résumé (PDF) button is at the top. Or just email ' + EMAIL + '.'
    }
  ];

  var FALLBACK = 'That one\'s outside what I know. I can only speak to what\'s on this page — CarGO and his other repos at github.com/luvdrk, the Panzi pantry system, his stack, his design and AI video work, and his course at PHINMA UPang. Try a suggestion below, or email him at ' + EMAIL + '.';

  var GREETING = 'Hi — I answer questions about Derrick\'s work, projects and stack. Ask anything, or tap a suggestion below.';

  /* Words common enough to appear in questions that have nothing to do with
     him. On their own they aren't evidence of anything, so they can't reach
     MIN_SCORE alone — "how do I build a birdhouse" shouldn't return his repo
     list on the strength of one verb. */
  var WEAK = ['build', 'built', 'made', 'best', 'where', 'data', 'social',
              'who is', 'about him', 'about you', 'tell me about'];

  // A topic word is worth answering on; a phrase is stronger still, since
  // wording that specific is rarely accidental.
  function weightOf(term) {
    if (WEAK.indexOf(term) !== -1) return 1;
    return term.indexOf(' ') !== -1 ? 3 : 2;
  }

  var MIN_SCORE = 2;

  /* Matches at the start of a word, never mid-word. Plain indexOf found 'ts'
     inside "sports" and 'know' inside "unknown", which is where most of the
     wrong answers came from. Anchoring only the start still lets the stems
     in the table ('technolog', 'repo') cover their own plurals. */
  function hasTerm(q, term) {
    var i = q.indexOf(term);
    while (i !== -1) {
      if (q.charAt(i - 1) === ' ') return true;
      i = q.indexOf(term, i + 1);
    }
    return false;
  }

  function answerFor(question) {
    var q = ' ' + question.toLowerCase()
      .replace(/[^a-z0-9à-ÿ\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() + ' ';

    var best = null;
    var bestScore = 0;
    var bestTop = 0;   // strongest single term behind the winning score

    for (var i = 0; i < KB.length; i++) {
      var score = 0;
      var top = 0;

      for (var j = 0; j < KB[i].k.length; j++) {
        if (hasTerm(q, KB[i].k[j])) {
          var w = weightOf(KB[i].k[j]);
          score += w;
          if (w > top) top = w;
        }
      }

      // Ties used to fall to whichever entry came first in the array, which
      // handed them all to Panzi. Prefer the more specific match instead.
      if (score > bestScore || (score === bestScore && top > bestTop)) {
        bestScore = score;
        bestTop = top;
        best = KB[i];
      }
    }

    return (best && bestScore >= MIN_SCORE) ? best.a : FALLBACK;
  }

  /* ── Assistant widget ───────────────────────────────────── */
  var panel = document.getElementById('chatPanel');
  var fab = document.getElementById('chatToggle');
  var fabLabel = document.getElementById('chatFabLabel');
  var closeBtn = document.getElementById('chatClose');
  var log = document.getElementById('chatLog');
  var form = document.getElementById('chatForm');
  var input = document.getElementById('chatInput');
  var suggestWrap = document.getElementById('chatSuggest');

  var SUGGESTIONS = [
    { label: 'What is CarGO?', q: 'What is CarGO and how was it built?' },
    { label: 'What is Panzi?', q: 'What is Panzi and what does it do?' },
    { label: 'Is he available?', q: 'Is he available for internships or freelance work?' }
  ];

  var busy = false;
  var started = false;

  function scrollLog() {
    if (log) log.scrollTop = log.scrollHeight;
  }

  function addMessage(text, who) {
    var el = document.createElement('div');
    el.className = 'msg ' + (who === 'user' ? 'msg-user' : 'msg-bot');
    el.textContent = text;
    log.appendChild(el);
    scrollLog();
    return el;
  }

  function showTyping() {
    var el = document.createElement('div');
    el.className = 'typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    log.appendChild(el);
    scrollLog();
    return el;
  }

  function ask(question) {
    var q = (question || '').trim();
    if (!q || busy) return;

    busy = true;
    addMessage(q, 'user');
    if (input) input.value = '';

    var typing = showTyping();
    var delay = 380 + Math.min(q.length * 12, 520);

    window.setTimeout(function () {
      typing.remove();
      addMessage(answerFor(q), 'bot');
      busy = false;
    }, delay);
  }

  function buildSuggestions() {
    if (!suggestWrap) return;
    suggestWrap.innerHTML = '';
    SUGGESTIONS.forEach(function (s) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = s.label;
      b.addEventListener('click', function () { ask(s.q); });
      suggestWrap.appendChild(b);
    });
  }

  /* `hidden` alone can't be animated — display:none takes effect instantly.
     So opening unmounts nothing and closing waits for the animation to end
     before hiding, with chatOpen (not the attribute) as the source of truth
     so a click during the closing animation reopens cleanly. */
  var chatOpen = false;
  var closeFallback = null;

  function openChat() {
    if (!panel || chatOpen) return;
    chatOpen = true;

    window.clearTimeout(closeFallback);
    panel.classList.remove('is-closing');
    panel.hidden = false;
    panel.classList.add('is-open');

    if (fabLabel) fabLabel.textContent = 'Close';
    if (!started) {
      started = true;
      buildSuggestions();
      addMessage(GREETING, 'bot');
    }
    scrollLog();
    if (input) input.focus();
  }

  function finishClose() {
    window.clearTimeout(closeFallback);
    panel.classList.remove('is-closing');
    panel.hidden = true;
  }

  function closeChat() {
    if (!panel || !chatOpen) return;
    chatOpen = false;

    panel.classList.remove('is-open');
    panel.classList.add('is-closing');
    if (fabLabel) fabLabel.textContent = 'Ask about me';
    // Focus would otherwise stay on a field inside a panel that's leaving.
    if (fab) fab.focus();

    // Nothing should be able to strand the panel on screen — if the
    // animation is disabled, interrupted or never fires, hide it anyway.
    window.clearTimeout(closeFallback);
    closeFallback = window.setTimeout(finishClose, 400);
  }

  if (panel) {
    panel.addEventListener('animationend', function (e) {
      // The typing dots animate inside the panel and bubble up here too.
      if (e.target !== panel || !panel.classList.contains('is-closing')) return;
      finishClose();
    });
  }

  if (fab) {
    fab.addEventListener('click', function () {
      if (chatOpen) closeChat(); else openChat();
    });
  }
  if (closeBtn) closeBtn.addEventListener('click', closeChat);

  Array.prototype.forEach.call(
    document.querySelectorAll('[data-open-chat]'),
    function (el) { el.addEventListener('click', openChat); }
  );

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      ask(input ? input.value : '');
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && chatOpen) closeChat();
  });
})();
