#!/usr/bin/env python3
"""公開ドメインを設定するスクリプト。

サイト内にドメインが散らばらないよう、書き換えが必要な箇所をここにまとめてあります。
何度実行しても大丈夫です（前回設定したドメインを見つけて置き換えます）。

    # ドメインだけ設定する（検索エンジンにはまだ載せない＝限定公開のまま）
    python3 publish.py portfolio.example.com

    # ドメインを設定して、検索エンジンにも公開する
    python3 publish.py portfolio.example.com --public

    # いまの設定を確認する
    python3 publish.py --status
"""

import datetime
import os
import re
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))

NOINDEX_BLOCK = re.compile(
    r"\n<!-- =+\n     公開準備中.*?=+ -->\n<meta name=\"robots\" content=\"noindex, nofollow\">\n",
    re.S,
)

ROBOTS_PRIVATE = """# ============================================================
# 公開準備中：いまは検索エンジンに一切載せない設定です。
#
# 本公開するときは `python3 publish.py <ドメイン> --public` を実行してください。
# ============================================================
User-agent: *
Disallow: /
"""

ROBOTS_PUBLIC = """User-agent: *
Allow: /

Sitemap: https://{domain}/sitemap.xml
"""

SITEMAP = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://{domain}/</loc>
    <lastmod>{today}</lastmod>
  </url>
</urlset>
"""


def read(name):
    with open(os.path.join(ROOT, name), encoding="utf-8") as f:
        return f.read()


def write(name, text):
    with open(os.path.join(ROOT, name), "w", encoding="utf-8") as f:
        f.write(text)


def current_domain():
    """index.html の canonical から、いま設定されているドメインを読む。"""
    m = re.search(r'<link rel="canonical" href="https://([^/"]+)/?">', read("index.html"))
    return m.group(1) if m else None


def is_public():
    return 'content="noindex, nofollow"' not in read("index.html")


def status():
    dom = current_domain()
    print("ドメイン    : %s" % (dom or "(未設定)"))
    print("検索エンジン: %s" % ("公開中" if is_public() else "ブロック中（限定公開）"))
    if os.path.exists(os.path.join(ROOT, "sitemap.xml")):
        print("sitemap.xml : あり")
    else:
        print("sitemap.xml : なし（--public で生成されます）")


def apply(domain, public):
    old = current_domain()
    if not old:
        sys.exit("index.html から canonical が見つかりませんでした。手動で確認してください。")

    html = read("index.html")
    changed = html.replace(old, domain)

    if public:
        stripped = NOINDEX_BLOCK.sub("\n", changed)
        if stripped == changed and not is_public():
            sys.exit("noindex のブロックが想定と違う形になっています。index.html を確認してください。")
        changed = stripped

    write("index.html", changed)

    if public:
        write("robots.txt", ROBOTS_PUBLIC.format(domain=domain))
        write("sitemap.xml", SITEMAP.format(
            domain=domain, today=datetime.date.today().isoformat()))
    else:
        write("robots.txt", ROBOTS_PRIVATE)

    print("ドメインを %s → %s に変更しました。" % (old, domain))
    if public:
        print("noindex を外し、robots.txt と sitemap.xml を公開用にしました。")
        print("→ git add -A && git commit -m 'Go live' && git push で反映されます。")
    else:
        print("検索エンジンにはまだ載せない設定のままです（--public で公開）。")


def main():
    args = [a for a in sys.argv[1:]]
    if not args or args[0] in ("-h", "--help"):
        print(__doc__)
        return
    if args[0] == "--status":
        status()
        return

    domain = args[0].strip().lower()
    domain = re.sub(r"^https?://", "", domain).rstrip("/")
    if not re.fullmatch(r"[a-z0-9.-]+\.[a-z]{2,}", domain):
        sys.exit("ドメインの形式が正しくないようです: %s" % domain)

    apply(domain, "--public" in args)


if __name__ == "__main__":
    main()
