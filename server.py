import os
import sys
import json
import threading
import http.server
import socketserver
import webbrowser
import email
import email.policy

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DOCS_DIR = os.path.join(BASE_DIR, "docs")
os.makedirs(DOCS_DIR, exist_ok=True)
PORT = 8085
FILE_LOCK = threading.Lock()

class NewLifeHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def send_json(self, status, payload):
        raw = json.dumps(payload, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(raw)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(raw)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        if self.path.startswith('/api/sync-excel'):
            try:
                import importlib
                import update_data_from_excel
                importlib.reload(update_data_from_excel)
                update_data_from_excel.main(force=True)
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "message": "Excel data re-synced successfully"}).encode('utf-8'))
                return
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode('utf-8'))
                return

        super().do_GET()

    def do_POST(self):
        if self.path.startswith('/api/sync-excel'):
            try:
                import importlib
                import update_data_from_excel
                importlib.reload(update_data_from_excel)
                update_data_from_excel.main(force=True)
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "message": "Excel data re-synced successfully"}).encode('utf-8'))
                return
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode('utf-8'))
                return

        if self.path.startswith('/api/save-partecipazioni-docs'):
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length)
                data = json.loads(body.decode('utf-8'))

                part_data_path = os.path.join(BASE_DIR, "partecipazioni_data.js")
                with FILE_LOCK:
                    if os.path.exists(part_data_path):
                        with open(part_data_path, "r", encoding="utf-8") as f:
                            c_part = f.read()
                        if c_part.strip():
                            import re
                            p_str = json.dumps(data, ensure_ascii=False, indent=4)
                            c_part = re.sub(
                                r'const DEFAULT_PARTECIPAZIONI_DOCS = \[[\s\S]*?\];\s*(?=const HISTORICAL_PART_MOVEMENTS)',
                                lambda _: f'const DEFAULT_PARTECIPAZIONI_DOCS = {p_str};\n\n',
                                c_part
                            )
                            with open(part_data_path, "w", encoding="utf-8", newline="\n") as f:
                                f.write(c_part)

                self.send_json(200, {"success": True})
                return
            except Exception as e:
                self.send_json(500, {"success": False, "error": str(e)})
                return

        if self.path.startswith('/api/save-partecipazioni'):
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length)
                data = json.loads(body.decode('utf-8'))

                part_data_path = os.path.join(BASE_DIR, "partecipazioni_data.js")
                with FILE_LOCK:
                    if os.path.exists(part_data_path):
                        with open(part_data_path, "r", encoding="utf-8") as f:
                            c_part = f.read()
                        if c_part.strip():
                            import re
                            p_str = json.dumps(data, ensure_ascii=False, indent=4)
                            c_part = re.sub(
                                r'const DEFAULT_PARTECIPAZIONI = \[[\s\S]*?\];\s*(?=const DEFAULT_PARTECIPAZIONI_DOCS)',
                                lambda _: f'const DEFAULT_PARTECIPAZIONI = {p_str};\n\n',
                                c_part
                            )
                            with open(part_data_path, "w", encoding="utf-8", newline="\n") as f:
                                f.write(c_part)

                self.send_json(200, {"success": True})
                return
            except Exception as e:
                self.send_json(500, {"success": False, "error": str(e)})
                return

        if self.path.startswith('/api/save-company-docs'):
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length)
                data = json.loads(body.decode('utf-8'))

                doc_app_path = os.path.join(BASE_DIR, "documenti_app.js")
                with FILE_LOCK:
                    if os.path.exists(doc_app_path):
                        with open(doc_app_path, "r", encoding="utf-8") as f:
                            c_doc = f.read()
                        if c_doc.strip():
                            import re
                            p_str = json.dumps(data, ensure_ascii=False, indent=4)
                            c_doc = re.sub(
                                r'const DEFAULT_DOCUMENTS = \[[\s\S]*?\];',
                                lambda _: f'const DEFAULT_DOCUMENTS = {p_str};',
                                c_doc,
                                count=1
                            )
                            with open(doc_app_path, "w", encoding="utf-8", newline="\n") as f:
                                f.write(c_doc)

                self.send_json(200, {"success": True})
                return
            except Exception as e:
                self.send_json(500, {"success": False, "error": str(e)})
                return

        if self.path.startswith('/api/save-corporate-profile'):
            try:
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length)
                data = json.loads(body.decode('utf-8'))
                
                app_js_path = os.path.join(BASE_DIR, "app.js")
                with FILE_LOCK:
                    if os.path.exists(app_js_path):
                        with open(app_js_path, "r", encoding="utf-8") as f:
                            c_app = f.read()
                        if c_app.strip():
                            import re
                            p_str = json.dumps(data, ensure_ascii=False, indent=4)
                            c_app = re.sub(r'const DEFAULT_CORPORATE_PROFILE = \{[\s\S]*?\};', lambda _: f'const DEFAULT_CORPORATE_PROFILE = {p_str};', c_app)
                            with open(app_js_path, "w", encoding="utf-8", newline="\n") as f:
                                f.write(c_app)

                self.send_json(200, {"success": True})
                return
            except Exception as e:
                self.send_json(500, {"success": False, "error": str(e)})
                return

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

                if saved_files:
                    res = {"success": True, "file": saved_files[0]}
                else:
                    res = {"success": False, "error": "No file received"}
                self.send_json(200, res)
                return
            except Exception as e:
                self.send_json(500, {"success": False, "error": str(e)})
                return

        self.send_response(404)
        self.end_headers()

def start_server():
    os.chdir(BASE_DIR)
    # Auto-sync data from Excel on server start
    try:
        import update_data_from_excel
        print("[Auto-Sync] Extraction des dernières données Excel...")
        update_data_from_excel.main()
    except Exception as e:
        print(f"[Auto-Sync Warning] {e}")

    # Allow port reuse and multi-threaded requests (for PDF streaming + concurrent API calls)
    socketserver.ThreadingTCPServer.allow_reuse_address = True
    try:
        with socketserver.ThreadingTCPServer(("", PORT), NewLifeHandler) as httpd:
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
