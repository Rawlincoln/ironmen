"""SQLite persistence with WAL mode for concurrent reads and safe writes."""

import json
import sqlite3
import threading
import time
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent / "data"
DATA_DIR.mkdir(exist_ok=True)
DB_PATH = DATA_DIR / "ironmen.db"

_local = threading.local()
_init_lock = threading.Lock()
_initialized = False

JSON_KEYS = ("house", "community", "site-config", "applications")

DEFAULTS = {
    "site-config": {
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
    },
    "applications": {
        "applications": [],
        "mpesaConfirmations": [],
        "placementMatches": [],
    },
    "house": {},
    "community": {},
}


def _connect():
    conn = sqlite3.connect(DB_PATH, timeout=30, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA synchronous=NORMAL")
    conn.execute("PRAGMA busy_timeout=30000")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


def get_conn():
    if not getattr(_local, "conn", None):
        _local.conn = _connect()
    return _local.conn


def init_db():
    global _initialized
    with _init_lock:
        if _initialized:
            return
        conn = _connect()
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS kv_store (
                key TEXT PRIMARY KEY,
                data TEXT NOT NULL,
                updated_at REAL NOT NULL
            );
            CREATE TABLE IF NOT EXISTS staff_sessions (
                token TEXT PRIMARY KEY,
                role TEXT NOT NULL,
                expires_at REAL NOT NULL,
                created_at REAL NOT NULL
            );
            CREATE INDEX IF NOT EXISTS idx_sessions_expires ON staff_sessions(expires_at);
            """
        )
        conn.commit()
        _migrate_json_files(conn)
        _initialized = True


def _migrate_json_files(conn):
    for key in JSON_KEYS:
        row = conn.execute("SELECT 1 FROM kv_store WHERE key = ?", (key,)).fetchone()
        if row:
            continue
        json_path = DATA_DIR / f"{key}.json"
        if json_path.exists():
            try:
                data = json.loads(json_path.read_text(encoding="utf-8"))
            except (json.JSONDecodeError, OSError):
                data = DEFAULTS.get(key, {})
        else:
            data = DEFAULTS.get(key, {})
        _write_kv(conn, key, data)
    conn.commit()


def _write_kv(conn, key, data):
    conn.execute(
        "INSERT INTO kv_store(key, data, updated_at) VALUES (?, ?, ?) "
        "ON CONFLICT(key) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at",
        (key, json.dumps(data, ensure_ascii=False), time.time()),
    )


def read_json(key, default=None):
    init_db()
    conn = get_conn()
    row = conn.execute("SELECT data FROM kv_store WHERE key = ?", (key,)).fetchone()
    if not row:
        return default if default is not None else {}
    try:
        return json.loads(row["data"])
    except json.JSONDecodeError:
        return default if default is not None else {}


def write_json(key, data):
    init_db()
    conn = get_conn()
    with conn:
        _write_kv(conn, key, data)


def create_staff_session(role, ttl_seconds=604800):
    import secrets

    init_db()
    token = secrets.token_hex(32)
    expires = time.time() + ttl_seconds
    conn = get_conn()
    with conn:
        conn.execute(
            "INSERT INTO staff_sessions(token, role, expires_at, created_at) VALUES (?, ?, ?, ?)",
            (token, role, expires, time.time()),
        )
        conn.execute("DELETE FROM staff_sessions WHERE expires_at < ?", (time.time(),))
    return token, expires


def verify_staff_token(token):
    if not token or token.startswith("local-"):
        return False
    init_db()
    conn = get_conn()
    row = conn.execute(
        "SELECT expires_at FROM staff_sessions WHERE token = ?", (token,)
    ).fetchone()
    if not row:
        return False
    if row["expires_at"] < time.time():
        with conn:
            conn.execute("DELETE FROM staff_sessions WHERE token = ?", (token,))
        return False
    return True


def public_site_config():
    cfg = read_json("site-config", DEFAULTS["site-config"])
    safe = {k: v for k, v in cfg.items() if k not in ("directorPin", "mentorPin")}
    return safe