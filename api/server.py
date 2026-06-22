#!/usr/bin/env python3
"""IronMen production server — Flask + Waitress + SQLite."""

import json
import mimetypes
import os
import secrets
from datetime import datetime
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory, abort

from database import (
    JSON_KEYS,
    create_staff_session,
    init_db,
    public_site_config,
    read_json,
    verify_staff_token,
    write_json,
)
from security import (
    MAX_BODY_BYTES,
    SECURITY_HEADERS,
    constant_time_fail,
    hash_pin,
    protect_pins_in_config,
    rate_limit,
    sanitize_payload,
    verify_pin,
)

ROOT = Path(__file__).resolve().parent.parent

app = Flask(__name__, static_folder=None)
app.config["MAX_CONTENT_LENGTH"] = MAX_BODY_BYTES


@app.after_request
def add_security_headers(response):
    for header, value in SECURITY_HEADERS.items():
        response.headers.setdefault(header, value)
    if request.path.startswith("/api/"):
        response.headers["Cache-Control"] = "no-store"
    elif "?v=" in request.url or request.path.endswith((".js", ".css", ".png", ".svg", ".ico")):
        response.headers.setdefault("Cache-Control", "public, max-age=31536000, immutable")
    elif request.path.endswith(".html") or request.path == "/":
        response.headers.setdefault("Cache-Control", "no-cache")
    return response


def _require_staff():
    token = request.headers.get("X-Staff-Token", "")
    if not verify_staff_token(token):
        return None
    return token


def _json_body():
    if not request.data:
        return {}
    try:
        return request.get_json(force=True, silent=False) or {}
    except Exception:
        abort(400, description="Invalid JSON body")


@app.route("/api/health")
def health():
    return jsonify({"ok": True, "ts": datetime.utcnow().isoformat() + "Z"})


@app.route("/api/sync")
@rate_limit("sync")
def public_sync():
    return jsonify({
        "house": read_json("house", {}),
        "community": read_json("community", {}),
        "siteConfig": public_site_config(),
    })


@app.route("/api/sync/staff")
@rate_limit("sync")
def staff_sync():
    if not _require_staff():
        return jsonify({"error": "Staff authentication required"}), 401
    return jsonify({
        "house": read_json("house", {}),
        "community": read_json("community", {}),
        "siteConfig": read_json("site-config", {}),
        "applications": read_json("applications", {"applications": [], "mpesaConfirmations": [], "placementMatches": []}),
    })


@app.route("/api/auth", methods=["POST"])
@rate_limit("auth")
def auth():
    body = sanitize_payload(_json_body())
    pin = str(body.get("pin", ""))
    role = body.get("role", "director")
    if role not in ("director", "mentor"):
        return jsonify({"error": "Invalid role"}), 400
    if not pin or len(pin) > 128:
        constant_time_fail()
        return jsonify({"error": "Invalid PIN"}), 401

    config = read_json("site-config", {})
    pin_key = "mentorPin" if role == "mentor" else "directorPin"
    expected = config.get(pin_key, "mentor" if role == "mentor" else "ironmen")

    if not verify_pin(pin, expected):
        constant_time_fail()
        return jsonify({"error": "Invalid PIN"}), 401

    if expected and not str(expected).startswith("pbkdf2:"):
        config[pin_key] = hash_pin(pin)
        write_json("site-config", config)

    token, _ = create_staff_session(role)
    return jsonify({"token": token, "role": role})


@app.route("/api/public/submit", methods=["POST"])
@rate_limit("submit")
def public_submit():
    body = sanitize_payload(_json_body())
    channel = body.get("channel", "")
    payload = sanitize_payload(body.get("payload", {}))
    if not channel or not isinstance(payload, dict):
        return jsonify({"error": "Invalid submission"}), 400

    today = body.get("date") or datetime.utcnow().strftime("%Y-%m-%d")
    payload.setdefault("date", today)

    if channel == "application":
        data = read_json("applications", {"applications": [], "mpesaConfirmations": [], "placementMatches": []})
        payload.setdefault("id", f"app-{secrets.token_hex(6)}")
        payload.setdefault("status", "applied")
        data.setdefault("applications", []).append(payload)
        write_json("applications", data)
        return jsonify({"ok": True, "id": payload["id"]}), 201

    if channel in ("inquiry", "supporter", "interest"):
        comm = read_json("community", {})
        payload.setdefault("id", f"{channel[:2]}-{secrets.token_hex(6)}")
        payload.setdefault("status", "pending")
        if channel == "inquiry":
            comm.setdefault("inquiries", []).append(payload)
        elif channel == "supporter":
            comm.setdefault("supporterInquiries", []).append(payload)
        else:
            comm.setdefault("interestLogs", []).append(payload)
        write_json("community", comm)
        return jsonify({"ok": True}), 201

    if channel == "mpesa":
        apps = read_json("applications", {"applications": [], "mpesaConfirmations": [], "placementMatches": []})
        payload.setdefault("id", f"mpesa-{secrets.token_hex(6)}")
        apps.setdefault("mpesaConfirmations", []).append(payload)
        write_json("applications", apps)
        return jsonify({"ok": True}), 201

    return jsonify({"error": "Unknown channel"}), 400


@app.route("/api/<key>", methods=["PUT"])
@rate_limit("put")
def staff_put(key):
    if key not in JSON_KEYS:
        return jsonify({"error": "Not found"}), 404
    if not _require_staff():
        return jsonify({"error": "Staff authentication required"}), 401
    body = sanitize_payload(_json_body())
    if key == "site-config":
        body = protect_pins_in_config(body)
    write_json(key, body)
    return jsonify({"ok": True})


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def static_files(path):
    if path.startswith("api/"):
        abort(404)
    target = ROOT / path
    if path == "" or path.endswith("/"):
        path = "index.html"
        target = ROOT / "index.html"
    elif not target.is_file():
        if (ROOT / (path + ".html")).is_file():
            path = path + ".html"
            target = ROOT / path
        else:
            target = ROOT / "index.html"
            path = "index.html"

    directory = str(target.parent)
    filename = target.name
    mime, _ = mimetypes.guess_type(filename)
    resp = send_from_directory(directory, filename)
    if mime:
        resp.mimetype = mime
    if filename == "sw.js":
        resp.mimetype = "application/javascript"
    return resp


def main():
    init_db()
    port = int(os.environ.get("PORT", "8080"))
    host = os.environ.get("HOST", "0.0.0.0")
    threads = int(os.environ.get("WAITRESS_THREADS", "64"))

    print(f"IronMen production server on {host}:{port} (threads={threads})")
    print("  SQLite WAL + rate limits + staff-only sensitive sync")

    try:
        from waitress import serve

        serve(app, host=host, port=port, threads=threads, channel_timeout=120, connection_limit=2000)
    except ImportError:
        print("Waitress not installed — falling back to Flask dev server (local only)")
        app.run(host=host, port=port, threaded=True)


if __name__ == "__main__":
    main()