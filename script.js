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

  function applyTheme(theme, animate) {
    var update = function () {
      root.setAttribute('data-theme', theme);
      if (label) label.textContent = theme === 'dark' ? 'LIGHT' : 'DARK';
    };

    if (animate && document.startViewTransition) {
      document.startViewTransition(update);
    } else {
      update();
    }
  }

  applyTheme(readTheme(), false);

  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next, true);
      try { localStorage.setItem('pf-theme', next); } catch (e) { /* ignore */ }
    });
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
      k: ['panzi', 'pantry', 'current project', 'working on', 'right now', 'building'],
      a: 'Panzi is the AI Smart Pantry System he\'s building with his team. You photograph what\'s on your shelf, and it recognises the items, tracks your inventory, estimates freshness, recommends recipes and generates shopping lists before anything spoils. It\'s built with React Native, Python and a vision API.'
    },
    {
      k: ['stack', 'technolog', 'language', 'tools', 'skills', 'know', 'framework'],
      a: 'Web: HTML, CSS, JavaScript, TypeScript, PHP, React. Mobile: Kotlin, React Native, Android Studio. Backend & data: Supabase, PostgreSQL, Firebase, Python, MySQL. Design & motion: Photoshop, Illustrator, Canva, After Effects (plus some Figma and Lightroom). Video & AI media: CapCut, ElevenLabs, Google Flow.\n\nMost of the code side is public at github.com/luvdrk — Kotlin, React, Supabase and PostgreSQL all come from CarGO. The design work is at behance.net/derrickazaola1.'
    },
    {
      k: ['build', 'built', 'project', 'portfolio', 'made', 'experience', 'repo', 'repos', 'github'],
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

  var FALLBACK = 'I only know what\'s on this page — CarGO and his other repos at github.com/luvdrk, the Panzi pantry system, his stack, his course at PHINMA UPang, and his freelance AI video work. For anything beyond that, email him at ' + EMAIL + '.';

  var GREETING = 'Hi — I answer questions about Derrick\'s work, projects and stack. Ask anything, or tap a suggestion below.';

  function answerFor(question) {
    var q = ' ' + question.toLowerCase().replace(/[^a-z0-9à-ÿ\s]/g, ' ') + ' ';
    var best = null;
    var bestScore = 0;

    for (var i = 0; i < KB.length; i++) {
      var score = 0;
      for (var j = 0; j < KB[i].k.length; j++) {
        if (q.indexOf(KB[i].k[j]) !== -1) score++;
      }
      if (score > bestScore) { bestScore = score; best = KB[i]; }
    }
    return best ? best.a : FALLBACK;
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

  function openChat() {
    if (!panel) return;
    panel.hidden = false;
    if (fabLabel) fabLabel.textContent = 'Close';
    if (!started) {
      started = true;
      buildSuggestions();
      addMessage(GREETING, 'bot');
    }
    scrollLog();
    if (input) input.focus();
  }

  function closeChat() {
    if (!panel) return;
    panel.hidden = true;
    if (fabLabel) fabLabel.textContent = 'Ask about me';
  }

  if (fab) {
    fab.addEventListener('click', function () {
      if (panel.hidden) openChat(); else closeChat();
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
    if (e.key === 'Escape' && panel && !panel.hidden) closeChat();
  });
})();
