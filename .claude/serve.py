import functools
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

# 第1引数で公開ルートを指定できる（未指定なら .claude の親＝このリポジトリ）
DEFAULT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_ROOT
PORT = int(os.environ.get("PORT") or 4321)

class NoCacheHandler(SimpleHTTPRequestHandler):
    """ローカル確認用なのでキャッシュさせない。
    編集してリロードすれば必ず最新が出る（styles.css / app.js が古いまま、を防ぐ）。"""

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def send_header(self, keyword, value):
        # SimpleHTTPRequestHandler が付ける Last-Modified は 304 の原因になるので落とす
        if keyword.lower() == "last-modified":
            return
        super().send_header(keyword, value)


os.chdir(ROOT)
handler = functools.partial(NoCacheHandler, directory=ROOT)
print("serving %s on http://localhost:%d" % (ROOT, PORT), flush=True)
ThreadingHTTPServer(("127.0.0.1", PORT), handler).serve_forever()
