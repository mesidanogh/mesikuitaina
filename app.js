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
      icon: { name: 'inn', alt: '旅館のアイコン' },
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
      icon: { name: 'shop', alt: '飲食店のアイコン' },
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
      icon: { name: 'claw', alt: 'CLESON アプリのアイコン' },
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
      icon: { name: 'map', alt: 'segrate アプリのアイコン' },
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

  function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

  // スプライト（index.html 冒頭）のアイコンを差し込む
  function lu(name, cls) {
    return '<svg class="lu' + (cls ? ' ' + cls : '') + '" aria-hidden="true"><use href="#lu-' + name + '"/></svg>';
  }
  function ico(icon, cls) {
    return '<svg class="ico' + (cls ? ' ' + cls : '') + '" viewBox="0 0 128 128" role="img" aria-label="' +
      esc(icon.alt) + '"><use href="#ico-' + icon.name + '"/></svg>';
  }

  var docEl = document.documentElement;
  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // マウスなど、ホバーできて細かく指せる入力かどうか（タッチ端末では false）
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  var EASE_OUT = 'cubic-bezier(.16, 1, .3, 1)';
  var EASE_IO = 'cubic-bezier(.7, 0, .2, 1)';

  var view = { w: window.innerWidth, h: window.innerHeight, page: null };
  // seen: 一度でも位置が分かった / has: いまマウスがページの上にある
  var pointer = { x: view.w / 2, y: view.h * 0.4, seen: false, has: false, down: false };

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
     Text splitting
     --------------------------------------------------------- */
  // FV のコピーを 1 文字ずつに分ける。--i は 3 行を通した通し番号（登場の順番）
  function splitChars() {
    var n = 0;
    $$('[data-chars]').forEach(function (line) {
      var text = line.textContent;
      line.textContent = '';
      Array.from(text).forEach(function (c) {
        var outer = document.createElement('span');
        var inner = document.createElement('span');
        outer.className = c === '？' ? 'ch ch--q' : 'ch';
        inner.className = 'ch__i';
        inner.style.setProperty('--i', n++);
        inner.textContent = c;
        outer.appendChild(inner);
        line.appendChild(outer);
      });
    });
  }

  // 見出しを <br> ごとの行に分けて、行ごとにせり上げられるようにする
  function splitLines(scope) {
    $$('[data-lines]', scope).forEach(function (el) {
      if (el.dataset.split) return;
      el.dataset.split = '1';
      var lines = [[]];
      Array.prototype.slice.call(el.childNodes).forEach(function (node) {
        if (node.nodeName === 'BR') lines.push([]);
        else lines[lines.length - 1].push(node);
      });
      el.textContent = '';
      lines.forEach(function (nodes, i) {
        var ln = document.createElement('span');
        var inner = document.createElement('span');
        ln.className = 'ln';
        inner.className = 'ln__i';
        inner.style.setProperty('--li', i);
        nodes.forEach(function (node) { inner.appendChild(node); });
        ln.appendChild(inner);
        el.appendChild(ln);
      });
    });
  }

  /* ---------------------------------------------------------
     Reveal on scroll
     --------------------------------------------------------- */
  var revealObserver = null;
  function observeReveals() {
    if (prefersReduced || !('IntersectionObserver' in window)) {
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
      }, { rootMargin: '0px 0px -8% 0px' });
    }
    $$('[data-rv]:not(.is-in)').forEach(function (el) { revealObserver.observe(el); });
  }
  // ページを開き直すたびに、そのページの登場アニメーションをやり直す
  function replayReveals(page) {
    if (prefersReduced || !page) return;
    $$('[data-rv].is-in', page).forEach(function (el) { el.classList.remove('is-in'); });
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
      ? '<div class="case__shot case__shot--app">' + ico(project.icon, 'case__app-icon') + screen + '</div>'
      : '<div class="case__shot">' + ico(project.icon, 'case__site-shot') + '</div>';

    var meta = [
      ['Client', project.client],
      ['Type', project.type],
      ['担当', project.role]
    ].map(function (row) {
      return '<div><dt class="label label--sm">' + esc(row[0]) + '</dt><dd>' + esc(row[1]) + '</dd></div>';
    }).join('');

    var visit = project.link
      ? '<a class="btn btn--outline" href="' + esc(project.link.href) + '" target="_blank" rel="noopener">' +
        esc(project.link.label) + ' <span class="arw">' + lu('arrow-up-right') + '</span></a>'
      : '';

    var wipBadge = project.wip ? '<span class="badge-wip badge-wip--case">開発中 — まもなく公開予定</span>' : '';

    root.innerHTML =
      '<div data-rv="lines">' +
        '<a class="case__back" href="#/works">' + lu('arrow-left') + ' Back to works</a>' +
        '<h1 class="case__title" data-lines>' + esc(project.name) + '</h1>' +
        wipBadge +
        '<p class="case__summary">' + esc(project.summary) + '</p>' +
      '</div>' +
      '<dl class="meta" data-rv>' + meta + '</dl>' +
      '<div class="case__stage" data-rv><div class="case__frame">' + stage + '</div></div>' +
      (visit ? '<div class="case__visit" data-rv>' + visit + '</div>' : '') +
      '<div class="case__foot" data-rv>' +
        '<a class="label" href="#/works">' + lu('arrow-left') + ' All works</a>' +
        '<a class="case__next" href="#/work/' + esc(next.id) + '" data-cursor="次へ">' +
          '<span class="label">Next project</span>' +
          '<strong>' + esc(next.name) + ' ' + lu('arrow-right', 'lu--24') + '</strong>' +
        '</a>' +
      '</div>';
    splitLines(root);
  }

  /* ---------------------------------------------------------
     Frame loop
     動かすものがある間だけ requestAnimationFrame を回す。
     各 updater は「まだ動いている」なら true を返す
     --------------------------------------------------------- */
  var updaters = [];
  var loopId = 0;
  var lastTime = 0;
  function frame(now) {
    var dt = lastTime ? Math.min(50, now - lastTime) / 1000 : 1 / 60;
    lastTime = now;
    var active = false;
    for (var i = 0; i < updaters.length; i++) if (updaters[i](dt)) active = true;
    if (active) loopId = requestAnimationFrame(frame);
    else { loopId = 0; lastTime = 0; }
  }
  function kick() {
    if (!loopId && !prefersReduced) loopId = requestAnimationFrame(frame);
  }
  // フレームレートに左右されない追従（rate が大きいほど速く追いつく）
  function ease(dt, rate) { return 1 - Math.exp(-dt * rate); }

  /* ---------------------------------------------------------
     Hero
     --------------------------------------------------------- */
  var hero = $('[data-motion-hero]');
  var comp = hero ? $('.hero-composition', hero) : null;
  var risenTimer;

  function compRect() {
    return view.page === 'top' && comp ? comp.getBoundingClientRect() : null;
  }

  // TOP を開くたびに呼ぶ。文字がせり上がり切ったら窓（overflow）を外して、
  // 押されたり傾いたりしても欠けないようにする
  function heroEnter() {
    if (!hero) return;
    clearTimeout(risenTimer);
    hero.classList.remove('is-risen');
    risenTimer = setTimeout(function () { hero.classList.add('is-risen'); }, prefersReduced ? 0 : 2300);
    measureChars();
    kick();
  }

  /* ---- インクの玉 ----
     マウスがあればカーソルに、無ければ FV の中をゆっくり漂う。
     下にあるものを白黒反転して見せる（色合わせは styles.css の .ball） */
  var ball = null;
  var ctx = { label: '', link: false, sticker: false };
  var touchUntil = 0;

  function initBall() {
    if (prefersReduced) return;
    var diff = document.createElement('div');
    var add = document.createElement('div');
    var label = document.createElement('div');
    diff.className = 'ball ball--diff';
    add.className = 'ball ball--add';
    label.className = 'ball-label';
    [diff, add, label].forEach(function (el) {
      el.setAttribute('aria-hidden', 'true');
      document.body.appendChild(el);
    });
    ball = { els: [diff, add], labelEl: label, x: view.w * 0.7, y: view.h * 0.6, s: 0, t: 0, on: false, labelText: '' };
  }

  function heroBallSize() {
    return finePointer ? clamp(view.w * 0.16, 130, 230) : clamp(view.w * 0.3, 96, 150);
  }
  // 漂うときの軌道（リサージュ）。t = 0 のとき右下寄りから始まる
  function driftPoint(rect, t) {
    return {
      x: rect.left + rect.width * (0.5 + 0.33 * Math.sin(t * 0.21 + 0.9)),
      y: rect.top + rect.height * (0.5 + 0.3 * Math.sin(t * 0.29 + 0.5))
    };
  }

  function readContext(el) {
    var hit = el && el.closest ? el : null;
    var cursorEl = hit ? hit.closest('[data-cursor]') : null;
    ctx.label = cursorEl ? cursorEl.dataset.cursor : '';
    ctx.link = !!(hit && hit.closest('a, button'));
    ctx.sticker = !!(hit && hit.closest('[data-sticker]'));
  }

  function updateBall(dt) {
    if (!ball || !ball.on) return false;
    var rect = compRect();
    var heroVisible = !!rect && rect.bottom > 90 && rect.top < view.h;
    var tx = ball.x, ty = ball.y, ts = 0, drifting = false, label = '';

    if (finePointer && pointer.has) {
      tx = pointer.x;
      ty = pointer.y;
      if (ctx.label) { ts = 104; label = ctx.label; }
      else if (ctx.sticker) ts = 14;
      else if (heroVisible && pointer.y > rect.top - 10 && pointer.y < rect.bottom + 10) ts = heroBallSize();
      else ts = ctx.link ? 52 : 14;
      if (pointer.down) ts *= 0.8;
    } else if (heroVisible) {
      // タッチ中は指の位置へ。離したら軌道に戻る
      if (performance.now() < touchUntil) { tx = pointer.x; ty = pointer.y; }
      else {
        ball.t += dt;
        var d = driftPoint(rect, ball.t);
        tx = d.x;
        ty = d.y;
      }
      ts = heroBallSize();
      drifting = true;
    }

    var px = ball.x, py = ball.y;
    var k = ease(dt, drifting ? 3.2 : 11);
    ball.x += (tx - ball.x) * k;
    ball.y += (ty - ball.y) * k;
    ball.s += (ts - ball.s) * ease(dt, 9);

    // 速く動くほど進行方向に伸びる
    var vx = (ball.x - px) / (dt * 60), vy = (ball.y - py) / (dt * 60);
    var speed = Math.sqrt(vx * vx + vy * vy);
    var stretch = ball.s > 40 ? Math.min(speed / (ball.s * 1.1 + 30), 0.3) : 0;
    var angle = speed > 0.2 ? Math.atan2(vy, vx) : 0;
    var sc = ball.s / 100;
    var tf = 'translate3d(' + ball.x.toFixed(1) + 'px,' + ball.y.toFixed(1) + 'px,0) rotate(' + angle.toFixed(3) +
      'rad) scale(' + (sc * (1 + stretch)).toFixed(4) + ',' + (sc * (1 - stretch * 0.5)).toFixed(4) + ')';
    ball.els[0].style.transform = tf;
    ball.els[1].style.transform = tf;

    if (label !== ball.labelText) {
      ball.labelText = label;
      if (label) ball.labelEl.textContent = label;
      ball.labelEl.classList.toggle('is-on', !!label);
    }
    ball.labelEl.style.transform = 'translate3d(' + ball.x.toFixed(1) + 'px,' + ball.y.toFixed(1) + 'px,0) translate(-50%,-50%)';

    return drifting || Math.abs(tx - ball.x) + Math.abs(ty - ball.y) > 0.3 || Math.abs(ts - ball.s) > 0.3;
  }

  /* ---- 文字が玉に押される ---- */
  var chars = [];
  var charSize = 0;

  function measureChars() {
    if (!comp || prefersReduced || view.page !== 'top') return;
    if (!chars.length) {
      chars = $$('.ch', comp).map(function (el) { return { el: el, rx: 0, ry: 0, ox: 0, oy: 0, moved: false }; });
    }
    var base = comp.getBoundingClientRect();
    chars.forEach(function (c) {
      c.el.style.transform = '';
      c.ox = 0; c.oy = 0; c.moved = false;
    });
    chars.forEach(function (c) {
      var r = c.el.getBoundingClientRect();
      c.rx = r.left + r.width / 2 - base.left;
      c.ry = r.top + r.height / 2 - base.top;
      charSize = r.height;
    });
  }

  function updateChars(dt) {
    if (!ball || !chars.length) return false;
    var rect = compRect();
    var live = !!rect && ball.on && ball.s > 40 && rect.bottom > 0 && rect.top < view.h;
    var reach = ball.s / 2 + charSize * 0.5;
    var k = ease(dt, 12);
    var active = false;
    for (var i = 0; i < chars.length; i++) {
      var c = chars[i], tox = 0, toy = 0;
      if (live) {
        var dx = rect.left + c.rx - ball.x, dy = rect.top + c.ry - ball.y;
        var dist = Math.sqrt(dx * dx + dy * dy) || 1;
        if (dist < reach) {
          var f = 1 - dist / reach;
          f = f * f * charSize * 0.3;
          tox = dx / dist * f;
          toy = dy / dist * f;
        }
      }
      c.ox += (tox - c.ox) * k;
      c.oy += (toy - c.oy) * k;
      if (Math.abs(c.ox) + Math.abs(c.oy) > 0.05) {
        c.el.style.transform = 'translate3d(' + c.ox.toFixed(2) + 'px,' + c.oy.toFixed(2) + 'px,0) rotate(' + (c.ox * 0.4).toFixed(2) + 'deg)';
        c.moved = true;
        active = true;
      } else if (c.moved) {
        c.el.style.transform = '';
        c.moved = false;
      }
    }
    return active;
  }

  /* ---- ステッカーを掴んで投げる（マウスのみ）---- */
  var stickers = [];

  function initStickers() {
    if (prefersReduced) return;
    $$('[data-sticker]').forEach(function (el) {
      var st = { el: el, dx: 0, dy: 0, pdx: 0, pdy: 0, vx: 0, vy: 0, rot: 0, drag: false, live: false, moved: 0, sx: 0, sy: 0 };
      stickers.push(st);
      el.addEventListener('dragstart', function (e) { e.preventDefault(); });
      // 掴んで動かしたあとの click では、リンクとして飛ばさない
      el.addEventListener('click', function (e) {
        if (st.moved > 8) { e.preventDefault(); e.stopPropagation(); }
        st.moved = 0;
      });
      if (!finePointer) return;

      el.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'touch' || e.button !== 0) return;
        st.drag = true;
        st.live = true;
        st.moved = 0;
        st.sx = e.clientX - st.dx;
        st.sy = e.clientY - st.dy;
        el.setPointerCapture(e.pointerId);
        el.classList.add('is-live', 'is-drag');
        e.preventDefault();
        kick();
      });
      el.addEventListener('pointermove', function (e) {
        if (!st.drag) return;
        var nx = e.clientX - st.sx, ny = e.clientY - st.sy;
        st.moved += Math.abs(nx - st.dx) + Math.abs(ny - st.dy);
        st.dx = nx;
        st.dy = ny;
      });
      var release = function () {
        if (!st.drag) return;
        st.drag = false;
        el.classList.remove('is-drag');
        kick();
      };
      el.addEventListener('pointerup', release);
      el.addEventListener('pointercancel', release);
    });
  }

  function updateStickers(dt) {
    var active = false;
    for (var i = 0; i < stickers.length; i++) {
      var st = stickers[i];
      if (!st.live) continue;
      if (st.drag) {
        st.vx = (st.dx - st.pdx) / dt;
        st.vy = (st.dy - st.pdy) / dt;
      } else {
        // 手を離すと、ばねで元の位置へ戻る（少し行きすぎて揺れる）
        st.vx += (-st.dx * 150 - st.vx * 11) * dt;
        st.vy += (-st.dy * 150 - st.vy * 11) * dt;
        st.dx += st.vx * dt;
        st.dy += st.vy * dt;
      }
      st.pdx = st.dx;
      st.pdy = st.dy;
      st.rot += (clamp(st.vx * 0.022, -24, 24) - st.rot) * ease(dt, 10);

      var settled = !st.drag && Math.abs(st.dx) + Math.abs(st.dy) < 0.4 && Math.abs(st.vx) + Math.abs(st.vy) < 6;
      if (settled) {
        st.dx = st.dy = st.vx = st.vy = st.rot = st.pdx = st.pdy = 0;
        st.live = false;
        st.el.classList.remove('is-live');
      } else active = true;
      st.el.style.setProperty('--dx', st.dx.toFixed(1) + 'px');
      st.el.style.setProperty('--dy', st.dy.toFixed(1) + 'px');
      st.el.style.setProperty('--dr', st.rot.toFixed(2) + 'deg');
    }
    return active;
  }

  /* ---------------------------------------------------------
     Ticker — スクロールの速さと向きで流れが変わる帯
     --------------------------------------------------------- */
  var ticker = $('[data-ticker]');
  var tick = { track: ticker ? ticker.firstElementChild : null, x: 0, unit: 0, dir: 1, vel: 0, seen: false };

  function measureTicker() {
    if (tick.track) tick.unit = tick.track.scrollWidth / 3;
  }
  function initTicker() {
    if (!ticker || prefersReduced) return;
    ticker.classList.add('is-js');
    measureTicker();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        tick.seen = entries[0].isIntersecting;
        if (tick.seen) kick();
      }).observe(ticker);
    } else tick.seen = true;
  }
  function updateTicker(dt) {
    // スクロール速度は、帯が見えていなくても減衰させておく
    tick.vel += (0 - tick.vel) * ease(dt, 5);
    if (!tick.seen || view.page !== 'top' || !tick.unit) return false;
    if (tick.vel > 0.6) tick.dir = 1;
    else if (tick.vel < -0.6) tick.dir = -1;
    tick.x -= tick.dir * (58 + Math.min(Math.abs(tick.vel) * 26, 900)) * dt;
    if (tick.x <= -tick.unit) tick.x += tick.unit;
    else if (tick.x > 0) tick.x -= tick.unit;
    tick.track.style.transform = 'translate3d(' + tick.x.toFixed(1) + 'px,0,0) skewX(' + clamp(-tick.vel * 0.28, -9, 9).toFixed(2) + 'deg)';
    return true;
  }

  /* ---------------------------------------------------------
     Scroll — ナビの出し入れ・進み具合・パララックス
     --------------------------------------------------------- */
  var navEl = $('.nav');
  var lastY = window.scrollY;
  var scrollPending = false;

  function onScrollFrame() {
    scrollPending = false;
    var y = window.scrollY;
    var dy = y - lastY;
    lastY = y;
    tick.vel += dy * 0.5;

    if (navEl) {
      if (y < 160 || dy < -2) navEl.classList.remove('is-hidden');
      else if (dy > 2) navEl.classList.add('is-hidden');
      var max = docEl.scrollHeight - view.h;
      navEl.style.setProperty('--scroll', max > 0 ? clamp(y / max, 0, 1).toFixed(4) : 0);
    }

    if (!prefersReduced) {
      if (hero && view.page === 'top') {
        hero.style.setProperty('--progress', Math.min(y / hero.offsetHeight, 1).toFixed(4));
        hero.style.setProperty('--spin', (y * 0.3).toFixed(1));
      }
      var page = $('.page:not([hidden])');
      $$('[data-par]', page).forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > view.h) return;
        el.style.setProperty('--par', clamp((r.top + r.height / 2 - view.h / 2) / view.h, -1, 1).toFixed(3));
      });
      // スクロールでカーソルの下の要素が変わるので、玉の状態を取り直す
      if (finePointer && pointer.has) readContext(document.elementFromPoint(pointer.x, pointer.y));
      kick();
    }
  }
  window.addEventListener('scroll', function () {
    if (scrollPending) return;
    scrollPending = true;
    requestAnimationFrame(onScrollFrame);
  }, { passive: true });

  /* ---------------------------------------------------------
     Pointer
     --------------------------------------------------------- */
  window.addEventListener('pointermove', function (e) {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.seen = true;
    if (e.pointerType === 'touch') {
      if (pointer.down) touchUntil = performance.now() + 900;
    } else {
      pointer.has = true;
      readContext(e.target);
      if (hero && finePointer && view.page === 'top' && !prefersReduced) {
        var r = hero.getBoundingClientRect();
        hero.style.setProperty('--px', (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
        hero.style.setProperty('--py', (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
      }
    }
    kick();
  }, { passive: true });
  window.addEventListener('pointerdown', function (e) {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.seen = true;
    pointer.down = true;
    if (e.pointerType === 'touch') touchUntil = performance.now() + 900;
    kick();
  }, { passive: true });
  var pointerEnd = function () { pointer.down = false; kick(); };
  window.addEventListener('pointerup', pointerEnd, { passive: true });
  window.addEventListener('pointercancel', pointerEnd, { passive: true });
  docEl.addEventListener('pointerleave', function () {
    pointer.has = false;
    if (hero) { hero.style.setProperty('--px', 0); hero.style.setProperty('--py', 0); }
    kick();
  });

  /* ---------------------------------------------------------
     Project tiles — カーソルが入った場所からインクが広がる
     --------------------------------------------------------- */
  function initTiles() {
    $$('[data-art]').forEach(function (art) {
      var tile = art.closest('.project-tile');
      var ink = document.createElement('div');
      ink.className = 'project-art__ink';
      ink.setAttribute('aria-hidden', 'true');
      ink.innerHTML = art.innerHTML;
      art.appendChild(ink);

      var origin = function (e) {
        var r = art.getBoundingClientRect();
        art.style.setProperty('--mx', (e.clientX - r.left).toFixed(0) + 'px');
        art.style.setProperty('--my', (e.clientY - r.top).toFixed(0) + 'px');
      };
      tile.addEventListener('pointerenter', function (e) {
        // 広がり始めの中心を先に置いてから、トランジションを効かせる
        ink.style.transition = 'none';
        origin(e);
        void ink.offsetWidth;
        ink.style.transition = '';
        tile.classList.add('is-hot');
      });
      tile.addEventListener('pointerleave', function (e) {
        origin(e);
        tile.classList.remove('is-hot');
      });
    });
  }

  /* ---------------------------------------------------------
     Magnet — 近づくと少し吸い寄せられる
     --------------------------------------------------------- */
  function initMagnets() {
    if (!finePointer || prefersReduced) return;
    $$('[data-magnet]').forEach(function (el) {
      var host = el.closest('a') || el;
      var limit = el === host ? 12 : 26;
      var tx = 0, ty = 0;
      host.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        tx = clamp((e.clientX - (r.left - tx + r.width / 2)) * 0.3, -limit, limit);
        ty = clamp((e.clientY - (r.top - ty + r.height / 2)) * 0.3, -limit, limit);
        el.classList.add('is-near');
        el.style.setProperty('--tx', tx.toFixed(1) + 'px');
        el.style.setProperty('--ty', ty.toFixed(1) + 'px');
      });
      host.addEventListener('pointerleave', function () {
        tx = ty = 0;
        el.classList.remove('is-near');
        el.style.setProperty('--tx', '0px');
        el.style.setProperty('--ty', '0px');
      });
    });
  }

  /* ---------------------------------------------------------
     Router
     --------------------------------------------------------- */
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
  // ページ切り替えの幕に出す行き先の名前
  var WIPE_LABELS = { top: 'ホーム', services: 'できること', works: '仕事', about: '私について', contact: '相談する' };

  function scrollTop() {
    try { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }
    catch (e) { window.scrollTo(0, 0); }
  }

  function show(route) {
    if (route.page === 'case') renderCase(projectById(route.id));

    var shown = null;
    $$('.page').forEach(function (el) {
      el.hidden = el.dataset.page !== route.page;
      if (!el.hidden) shown = el;
    });
    view.page = route.page;

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
    lastY = 0;
    if (navEl) navEl.classList.remove('is-hidden');

    replayReveals(shown);
    observeReveals();
    if (route.page === 'top' && !docEl.classList.contains('is-intro')) heroEnter();
    if (finePointer && pointer.has) readContext(document.elementFromPoint(pointer.x, pointer.y));
    kick();
  }

  /* ---- ページ切り替え：クリックした場所からインクが広がり、次のページで縮む ---- */
  var wipeEl = $('[data-wipe]');
  var wipeLabel = $('[data-wipe-label]');
  var wiping = false;
  var wipeQueued = false;

  function circleAt(r, x, y) {
    return 'circle(' + r.toFixed(0) + 'px at ' + x.toFixed(0) + 'px ' + y.toFixed(0) + 'px)';
  }
  function coverRadius(x, y) {
    var dx = Math.max(x, view.w - x), dy = Math.max(y, view.h - y);
    return Math.sqrt(dx * dx + dy * dy) + 4;
  }

  function route(initial) {
    var next = parseHash();
    var key = next.page + (next.id || '');
    if (key === current) return;

    if (initial || prefersReduced || !wipeEl || !wipeEl.animate) {
      current = key;
      show(next);
      return;
    }
    if (wiping) { wipeQueued = true; return; }
    wiping = true;

    var x = pointer.x, y = pointer.y;
    var r = coverRadius(x, y);
    wipeLabel.textContent = next.page === 'case' ? projectById(next.id).name : WIPE_LABELS[next.page];
    wipeEl.hidden = false;
    var cover = wipeEl.animate(
      [{ clipPath: circleAt(0, x, y) }, { clipPath: circleAt(r, x, y) }],
      { duration: 480, easing: EASE_IO, fill: 'forwards' }
    );
    var labelIn = wipeLabel.animate(
      [{ transform: 'translateY(115%)' }, { transform: 'none' }],
      { duration: 520, delay: 100, easing: EASE_OUT, fill: 'both' }
    );

    var anims = [cover, labelIn];
    var swapped = false;
    var failsafe;

    var done = function () {
      if (!wiping) return;
      clearTimeout(failsafe);
      swap();
      wipeEl.hidden = true;
      anims.forEach(function (a) { a.cancel(); });
      wiping = false;
      if (wipeQueued) { wipeQueued = false; route(false); }
    };
    // 幕が閉じ切ったところで中身を入れ替える
    var swap = function () {
      if (swapped) return;
      swapped = true;
      var latest = parseHash();
      current = latest.page + (latest.id || '');
      show(latest);
    };
    // タブが裏にあるなどでアニメーションが進まなくても、幕が閉じたままにならないようにする
    failsafe = setTimeout(done, 3500);

    cover.onfinish = function () {
      swap();
      setTimeout(function () {
        if (!wiping) return;
        var x2 = pointer.x, y2 = pointer.y;
        var labelOut = wipeLabel.animate(
          [{ transform: 'none' }, { transform: 'translateY(-115%)' }],
          { duration: 380, easing: EASE_IO, fill: 'forwards' }
        );
        var uncover = wipeEl.animate(
          [{ clipPath: circleAt(coverRadius(x2, y2), x2, y2) }, { clipPath: circleAt(0, x2, y2) }],
          { duration: 620, delay: 60, easing: EASE_IO, fill: 'forwards' }
        );
        anims.push(labelOut, uncover);
        uncover.onfinish = done;
      }, 150);
    };
  }

  window.addEventListener('hashchange', function () { route(false); });

  /* ---------------------------------------------------------
     Intro — 初回だけ。数字が 100 まで進み、インクの面が縮んで玉になる
     --------------------------------------------------------- */
  function startBall() {
    if (!ball) return;
    ball.on = true;
    kick();
  }

  function runIntro() {
    var el = $('[data-intro]');
    if (!el || !docEl.classList.contains('is-intro') || !el.animate) {
      docEl.classList.remove('is-intro');
      if (el) el.remove();
      startBall();
      return;
    }
    try { sessionStorage.setItem('ik-intro', '1'); } catch (e) { /* 保存できなくても続行 */ }

    var countEl = $('[data-intro-count]', el);
    var started = performance.now();
    var counted = false;
    var fontsReady = false;

    var leave = function () {
      el.classList.add('is-leaving');
      setTimeout(function () {
        // 縮む先：TOP なら玉が漂い始める位置、それ以外は画面の中央
        var rect = compRect();
        var to = rect ? driftPoint(rect, 0) : { x: view.w / 2, y: view.h / 2 };
        var endR = rect && ball ? heroBallSize() / 2 : 0;
        docEl.classList.remove('is-intro');
        if (view.page === 'top') heroEnter();
        var shrink = el.animate(
          [{ clipPath: circleAt(coverRadius(to.x, to.y), to.x, to.y) }, { clipPath: circleAt(endR, to.x, to.y) }],
          { duration: 1100, easing: EASE_IO, fill: 'forwards' }
        );
        shrink.onfinish = function () {
          if (ball) { ball.x = to.x; ball.y = to.y; ball.s = endR * 2; }
          el.remove();
          startBall();
        };
      }, 380);
    };
    var maybeLeave = function () { if (counted && fontsReady) leave(); };

    var step = function (now) {
      var p = Math.min(1, (now - started) / 1150);
      countEl.textContent = Math.round((1 - Math.pow(1 - p, 3)) * 100);
      if (p < 1) return requestAnimationFrame(step);
      counted = true;
      maybeLeave();
    };
    requestAnimationFrame(step);

    // 書体が来てから開ける（来なくても 1.6 秒で先へ進む）
    var fontsDone = function () { if (!fontsReady) { fontsReady = true; maybeLeave(); } };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fontsDone);
    setTimeout(fontsDone, 1600);
  }

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
  splitChars();
  splitLines(document);
  initTiles();
  initBall();
  initStickers();
  initTicker();
  initMagnets();
  updaters.push(updateBall, updateChars, updateStickers, updateTicker);

  var resizeTimer;
  window.addEventListener('resize', function () {
    view.w = window.innerWidth;
    view.h = window.innerHeight;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { measureChars(); measureTicker(); kick(); }, 150);
  });
  // 書体が入ると文字の位置や帯の幅が変わるので測り直す
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { measureChars(); measureTicker(); });
  }

  route(true);
  onScrollFrame();
  runIntro();
})();
