"""
Samsaaram AI - Local Web Server
Runs the Malayalam-English AI Teacher App locally on http://localhost:8000
"""

import http.server
import socketserver
import os
import sys
import webbrowser

PORT = 8000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

def run_server():
    # Force UTF-8 on Windows terminal if possible
    if sys.stdout.encoding != 'utf-8':
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except Exception:
            pass

    os.chdir(DIRECTORY)
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print("=" * 60, flush=True)
        print("Samsaaram AI - English Teacher (Malayalam - English Live)", flush=True)
        print(f"Server running at: http://localhost:{PORT}", flush=True)
        print(f"Serving directory: {DIRECTORY}", flush=True)
        print("=" * 60, flush=True)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.", flush=True)
            httpd.server_close()

if __name__ == "__main__":
    run_server()
