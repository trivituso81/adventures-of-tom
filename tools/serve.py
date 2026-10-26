# Serve the game locally:  python3 tools/serve.py [port]   then open http://localhost:8000/index.html
# The game is static files (no build step). It must be served over http, not opened as file://.
import http.server, socketserver, functools, os, sys
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
port=int(sys.argv[1]) if len(sys.argv)>1 else 8000
class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control','no-store'); super().end_headers()
socketserver.TCPServer.allow_reuse_address=True
with socketserver.TCPServer(('0.0.0.0',port),functools.partial(H,directory=ROOT)) as s:
    print(f'Serving {ROOT} at http://localhost:{port}/index.html'); s.serve_forever()
