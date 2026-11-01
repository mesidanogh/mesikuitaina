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
      image: { src: 'uploads/671AD1C5-753F-4FC5-A6EE-3EC464F6CB3C_4_5005_c.jpeg', alt: '活魚の美舟 客室からの眺め' },
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
      image: { src: 'uploads/ichi-hero.jpg', alt: '旨焼肉 一 ichi 網で焼かれる生牛タンとホルモン' },
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
      image: { src: 'uploads/cleson-icon.png', alt: 'CLESON アプリのアイコン' },
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
      image: { src: 'uploads/2406078C-16B1-494F-B034-DE8AE7C1CAE9_1_105_c.jpeg', alt: 'segrate アプリのアイコン' },
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
      $$('[data-rv], [data-stagger]').forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    if (!('IntersectionObserver' in window)) {
      $$('[data-rv], [data-stagger]').forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        });
      }, { rootMargin: '0px 0px -8% 0px' });
    }
    $$('[data-rv]:not(.is-in), [data-stagger]:not(.is-in)').forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------------------------------------------------------
     Case study rendering
     --------------------------------------------------------- */
  function projectById(id) {
    for (var i = 0; i < PROJECTS.length; i++) if (PROJECTS[i].id === id) return PROJECTS[i];
    return null;
  }

  function icon(name) {
    return '<svg class="i" aria-hidden="true"><use href="#i-' + name + '"/></svg>';
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
      ['Type', project.type]
    ].map(function (row) {
      return '<div><dt class="label label--sm">' + esc(row[0]) + '</dt><dd>' + esc(row[1]) + '</dd></div>';
    }).join('');

    var visit = project.link
      ? '<a class="btn btn--outline" href="' + esc(project.link.href) + '" target="_blank" rel="noopener">' +
        esc(project.link.label) + ' ' + icon('arrow-up-right') + '</a>'
      : '';

    var wipBadge = project.wip ? '<span class="badge-wip badge-wip--case">開発中 — まもなく公開予定</span>' : '';

    root.innerHTML =
      '<a class="case__back" href="#/works">' + icon('arrow-left') + ' Back to works</a>' +
      '<h1 class="case__title">' + esc(project.name) + '</h1>' +
      wipBadge +
      '<p class="case__summary">' + esc(project.summary) + '</p>' +
      '<dl class="meta">' + meta + '</dl>' +
      '<div class="case__stage"><div class="case__frame">' +
        stage +
      '</div></div>' +
      (visit ? '<div class="case__visit">' + visit + '</div>' : '') +
      '<div class="case__foot">' +
        '<a class="textlink" href="#/works">' + icon('arrow-left') + ' All works</a>' +
        '<a class="case__next" href="#/work/' + esc(next.id) + '">' +
          '<span class="label">Next project</span>' +
          '<strong>' + esc(next.name) + '</strong>' + icon('arrow-right') +
        '</a>' +
      '</div>';
  }

  /* ---------------------------------------------------------
     Mobile menu — 全画面パネル。リンクは CSS で 60ms ずつずらして出る
     --------------------------------------------------------- */
  var rootEl = document.documentElement;
  var menuBtn = $('[data-menu-toggle]');

  function setMenu(open) {
    rootEl.classList.toggle('menu-open', open);
    if (!menuBtn) return;
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    menuBtn.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
  }
  function closeMenu() { setMenu(false); }

  if (menuBtn) {
    menuBtn.addEventListener('click', function () {
      setMenu(!rootEl.classList.contains('menu-open'));
    });
  }
  var menuEl = $('[data-menu]');
  if (menuEl) {
    // 今いるページのリンクを押しても hashchange は起きないので、ここで閉じる
    menuEl.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('a')) closeMenu();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMenu();
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 720) closeMenu();
  });

  /* ---------------------------------------------------------
     Hero stage — 背景のタイルを、ロード画面が消えてから順に登場させる
     --------------------------------------------------------- */
  var stageEl = $('[data-stage]');
  function playStage() {
    if (!stageEl || rootEl.classList.contains('is-loading')) return;
    stageEl.classList.remove('is-play');
    void stageEl.offsetWidth;   // 再生し直すためにアニメーションをリセット
    stageEl.classList.add('is-play');
  }

  /* ---------------------------------------------------------
     Tagline reveal — 一語ずつ、スクロール位置に応じて色が戻る
     スクロールイベントは requestAnimationFrame で間引く
     --------------------------------------------------------- */
  var taglineEl = $('[data-tagline]');
  var taglineWords = taglineEl ? $$('.w', taglineEl) : [];
  var taglineTick = false;

  function updateTagline() {
    taglineTick = false;
    if (!taglineWords.length) return;
    if (prefersReduced) {
      taglineWords.forEach(function (w) { w.classList.add('is-on'); });
      return;
    }
    var box = taglineEl.getBoundingClientRect();
    if (!box.height) return;   // 非表示のページ
    var vh = window.innerHeight;
    // 見出しが画面の下 20% に入ったら 0、下端が画面の 55% に届いたら 1
    var p = (vh * 0.8 - box.top) / (vh * 0.25 + box.height);
    var lit = Math.max(0, Math.min(1, p)) * taglineWords.length;
    taglineWords.forEach(function (w, i) {
      w.classList.toggle('is-on', i < lit);
    });
  }
  function queueTagline() {
    if (taglineTick) return;
    taglineTick = true;
    requestAnimationFrame(updateTagline);
  }
  window.addEventListener('scroll', queueTagline, { passive: true });
  window.addEventListener('resize', queueTagline);

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
    if (parts[0] === 'works') return { page: 'works' };
    if (parts[0] === 'about') return { page: 'about' };
    if (parts[0] === 'contact') return { page: 'contact' };
    if (parts[0] === 'work' && projectById(parts[1])) return { page: 'case', id: parts[1] };
    return { page: 'top' };
  }

  var TITLES = {
    top: 'Iida Keisuke — Web ディレクション / HP・LP 制作と広告運用',
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

    closeMenu();
    updateTagline();
    if (route.page === 'top') playStage();

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

  /* ---------------------------------------------------------
     Loader — 0 から 100% まで数え、読み込み完了後に消える
     TOP を直接開いたときだけ動きます（マークアップ側で判定済み）
     --------------------------------------------------------- */
  (function () {
    var root = document.documentElement;
    var el = $('[data-loader]');
    if (!el || !root.classList.contains('is-loading')) return;

    var numEl = $('[data-loader-num]', el);
    var fillEl = $('[data-loader-fill]', el);
    var DURATION = 1200;   // 0 → 100% にかける時間
    var HOLD = 260;        // 100% を見せてから消えるまで
    var started = 0;
    var loaded = document.readyState === 'complete';
    var finished = false;

    window.addEventListener('load', function () { loaded = true; });

    function dismiss() {
      if (finished) return;
      finished = true;
      el.classList.add('is-done');
      root.classList.remove('is-loading');
      playStage();
      setTimeout(function () { el.remove(); }, 800);
    }

    function paint(pct) {
      if (numEl) numEl.textContent = pct;
      if (fillEl) fillEl.style.width = pct + '%';
    }

    if (prefersReduced) {
      paint(100);
      setTimeout(dismiss, HOLD);
      return;
    }

    function tick(now) {
      if (!started) started = now;
      // 読み込みが終わるまでは 90% で足踏みさせ、終わってから 100 まで走らせる
      var ratio = Math.min((now - started) / DURATION, 1);
      var pct = Math.floor(ratio * 100);
      if (!loaded) pct = Math.min(pct, 90);
      paint(pct);

      if (pct >= 100) setTimeout(dismiss, HOLD);
      else requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    // 読み込みが極端に遅い場合でも、待たせすぎない
    setTimeout(dismiss, 6000);
  })();

  /* ---------------------------------------------------------
     Boot
     --------------------------------------------------------- */
  route(true);
  observeReveals();

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(updateTagline);
  }
})();
