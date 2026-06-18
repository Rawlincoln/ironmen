#!/usr/bin/env python3
"""IronMen unified server: static files + JSON API for shared program data."""

import json
import os
import secrets
import time
from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from socketserver import ThreadingMixIn
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
DATA_DIR = Path(__file__).resolve().parent / "data"
DATA_DIR.mkdir(exist_ok=True)

STAFF_TOKENS = {}  # token -> expiry timestamp (simple in-memory sessions)

FILES = {
    "house": DATA_DIR / "house.json",
    "community": DATA_DIR / "community.json",
    "site-config": DATA_DIR / "site-config.json",
    "applications": DATA_DIR / "applications.json",
}


def read_json(key, default=None):
    path = FILES.get(key)
    if path and path.exists():
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    return default if default is not None else {}


def write_json(key, data):
    path = FILES[key]
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)


def ensure_data_files():
    """Seed JSON stores on first run (fresh deploy)."""
    if not FILES["site-config"].exists():
        write_json("site-config", {
            "contact": {
                "phone": "0712 000 000",
                "whatsapp": "254712000000",
                "email": "director@ironmen.org",
                "location": "Nairobi, Kenya",
                "hours": "Mon–Sat, 8:00 AM – 6:00 PM",
            },
            "directorPin": "ironmen",
            "mentorPin": "mentor",
            "outcomes": {"menServed": 0, "graduatesPlaced": 0, "cohortsCompleted": 0},
            "testimonials": [],
            "demoMode": False,
            "showSampleData": False,
        })
    if not FILES["applications"].exists():
        write_json("applications", {
            "applications": [],
            "mpesaConfirmations": [],
            "placementMatches": [],
        })
    if not FILES["house"].exists():
        write_json("house", {})
    if not FILES["community"].exists():
        write_json("community", {})


def verify_staff_token(headers):
    token = headers.get("X-Staff-Token", "")
    if not token or token not in STAFF_TOKENS:
        return False
    if STAFF_TOKENS[token] < time.time():
        del STAFF_TOKENS[token]
        return False
    return True


class IronMenHandler(SimpleHTTPRequestHandler):
    extensions_map = {
        **getattr(SimpleHTTPRequestHandler, "extensions_map", {}),
        ".js": "application/javascript",
        ".json": "application/json",
        ".webmanifest": "application/manifest+json",
    }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, X-Staff-Token")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/sync":
            self._json_response(200, {
                "house": read_json("house", {}),
                "community": read_json("community", {}),
                "siteConfig": read_json("site-config", {}),
                "applications": read_json("applications", {"applications": [], "mpesaConfirmations": []}),
            })
            return
        if parsed.path == "/api/health":
            self._json_response(200, {"ok": True})
            return
        super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        body = self._read_body()

        if parsed.path == "/api/auth":
            config = read_json("site-config", {})
            pin = body.get("pin", "")
            role = body.get("role", "director")
            expected = config.get("mentorPin" if role == "mentor" else "directorPin", "ironmen")
            if pin != expected:
                self._json_response(401, {"error": "Invalid PIN"})
                return
            token = secrets.token_hex(24)
            STAFF_TOKENS[token] = time.time() + 86400 * 7
            self._json_response(200, {"token": token, "role": role})
            return

        if parsed.path == "/api/public/submit":
            channel = body.get("channel", "")
            payload = body.get("payload", {})
            if channel == "application":
                data = read_json("applications", {"applications": [], "mpesaConfirmations": []})
                payload.setdefault("id", f"app-{secrets.token_hex(6)}")
                payload.setdefault("status", "applied")
                payload.setdefault("date", body.get("date", ""))
                data.setdefault("applications", []).append(payload)
                write_json("applications", data)
                self._json_response(201, {"ok": True, "id": payload["id"]})
                return
            if channel in ("inquiry", "supporter", "interest", "mpesa"):
                comm = read_json("community", {})
                if channel == "inquiry":
                    comm.setdefault("inquiries", []).append(payload)
                elif channel == "supporter":
                    comm.setdefault("supporterInquiries", []).append(payload)
                elif channel == "interest":
                    comm.setdefault("interestLogs", []).append(payload)
                elif channel == "mpesa":
                    apps = read_json("applications", {"applications": [], "mpesaConfirmations": []})
                    apps.setdefault("mpesaConfirmations", []).append(payload)
                    write_json("applications", apps)
                    self._json_response(201, {"ok": True})
                    return
                write_json("community", comm)
                self._json_response(201, {"ok": True})
                return
            self._json_response(400, {"error": "Unknown channel"})
            return

        if parsed.path.startswith("/api/"):
            self._json_response(404, {"error": "Not found"})
            return
        self.send_error(404)

    def do_PUT(self):
        if not verify_staff_token(self.headers):
            self._json_response(401, {"error": "Staff authentication required"})
            return
        parsed = urlparse(self.path)
        body = self._read_body()
        key = parsed.path.replace("/api/", "")
        if key in FILES:
            write_json(key, body)
            self._json_response(200, {"ok": True})
            return
        self._json_response(404, {"error": "Not found"})

    def _read_body(self):
        length = int(self.headers.get("Content-Length", 0))
        raw = self.rfile.read(length) if length else b"{}"
        try:
            return json.loads(raw.decode("utf-8"))
        except json.JSONDecodeError:
            return {}

    def _json_response(self, code, data):
        body = json.dumps(data).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        if "/api/" in (args[0] if args else ""):
            super().log_message(format, *args)


class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True


def main():
    ensure_data_files()
    port = int(os.environ.get("PORT", "8080"))
    host = os.environ.get("HOST", "0.0.0.0")
    server = ThreadedHTTPServer((host, port), IronMenHandler)
    print(f"IronMen server running on {host}:{port}")
    print("  Static app + API at /api/sync, /api/public/submit")
    server.serve_forever()


if __name__ == "__main__":
    main()