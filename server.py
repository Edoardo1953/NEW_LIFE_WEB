import os
import sys
import json
import http.server
import socketserver
import webbrowser
import email
import email.policy

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DOCS_DIR = os.path.join(BASE_DIR, "docs")
os.makedirs(DOCS_DIR, exist_ok=True)
PORT = 8085

class NewLifeHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        if self.path.startswith('/api/upload'):
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length)
                
                content_type = self.headers.get('Content-Type', '')
                raw_headers = f"Content-Type: {content_type}\r\n\r\n".encode('utf-8')
                msg = email.message_from_bytes(raw_headers + body, policy=email.policy.default)
                
                saved_files = []
                if msg.is_multipart():
                    for part in msg.iter_parts():
                        filename = part.get_filename()
                        if filename:
                            safe_filename = os.path.basename(filename)
                            dest_path = os.path.join(DOCS_DIR, safe_filename)
                            file_data = part.get_payload(decode=True)
                            with open(dest_path, 'wb') as f:
                                f.write(file_data)
                            saved_files.append({
                                "filename": safe_filename,
                                "filepath": f"docs/{safe_filename}",
                                "size": f"{len(file_data)/(1024*1024):.2f} Mo"
                            })

                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                
                if saved_files:
                    res = {"success": True, "file": saved_files[0]}
                else:
                    res = {"success": False, "error": "No file received"}
                self.wfile.write(json.dumps(res).encode('utf-8'))
                return
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode('utf-8'))
                return

        self.send_response(404)
        self.end_headers()

def start_server():
    os.chdir(BASE_DIR)
    # Allow port reuse
    socketserver.TCPServer.allow_reuse_address = True
    try:
        with socketserver.TCPServer(("", PORT), NewLifeHandler) as httpd:
            print(f"==================================================")
            print(f"  NEW LIFE Sarl - Serveur Local Actif")
            print(f"  URL: http://localhost:{PORT}")
            print(f"==================================================")
            webbrowser.open(f"http://localhost:{PORT}/index.html")
            httpd.serve_forever()
    except Exception as e:
        print(f"Port {PORT} occupato o errore: {e}")

if __name__ == '__main__':
    start_server()
