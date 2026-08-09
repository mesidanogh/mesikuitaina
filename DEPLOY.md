# 公開手順（独自ドメイン + Cloudflare Pages）

サーバー不要の静的サイトです。HTML / CSS / JS と画像を置くだけで動きます。
Cloudflare Pages に置けばサーバーの管理も費用も発生しません（無料枠で十分収まります）。

いまの状態は `python3 publish.py --status` で確認できます。

---

## 全体の流れ

| | やること | 誰が |
|---|---|---|
| 1 | ドメインを取得する | **ご自身で**（購入操作が必要なため） |
| 2 | `publish.py` でドメインを設定する | コマンド1行 |
| 3 | GitHub に push する | コマンド3行 |
| 4 | Cloudflare Pages に接続する | 画面操作 |
| 5 | 独自ドメインを割り当てる（DNS） | 画面操作 + CNAME 1本 |
| 6 | 検索エンジンに公開する | コマンド1行 |

1〜5 を終えた時点で「URL を知っている人は見られる」状態、6 で「検索に載る」状態になります。

---

## 1. ドメインを取得する

**ここだけは代行できません**（支払いが発生する操作のため）。ご自身で取得をお願いします。

サブドメインで運用する前提なので、取るのは大元のドメイン1つで大丈夫です。

例：`iidakeisuke.com` を取って、`portfolio.iidakeisuke.com` や `www.iidakeisuke.com` を使う

取得先の候補：

- **Cloudflare Registrar** — Pages と同じ管理画面で完結し、DNS 設定が自動。更新料に上乗せがないので長期的には一番安いことが多いです。ただし `.jp` は非対応。
- **お名前.com / ムームードメイン / Xserverドメイン** — 日本語で完結。`.jp` も取れます。DNS に CNAME を1本足す作業が必要（手順は下に書いてあります）。

`.com` なら年 2,000 円前後が目安です。

---

## 2. ドメインを設定する

取得したドメイン（実際に使うサブドメイン）を渡して実行します。

```bash
python3 publish.py portfolio.iidakeisuke.com
```

`canonical` / `og:url` / `og:image` / `robots.txt` がまとめて書き換わります。
何度でも実行できるので、あとから変えるときも同じコマンドでかまいません。

> この時点ではまだ検索エンジンをブロックしたままです。手順6で解除します。

---

## 3. GitHub に push する

GitHub で空のリポジトリを作ってから（README などは追加しない）：

```bash
git add -A && git commit -m "Set production domain"
```

```bash
git remote add origin https://github.com/<ユーザー名>/<リポジトリ名>.git
git branch -M main
git push -u origin main
```

リポジトリは **Private** で問題ありません。Cloudflare Pages は Private でも接続できます。

---

## 4. Cloudflare Pages に接続する

1. https://dash.cloudflare.com にログイン（無料アカウント）
2. **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
3. GitHub を連携し、さきほどのリポジトリを選ぶ
4. ビルド設定：

   | 項目 | 値 |
   |---|---|
   | Framework preset | **None** |
   | Build command | **空欄** |
   | Build output directory | **`/`** |

5. **Save and Deploy**

1〜2分で `https://<プロジェクト名>.pages.dev` が見られるようになります。
以降は `git push` するたびに自動で再デプロイされます。

---

## 5. 独自ドメインを割り当てる

Pages のプロジェクト → **Custom domains** → **Set up a domain** → 使うサブドメインを入力。

そのあとは、ドメインをどこで管理しているかで分かれます。

### ドメインを Cloudflare で管理している場合

DNS レコードが自動で作られます。数分待てば繋がります。作業はこれだけです。

### 他社（お名前.com など）で管理している場合

Cloudflare の画面に「このレコードを追加してください」と表示されるので、
取得先の DNS 設定画面で CNAME を1本足します。

| 種別 | ホスト名 | 値 |
|---|---|---|
| CNAME | `portfolio`（使うサブドメイン部分） | `<プロジェクト名>.pages.dev` |

反映は数分〜最大で数時間かかることがあります。SSL 証明書は Cloudflare が自動で発行するので、
`https://` は何もしなくても有効になります。

> **apex（`iidakeisuke.com` のように www なし）を使いたい場合**は CNAME が使えないため、
> ネームサーバーごと Cloudflare に向ける必要があります。サブドメイン運用ならこの作業は不要です。

---

## 6. 検索エンジンに公開する

サイトの表示が問題ないことを確認したら、最後にブロックを外します。

```bash
python3 publish.py portfolio.iidakeisuke.com --public
```

- `index.html` から `noindex` が外れます
- `robots.txt` がクロール許可に切り替わります
- `sitemap.xml` が生成されます

```bash
git add -A && git commit -m "Go live" && git push
```

push した数分後から検索エンジンが拾い始めます。
あわせて [Google Search Console](https://search.google.com/search-console) にドメインを登録し、
`sitemap.xml` を送信しておくと反映が早くなります。

戻したくなったら `python3 publish.py <ドメイン>`（`--public` なし）で限定公開に戻せます。

---

## お問い合わせフォームについて

**いまは「メールアプリを開く」方式で動いています。** 送信ボタンを押すと、入力内容が件名・本文に
入った状態でメールアプリが立ち上がります。サーバーが要らない代わりに、送信者ご本人が最後に
送信ボタンを押す必要があります。

サイト上で完結させたい場合は、外部のフォームサービスを使うと**サーバーレスのまま**実現できます。

1. [Formspree](https://formspree.io/) または [Web3Forms](https://web3forms.com/) で無料登録し、エンドポイントURLを取得
2. `app.js` の先頭にある `FORM_ENDPOINT` に貼る

```js
var FORM_ENDPOINT = 'https://formspree.io/f/xxxxxxxx';
```

これだけで、その場で送信 → 完了メッセージ表示に切り替わります（失敗時はメールアドレスを案内する
エラーが出ます）。無料枠は月50件程度なので、個人のお問い合わせ用途なら十分です。

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
| `publish.py` | ドメイン設定と公開切り替え |
