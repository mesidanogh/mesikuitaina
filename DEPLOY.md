# 公開手順（Cloudflare Pages・費用ゼロ）

サーバー不要の静的サイトです。Cloudflare Pages に置けば、**無料**で公開できます。

- URL は `https://mesikuitaina.pages.dev`（すでに設定済み）
- HTTPS は自動。証明書の更新も不要
- ドメイン代・サーバー代ともにかかりません
- `git push` するたびに自動で再デプロイ

いまの状態は `python3 publish.py --status` で確認できます。

---

## 全体の流れ

| | やること | 状態 |
|---|---|---|
| 1 | GitHub に push する | ✅ 完了（[mesidanogh/mesikuitaina](https://github.com/mesidanogh/mesikuitaina)） |
| 2 | Cloudflare Pages に接続する | 次はここ |
| 3 | 表示を確認して、検索エンジンに公開する | まだ |

---

## 1. GitHub に push する（完了）

`https://github.com/mesidanogh/mesikuitaina` に push 済みです。
以降 `git push` するたびに、Cloudflare Pages が自動で拾って再デプロイします。

---

## 2. Cloudflare Pages に接続する

1. https://dash.cloudflare.com にログイン（無料アカウント・クレジットカード不要）
2. **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. GitHub を連携し、**`mesikuitaina`** リポジトリを選ぶ
4. **プロジェクト名を `mesikuitaina` にする** ← ここが URL になります
5. ビルド設定：

   | 項目 | 値 |
   |---|---|
   | Framework preset | **None** |
   | Build command | **空欄** |
   | Build output directory | **`/`** |

6. **Save and Deploy**

1〜2分で `https://mesikuitaina.pages.dev` が見られるようになります。

> **`mesikuitaina` が使えなかった場合**（他の人が先に使っていると弾かれます）
> 別の名前で作成して、その名前でこれを実行してください。サイト内の URL がまとめて直ります。
> ```bash
> python3 publish.py <実際のプロジェクト名>.pages.dev
> ```

---

## 3. 検索エンジンに公開する

いまは `noindex` を入れてあるので、**公開しても検索結果には出ません。**
URL を知っている人だけが見られる状態なので、まず表示を確認してください。

問題なければ、ブロックを外します。

```bash
python3 publish.py mesikuitaina.pages.dev --public
```

- `index.html` から `noindex` が外れます
- `robots.txt` がクロール許可に切り替わります
- `sitemap.xml` が生成されます

```bash
git add -A && git commit -m "Go live" && git push
```

push した数分後から検索エンジンが拾い始めます。
[Google Search Console](https://search.google.com/search-console) に登録して `sitemap.xml` を送信すると反映が早くなります。

戻したいときは `python3 publish.py mesikuitaina.pages.dev`（`--public` なし）で限定公開に戻せます。

---

## お問い合わせフォームについて

**いまは「メールアプリを開く」方式で動いています。** 送信ボタンを押すと、入力内容が件名・本文に
入った状態でメールアプリが立ち上がります。無料・サーバー不要な代わりに、送信者ご本人が最後に
送信ボタンを押す必要があります。

サイト上で完結させたい場合も、**無料のまま**実現できます。

1. [Formspree](https://formspree.io/) または [Web3Forms](https://web3forms.com/) で無料登録し、エンドポイントURLを取得
2. `app.js` の先頭にある `FORM_ENDPOINT` に貼る

```js
var FORM_ENDPOINT = 'https://formspree.io/f/xxxxxxxx';
```

これだけで、その場で送信 → 完了メッセージ表示に切り替わります（失敗時はメールアドレスを案内する
エラーが出ます）。無料枠は月50件程度なので、個人のお問い合わせ用途なら十分です。

---

## あとで独自ドメインにしたくなったら

`.pages.dev` のままでも一切問題ありませんが、独自ドメインに変えたくなったときは
**サイトを作り直す必要はありません**。ドメインを取得して、次の2つをやるだけです。

1. Pages のプロジェクト → **Custom domains** → ドメインを追加
   （他社で取ったドメインなら、その DNS に `CNAME  <サブドメイン>  mesikuitaina.pages.dev` を1本追加）
2. サイト内の URL を差し替える
   ```bash
   python3 publish.py portfolio.example.com --public
   git add -A && git commit -m "Switch to custom domain" && git push
   ```

`.pages.dev` の URL も残るので、切り替えても既存のリンクは壊れません。
`.com` なら年2,000円前後が目安です。

---

## そのほか

### ローカルで確認する

```bash
python3 .claude/serve.py
```

http://localhost:4321 で開きます。キャッシュを返さない設定なので、編集してリロードすれば必ず最新が出ます。

### メールアドレスを変えるとき

`keahi0427@icloud.com` が `app.js` と `index.html` に入っています。

```bash
grep -rn "keahi0427@icloud.com" index.html app.js
```

### 差し替えると効くもの

- **segrate の画面キャプチャ** — 実績詳細ページがまだ `APP SCREEN` のプレースホルダーです。
  地図アプリだと一目で分かる画面があると説得力が上がります
- **OG画像** — `og-image.png`。文言を変えたら作り直しが必要です

### ファイル構成

| ファイル | 役割 |
|---|---|
| `index.html` / `styles.css` / `app.js` | サイト本体 |
| `uploads/` | 画像 |
| `og-image.png` | SNS シェア時のカード画像（1200×630） |
| `404.html` | 存在しない URL 用。Cloudflare Pages が自動で使う |
| `robots.txt` / `sitemap.xml` | クローラー向け。`publish.py` が管理 |
| `_headers` | セキュリティヘッダーとキャッシュ設定。Cloudflare Pages が自動で読む |
| `publish.py` | URL 設定と公開切り替え |
