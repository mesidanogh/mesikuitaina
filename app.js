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
      type: 'モバイルアプリ（開発中）',
      summary: '自分だけが知っている地元のお店を、地図で共有するアプリ。Google マップのように地図から探せて、おすすめの場所を日本中・世界中の人に届けられます。',
      image: { src: 'uploads/2406078C-16B1-494F-B034-DE8AE7C1CAE9_1_105_c.jpeg', alt: 'segrate アプリのアイコン' }
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

  /* ---------------------------------------------------------
     Particle logo field
     --------------------------------------------------------- */
  var logoImage = null;
  var logoReady = new Promise(function (resolve) {
    var inDom = $('.nav__mark img');
    var img = new Image();
    img.decoding = 'async';
    img.onload = function () { resolve(img); };
    img.onerror = function () { resolve(null); };
    img.src = (inDom && (inDom.currentSrc || inDom.src)) || 'uploads/ik-mark.png';
    logoImage = img;
  }).then(function (img) { logoImage = img; return img; });

  function makeSprite(color, size) {
    var s = document.createElement('canvas');
    s.width = s.height = size;
    var g = s.getContext('2d');
    var rg = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    rg.addColorStop(0, color.replace('ALPHA', '1'));
    rg.addColorStop(0.35, color.replace('ALPHA', '0.5'));
    rg.addColorStop(1, color.replace('ALPHA', '0'));
    g.fillStyle = rg;
    g.fillRect(0, 0, size, size);
    return s;
  }

  // 粒子の濃さ。alpha を上げると IK マークがはっきり出る（0〜1）。
  // dim は「光る粒」以外の粒子の減衰率で、下げるとコントラストが強くなる。
  var INK = {
    base: 'rgba(51,52,46,ALPHA)',   // --ink #33342E
    hot:  'rgba(92,92,85,ALPHA)',   // --muted #5C5C55
    alpha: 0.58,
    dim: 0.68
  };

  var SPRITE = null, SPRITE_HOT = null;

  function startField(canvas, logo) {
    if (!logo || !logo.naturalWidth) return function () {};

    var ctx = canvas.getContext('2d');
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var scale = parseFloat(canvas.dataset.scale || '0.72');
    var w = 0, h = 0, pts = [], ps = [], raf = 0, retry = 0;
    var t0 = performance.now();
    var tainted = false;

    if (!SPRITE) {
      SPRITE = makeSprite(INK.base, 24);
      SPRITE_HOT = makeSprite(INK.hot, 34);
    }

    function sample() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      if (!w || !h) return false;

      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var off = document.createElement('canvas');
      off.width = w;
      off.height = h;
      var o = off.getContext('2d', { willReadFrequently: true });
      var s = Math.min(w, h) * scale * 1.5;
      o.drawImage(logo, w / 2 - s / 2, h / 2 - s / 2, s, s);

      var data;
      try {
        data = o.getImageData(0, 0, w, h).data;
      } catch (err) {
        // file:// で直接開いたときなど、ロゴ画像で canvas が汚染されて画素を読めない。
        // 粒子は諦めて、同じ位置にロゴをそのまま描く（右側が空白になるのを防ぐ）。
        tainted = true;
        return true;
      }

      var step = Math.max(2, Math.round(Math.min(w, h) / 240));
      pts = [];
      for (var y = 0; y < h; y += step) {
        for (var x = 0; x < w; x += step) {
          if (data[(y * w + x) * 4 + 3] > 110) {
            pts.push([x + (Math.random() - 0.5) * step, y + (Math.random() - 0.5) * step]);
          }
        }
      }
      for (var i = pts.length - 1; i > 0; i--) {
        var j = (Math.random() * (i + 1)) | 0;
        var tmp = pts[i]; pts[i] = pts[j]; pts[j] = tmp;
      }
      pts = pts.slice(0, 2200);
      return true;
    }

    function build() {
      ps = pts.map(function (pt, i) {
        return {
          tx: pt[0], ty: pt[1],
          x: w / 2 + (Math.random() - 0.5) * w * 1.4,
          y: h / 2 + (Math.random() - 0.5) * h * 1.4,
          vx: 0, vy: 0,
          ph: Math.random() * Math.PI * 2,
          sp: 0.6 + Math.random() * 0.9,
          sz: i % 17 === 0 ? 1.9 : 0.75 + Math.random() * 0.75,
          hot: i % 17 === 0
        };
      });
    }

    function draw(now) {
      var t = (now - t0) / 1000;
      var cyc = t % 9;
      var burst = cyc < 1.6 ? Math.sin((cyc / 1.6) * Math.PI) : 0;

      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < ps.length; i++) {
        var p = ps[i];
        var wob = 3 + burst * 44;
        var gx = p.tx + Math.cos(t * 0.55 * p.sp + p.ph) * wob;
        var gy = p.ty + Math.sin(t * 0.45 * p.sp + p.ph * 1.7) * wob;
        var fx = (gx - p.x) * 0.045;
        var fy = (gy - p.y) * 0.045;
        p.vx = (p.vx + fx) * 0.86;
        p.vy = (p.vy + fy) * 0.86;
        if (prefersReduced) { p.x = gx; p.y = gy; } else { p.x += p.vx; p.y += p.vy; }

        var r = p.sz * (p.hot ? 6 : 4.6) * (1 + burst * 0.25);
        ctx.globalAlpha = INK.alpha * (p.hot ? 1 : INK.dim) * (1 - burst * 0.3);
        ctx.drawImage(p.hot ? SPRITE_HOT : SPRITE, p.x - r, p.y - r, r * 2, r * 2);
      }
      ctx.globalAlpha = 1;
      if (!prefersReduced) raf = requestAnimationFrame(draw);
    }

    // 粒子が読めない環境向けのフォールバック。粒子が象るのと同じ位置・同じ大きさで
    // ロゴを直接描くので、見た目の破綻がない。
    function paintLogo() {
      var s = Math.min(w, h) * scale * 1.5;
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = 0.9;
      ctx.drawImage(logo, w / 2 - s / 2, h / 2 - s / 2, s, s);
      ctx.globalAlpha = 1;
    }

    function refresh() {
      if (!sample()) return false;
      if (tainted) paintLogo(); else build();
      return true;
    }

    // sample() は canvas.width を再設定する＝描画内容が消えるので、
    // 採り直したら必ず描き直しまでセットで行う。
    // prefers-reduced-motion のときは draw() がループを回さないため、
    // これを怠るとリサイズ後に canvas が空のままになる。
    function schedule() {
      if (tainted) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    }

    if (!refresh()) {
      retry = setTimeout(function () { if (refresh()) schedule(); }, 400);
      return function () { clearTimeout(retry); };
    }
    schedule();

    var ro = null;
    if ('ResizeObserver' in window) {
      ro = new ResizeObserver(function () { if (refresh()) schedule(); });
      ro.observe(canvas);
    }

    return function () {
      cancelAnimationFrame(raf);
      clearTimeout(retry);
      if (ro) ro.disconnect();
    };
  }

  var stopField = null;
  function bootField() {
    var canvas = $('canvas[data-ik]');
    if (!canvas || stopField) return;
    logoReady.then(function (logo) {
      if (stopField) return;
      var page = canvas.closest('.page');
      if (page && page.hidden) return;
      stopField = startField(canvas, logo);
    });
  }
  function teardownField() {
    if (!stopField) return;
    stopField();
    stopField = null;
  }

  /* ---------------------------------------------------------
     Case study rendering
     --------------------------------------------------------- */
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
          '<img src="' + esc(project.image.src) + '" alt="' + esc(project.image.alt) + '">' +
          screen +
        '</div>'
      : '<div class="case__shot">' +
          '<img src="' + esc(project.image.src) + '" alt="' + esc(project.image.alt) + '">' +
        '</div>';

    var meta = [
      ['Client', project.client],
      ['Type', project.type]
    ].map(function (row) {
      return '<div><dt class="label label--sm">' + esc(row[0]) + '</dt><dd>' + esc(row[1]) + '</dd></div>';
    }).join('');

    var visit = project.link
      ? '<a class="btn btn--outline" href="' + esc(project.link.href) + '" target="_blank" rel="noopener">' +
        esc(project.link.label) + ' <span aria-hidden="true">↗</span></a>'
      : '';

    root.innerHTML =
      '<a class="case__back" href="#/works">← Back to works</a>' +
      '<h1 class="case__title">' + esc(project.name) + '</h1>' +
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
    if (parts[0] === 'works') return { page: 'works' };
    if (parts[0] === 'about') return { page: 'about' };
    if (parts[0] === 'contact') return { page: 'contact' };
    if (parts[0] === 'work' && projectById(parts[1])) return { page: 'case', id: parts[1] };
    return { page: 'top' };
  }

  var TITLES = {
    top: 'Iida Keisuke — AI 活用と HP・LP 制作',
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

    if (route.page === 'top') bootField(); else teardownField();

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
     Boot
     --------------------------------------------------------- */
  route(true);
  observeReveals();

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { bootField(); });
  }
})();
