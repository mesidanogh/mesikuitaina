import functools
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 4321

os.chdir(ROOT)
handler = functools.partial(SimpleHTTPRequestHandler, directory=ROOT)
print("serving %s on http://localhost:%d" % (ROOT, PORT), flush=True)
ThreadingHTTPServer(("127.0.0.1", PORT), handler).serve_forever()
