/* =========================================================
   Iida Keisuke — portfolio
   ========================================================= */
(function () {
  'use strict';

  var MAIL = 'keahi0427@icloud.com';

  // お問い合わせフォームの送信先。
  // 空のままだと、入力内容を件名・本文に入れてメールアプリを開く方式で動きます
  // （サーバー不要。ただし送信者ご本人の操作が 1 回必要）。
  // Formspree や Web3Forms などのエンドポイントを入れると、その場で送信されます。
  // 例: 'https://formspree.io/f/xxxxxxxx'
  var FORM_ENDPOINT = '';

  var PROJECTS = [
    {
      id: 'mifune',
      kind: 'site',
      name: '活魚の美舟 公式サイト',
      year: '2025',
      client: '旅館 活魚の美舟（愛知県南知多町）',
      role: 'ディレクション / 制作 / 運用',
      type: 'コーポレート・宿泊サイト',
      summary: '知多半島の旅館の公式サイト。宿の空気感を保ちながら、予約までの導線をまっすぐに整理しました。',
      image: { src: 'uploads/icons/inn.svg', alt: '旅館のアイコン' },
      link: { href: 'https://ikeuo-mifune.co.jp', label: 'ikeuo-mifune.co.jp' }
    },
    {
      id: 'ichi',
      kind: 'site',
      name: '旨焼肉 一 ichi 公式サイト',
      year: '2026',
      client: '焼肉店 旨焼肉 一 ichi（愛知県東浦町）',
      role: 'HP 制作',
      type: '飲食店・公式サイト',
      summary: '愛知県東浦町の焼肉店の公式サイト。生牛タンと名物「一焼」がおすすめメニューです！',
      image: { src: 'uploads/icons/shop.svg', alt: '飲食店のアイコン' },
      link: { href: 'https://yakinikuichi0901.com', label: 'yakinikuichi0901.com' }
    },
    {
      id: 'cleson',
      kind: 'app',
      name: 'CLESON',
      year: '2026',
      client: '個人開発',
      role: '企画 / デザイン / 開発',
      type: 'Web アプリ',
      summary: 'クレーンゲームの景品が、どの店舗にあるかを検索できる Web アプリ。バンダイナムコ・タイトー計401店舗のデータを毎日自動で取得しています。',
      image: { src: 'uploads/icons/claw.svg', alt: 'CLESON アプリのアイコン' },
      screenshot: { src: 'uploads/cleson-screen.png', alt: 'CLESON の検索画面。商品名・店舗名で在庫を検索できる' },
      link: { href: 'https://cleson.netlify.app', label: 'cleson.netlify.app' }
    },
    {
      id: 'segrate',
      kind: 'app',
      name: 'segrate',
      year: '2026',
      client: '個人開発',
      role: '企画 / デザイン / 開発',
      type: 'Web アプリ（試用版）',
      summary: '自分だけが知っている地元のお店を、地図で共有するアプリ。Google マップのように地図から探せて、おすすめの場所を日本中・世界中の人に届けられます。',
      image: { src: 'uploads/icons/map.svg', alt: 'segrate アプリのアイコン' },
      link: { href: 'https://segrate.59kp2jzvr8.workers.dev', label: 'segrate.59kp2jzvr8.workers.dev' }
    }
  ];

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     Toast
     --------------------------------------------------------- */
  var toastEl = $('[data-toast]');
  var toastTimer;
  function flash(msg) {
    if (!toastEl) return;
    clearTimeout(toastTimer);
    toastEl.textContent = msg;
    toastEl.classList.add('is-visible');
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-visible'); }, 2200);
  }

  /* ---------------------------------------------------------
     Reveal on scroll
     --------------------------------------------------------- */
  var revealObserver = null;
  function observeReveals() {
    if (prefersReduced) {
      $$('[data-rv]').forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    if (!('IntersectionObserver' in window)) {
      $$('[data-rv]').forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -12% 0px' });
    }
    $$('[data-rv]:not(.is-in)').forEach(function (el) { revealObserver.observe(el); });
  }

  function projectById(id) {
    for (var i = 0; i < PROJECTS.length; i++) if (PROJECTS[i].id === id) return PROJECTS[i];
    return null;
  }

  function renderCase(project) {
    var root = $('[data-case-root]');
    if (!root) return;

    var next = PROJECTS[(PROJECTS.indexOf(project) + 1) % PROJECTS.length];

    var screen = project.screenshot
      ? '<img class="case__phone-shot" src="' + esc(project.screenshot.src) + '" alt="' + esc(project.screenshot.alt) + '">'
      : '<div class="case__phone"><span class="label label--sm">app screen</span></div>';

    var stage = project.kind === 'app'
      ? '<div class="case__shot case__shot--app">' +
          '<img class="case__app-icon" src="' + esc(project.image.src) + '" alt="' + esc(project.image.alt) + '">' +
          screen +
        '</div>'
      : '<div class="case__shot">' +
          '<img class="case__site-shot" src="' + esc(project.image.src) + '" alt="' + esc(project.image.alt) + '">' +
        '</div>';

    var meta = [
      ['Client', project.client],
      ['Type', project.type],
      ['担当', project.role]
    ].map(function (row) {
      return '<div><dt class="label label--sm">' + esc(row[0]) + '</dt><dd>' + esc(row[1]) + '</dd></div>';
    }).join('');

    var visit = project.link
      ? '<a class="btn btn--outline" href="' + esc(project.link.href) + '" target="_blank" rel="noopener">' +
        esc(project.link.label) + ' <span aria-hidden="true">↗</span></a>'
      : '';

    var wipBadge = project.wip ? '<span class="badge-wip badge-wip--case">開発中 — まもなく公開予定</span>' : '';

    root.innerHTML =
      '<a class="case__back" href="#/works">← Back to works</a>' +
      '<h1 class="case__title">' + esc(project.name) + '</h1>' +
      wipBadge +
      '<p class="case__summary">' + esc(project.summary) + '</p>' +
      '<dl class="meta">' + meta + '</dl>' +
      '<div class="case__stage"><div class="case__frame">' +
        '<span class="shot__glow" aria-hidden="true"></span>' + stage +
      '</div></div>' +
      (visit ? '<div class="case__visit">' + visit + '</div>' : '') +
      '<div class="case__foot">' +
        '<a class="label" href="#/works">← All works</a>' +
        '<a class="case__next" href="#/work/' + esc(next.id) + '">' +
          '<span class="label">Next project</span>' +
          '<strong>' + esc(next.name) + ' →</strong>' +
        '</a>' +
      '</div>';
  }

  /* ---------------------------------------------------------
     Router
     --------------------------------------------------------- */
  var pagesEl = $('.pages');
  var fadeTimer;
  var current = null;

  function parseHash() {
    var hash = (window.location.hash || '').replace(/^#\/?/, '');
    var parts = hash.split('/').filter(Boolean);

    if (!parts.length) return { page: 'top' };
    if (parts[0] === 'services') return { page: 'services' };
    if (parts[0] === 'works') return { page: 'works' };
    if (parts[0] === 'about') return { page: 'about' };
    if (parts[0] === 'contact') return { page: 'contact' };
    if (parts[0] === 'work' && projectById(parts[1])) return { page: 'case', id: parts[1] };
    return { page: 'top' };
  }

  var TITLES = {
    top: 'その仕事任せりゃいいじゃん？ — Iida Keisuke',
    services: 'できること — Iida Keisuke',
    works: 'Works — Iida Keisuke',
    about: 'About — Iida Keisuke',
    contact: 'お問い合わせ — Iida Keisuke'
  };

  function scrollTop() {
    try { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }
    catch (e) { window.scrollTo(0, 0); }
  }

  function show(route) {
    if (route.page === 'case') renderCase(projectById(route.id));

    $$('.page').forEach(function (el) {
      el.hidden = el.dataset.page !== route.page;
    });

    document.body.classList.toggle('is-home', route.page === 'top');

    var navKey = route.page === 'case' ? 'works' : route.page;
    $$('[data-nav]').forEach(function (a) {
      if (a.dataset.nav === navKey) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });

    document.title = route.page === 'case'
      ? projectById(route.id).name + ' — Iida Keisuke'
      : TITLES[route.page];

    scrollTop();
    requestAnimationFrame(scrollTop);
    observeReveals();
  }

  function route(initial) {
    var next = parseHash();
    var key = next.page + (next.id || '');
    if (key === current) return;

    if (initial) {
      current = key;
      show(next);
      return;
    }

    clearTimeout(fadeTimer);
    pagesEl.classList.add('is-fading');
    fadeTimer = setTimeout(function () {
      current = key;
      show(next);
      pagesEl.classList.remove('is-fading');
    }, prefersReduced ? 0 : 200);
  }

  window.addEventListener('hashchange', function () { route(false); });

  /* ---------------------------------------------------------
     Copy e-mail
     --------------------------------------------------------- */
  var copyTimer;
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest ? e.target.closest('[data-copy-mail]') : null;
    if (!trigger) return;
    e.preventDefault();

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(MAIL).catch(function () {});
    }
    var label = trigger.textContent;
    trigger.textContent = 'コピーしました';
    flash('メールアドレスをコピーしました');

    clearTimeout(copyTimer);
    copyTimer = setTimeout(function () { trigger.textContent = label; }, 2200);
  });

  /* ---------------------------------------------------------
     Contact form (prototype — no backend wired up)
     --------------------------------------------------------- */
  var form = $('[data-contact-form]');
  var formError = $('[data-form-error]');
  var formDone = $('[data-form-done]');

  function setError(msg) {
    if (!formError) return;
    formError.textContent = msg;
    formError.hidden = !msg;
  }

  function showDone(title, message) {
    $('[data-done-title]').textContent = title;
    $('[data-done-body]').textContent = message;
    form.hidden = true;
    formDone.hidden = false;
  }

  // 送信先が未設定のときは、入力内容を持ったままメールアプリを開く。
  // 「送信しました」と出しておいて実際には誰にも届かない、という状態を作らないため。
  function handoffToMailApp(name, mail, body) {
    var subject = 'お問い合わせ（' + name + ' 様）';
    var lines = ['お名前: ' + name, 'メールアドレス: ' + mail, '', body];
    window.location.href = 'mailto:' + MAIL +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(lines.join('\n'));
    showDone('メールアプリを開きました。',
      '内容が入力された状態で開きます。そのまま送信してください。開かない場合は ' + MAIL + ' 宛にお送りいただければ確実に届きます。');
  }

  function postToEndpoint(name, mail, body, submitBtn) {
    var label = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.textContent = '送信中…';

    fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ name: name, email: mail, message: body })
    }).then(function (res) {
      if (!res.ok) throw new Error('status ' + res.status);
      showDone('送信しました。', 'お問い合わせありがとうございます。2営業日以内にご返信します。');
      flash('送信しました');
    }).catch(function () {
      setError('※ 送信に失敗しました。お手数ですが ' + MAIL + ' 宛にお送りください');
    }).then(function () {
      submitBtn.disabled = false;
      submitBtn.innerHTML = label;
    });
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = form.elements.name.value.trim();
      var mail = form.elements.email.value.trim();
      var body = form.elements.body.value.trim();

      if (!name || !mail || !body) return setError('※ すべての項目をご入力ください');
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) return setError('※ メールアドレスの形式をご確認ください');

      setError('');
      if (FORM_ENDPOINT) postToEndpoint(name, mail, body, form.querySelector('[type=submit]'));
      else handoffToMailApp(name, mail, body);
    });

    form.addEventListener('input', function () { setError(''); });
  }

  var resetBtn = $('[data-form-reset]');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      form.reset();
      setError('');
      formDone.hidden = true;
      form.hidden = false;
      form.elements.name.focus();
    });
  }

  route(true);
  observeReveals();
})();

/* Typography, SVG illustration and pointer choreography. No continuous JS loop. */
(function () {
  'use strict';
  var hero = document.querySelector('[data-motion-hero]');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var fine = window.matchMedia('(pointer: fine)');
  var pending = false;
  function canMove() { return !reduced.matches && document.body.classList.contains('is-home'); }
  hero.addEventListener('pointermove', function (e) {
    if (!canMove() || !fine.matches) return;
    var r = hero.getBoundingClientRect();
    hero.style.setProperty('--px', ((e.clientX-r.left)/r.width-.5)*2);
    hero.style.setProperty('--py', ((e.clientY-r.top)/r.height-.5)*2);
  });
  hero.addEventListener('pointerleave', function () {
    hero.style.setProperty('--px', 0); hero.style.setProperty('--py', 0);
  });
  window.addEventListener('scroll', function () {
    if (!canMove() || pending) return;
    pending = true;
    requestAnimationFrame(function () {
      hero.style.setProperty('--progress', Math.min(window.scrollY / hero.offsetHeight, 1));
      pending = false;
    });
  }, { passive: true });

})();
