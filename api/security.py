"""Rate limiting, PIN hashing, input validation, security headers."""

import base64
import hashlib
import hmac
import os
import re
import secrets
import threading
import time
from functools import wraps

MAX_BODY_BYTES = int(os.environ.get("MAX_BODY_BYTES", "1048576"))
RATE_WINDOW = int(os.environ.get("RATE_WINDOW_SEC", "60"))

LIMITS = {
    "auth": int(os.environ.get("RATE_AUTH", "8")),
    "submit": int(os.environ.get("RATE_SUBMIT", "15")),
    "sync": int(os.environ.get("RATE_SYNC", "120")),
    "put": int(os.environ.get("RATE_PUT", "60")),
}

_rate_lock = threading.Lock()
_rate_buckets = {}

SENSITIVE_KEYS = frozenset({"directorPin", "mentorPin"})

SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "SAMEORIGIN",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
}


def _client_ip(request):
    forwarded = request.headers.get("X-Forwarded-For", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.remote_addr or "unknown"


def rate_limit(bucket_name):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            from flask import jsonify, request

            ip = _client_ip(request)
            key = f"{ip}:{bucket_name}"
            now = time.time()
            limit = LIMITS.get(bucket_name, 60)

            with _rate_lock:
                entry = _rate_buckets.get(key)
                if not entry or now - entry["start"] >= RATE_WINDOW:
                    _rate_buckets[key] = {"start": now, "count": 1}
                else:
                    entry["count"] += 1
                    if entry["count"] > limit:
                        retry = int(RATE_WINDOW - (now - entry["start"]))
                        resp = jsonify({"error": "Too many requests. Please slow down.", "retryAfter": max(retry, 1)})
                        resp.status_code = 429
                        resp.headers["Retry-After"] = str(max(retry, 1))
                        return resp

            return fn(*args, **kwargs)

        return wrapper

    return decorator


def hash_pin(pin):
    if not pin:
        return ""
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", pin.encode("utf-8"), salt, 260000)
    return "pbkdf2:" + base64.b64encode(salt + digest).decode("ascii")


def verify_pin(pin, stored):
    if not stored:
        return False
    if not stored.startswith("pbkdf2:"):
        return hmac.compare_digest(str(pin), str(stored))
    try:
        raw = base64.b64decode(stored[7:])
        salt, digest = raw[:16], raw[16:]
        attempt = hashlib.pbkdf2_hmac("sha256", pin.encode("utf-8"), salt, 260000)
        return hmac.compare_digest(digest, attempt)
    except (ValueError, TypeError):
        return False


def protect_pins_in_config(data):
    if not isinstance(data, dict):
        return data
    out = dict(data)
    for key in SENSITIVE_KEYS:
        val = out.get(key)
        if val and isinstance(val, str) and not val.startswith("pbkdf2:"):
            out[key] = hash_pin(val)
    return out


def sanitize_payload(obj, depth=0):
    if depth > 8:
        return None
    if obj is None:
        return None
    if isinstance(obj, bool):
        return obj
    if isinstance(obj, (int, float)):
        return obj
    if isinstance(obj, str):
        return obj.strip()[:4000]
    if isinstance(obj, list):
        return [sanitize_payload(x, depth + 1) for x in obj[:200]]
    if isinstance(obj, dict):
        clean = {}
        for k, v in list(obj.items())[:100]:
            if isinstance(k, str) and re.match(r"^[a-zA-Z0-9_.-]{1,64}$", k):
                clean[k] = sanitize_payload(v, depth + 1)
        return clean
    return str(obj)[:500]


def constant_time_fail():
    time.sleep(0.05 + secrets.randbelow(30) / 1000)