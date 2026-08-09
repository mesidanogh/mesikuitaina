# 公開手順（Cloudflare Pages）

このサイトはビルド不要の静的サイトです。フォルダをそのまま置けば動きます。

**いまの状態：公開しても検索エンジンには載りません。**
`index.html` の `noindex` と `robots.txt` で全クローラーをブロックしてあるので、
URL を知っている人だけが見られる「限定公開」として先に出しておけます。
本当に公開する準備ができたら [4. 本公開に切り替える](#4-本公開に切り替える) の 3 手順を実行してください。

---

## 0. 準備できているもの

| ファイル | 役割 |
|---|---|
| `index.html` / `styles.css` / `app.js` | サイト本体 |
| `uploads/` | 画像 3 点 |
| `og-image.png` | SNS でシェアしたときに出るカード画像（1200×630） |
| `404.html` | 存在しない URL のときに出るページ。Cloudflare Pages が自動で使います |
| `robots.txt` | クローラー設定（いまは全ブロック） |
| `_headers` | セキュリティヘッダーとキャッシュ設定。Cloudflare Pages が自動で読みます |
| `.gitignore` | 13MB のバンドル ` Top.html` などを除外 |

Git リポジトリは初期化＋初回コミット済みです。

---

## 1. URL を差し替える

Cloudflare Pages のプロジェクト名を決めると、URL は
`https://<プロジェクト名>.pages.dev` になります。

例：プロジェクト名を `iida-keisuke` にすると → `https://iida-keisuke.pages.dev`

決まったら、仮で入れてある `https://iida-keisuke.pages.dev` を実際の URL に置換します。
出てくるのは `index.html` の 4 か所と `robots.txt` の 1 か所だけです。

```bash
grep -rn "iida-keisuke.pages.dev" index.html robots.txt
```

一括で置換する場合（`あなたのプロジェクト名` の部分を書き換えて実行）：

```bash
sed -i '' 's|iida-keisuke\.pages\.dev|あなたのプロジェクト名.pages.dev|g' index.html robots.txt
```

> プロジェクト名がすでに他の人に使われていると取れないことがあります。
> Cloudflare の画面でプロジェクトを作ってから、確定した名前で置換するのが確実です。

---

## 2. GitHub にリポジトリを作って push する

GitHub で空のリポジトリを作ってから（README などは追加しない）：

```bash
git remote add origin https://github.com/<ユーザー名>/<リポジトリ名>.git
git branch -M main
git push -u origin main
```

> 公開したくない情報は入っていませんが、リポジトリは **Private** で作って構いません。
> Cloudflare Pages は Private リポジトリでも接続できます。

---

## 3. Cloudflare Pages に繋ぐ

1. https://dash.cloudflare.com にログイン（アカウントがなければ無料で作成）
2. 左メニューの **Workers & Pages** → **Create** → **Pages** タブ → **Connect to Git**
3. GitHub を連携し、さきほどのリポジトリを選ぶ
4. ビルド設定を次のようにする：

   | 項目 | 値 |
   |---|---|
   | Framework preset | **None** |
   | Build command | **空欄のまま** |
   | Build output directory | **`/`**（ルート） |

5. **Save and Deploy**

1〜2 分で `https://<プロジェクト名>.pages.dev` が見られるようになります。
以降は `git push` するたびに自動で再デプロイされます。

### Git を使わずに試したい場合

同じ画面の **Upload assets** を選び、このフォルダの中身をドラッグ＆ドロップしても公開できます。
その場合は ` Top.html`（13MB のバンドル）を **一緒にアップロードしない** よう気をつけてください。

---

## 4. 本公開に切り替える

検索結果に出してよくなったタイミングで、次の 3 つをやります。

### (1) `index.html` から noindex を消す

`<meta name="robots" content="noindex, nofollow">` の行を削除します
（すぐ上のコメントブロックも一緒に消して構いません）。

### (2) `robots.txt` を本公開用にする

いまの `Disallow: /` の 2 行を消して、下にコメントアウトしてある「本公開用」のブロックを有効にします。

### (3) `sitemap.xml` を置く

`robots.txt` から参照しているので、公開時に作っておくと検索エンジンに拾われやすくなります。
ハッシュルーティング（`#/works` など）は 1 ページ扱いなので、中身はトップ 1 件で十分です。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://あなたのプロジェクト名.pages.dev/</loc>
    <lastmod>2026-08-01</lastmod>
  </url>
</urlset>
```

そのあと push すれば反映されます。Google Search Console への登録もこのタイミングで。

---

## 補足

### URL を知っている人にも見せたくない場合

`noindex` は「検索結果に出さない」だけで、URL を直接開けば誰でも見られます。
完全に鍵をかけたいときは Cloudflare の **Zero Trust → Access** でメールアドレス認証をかけられます
（無料枠あり）。Pages のプロジェクト設定から追加できます。

### あとで独自ドメインにしたくなったら

Cloudflare Pages のプロジェクト → **Custom domains** → ドメインを追加。
ドメインを Cloudflare で管理していれば DNS は自動設定、他社管理なら CNAME を 1 本足すだけです。
`.pages.dev` の URL もそのまま残るので、切り替えても壊れません。
そのときは [1. URL を差し替える](#1-url-を差し替える) の置換をもう一度、新しいドメインで実行してください。

### ローカルで確認する

```bash
python3 .claude/serve.py 4321
```

http://localhost:4321 で開きます。

### メールアドレスを変えるとき

`keahi0427@icloud.com` が 3 か所（`app.js` の `MAIL`、`index.html` の表示テキスト 2 か所）に入っています。

```bash
grep -rn "keahi0427@icloud.com" index.html app.js
```
