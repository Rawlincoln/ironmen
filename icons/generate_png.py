#!/usr/bin/env python3
"""Generate PNG app icons for iOS / store listings. Requires: py -m pip install pillow"""

import io
import struct
import sys
import zlib
from pathlib import Path

ICONS_DIR = Path(__file__).parent
SIZES = [72, 96, 128, 144, 152, 192, 384, 512]

BG = (13, 17, 23)
GOLD = (212, 168, 83)
GOLD_LIGHT = (240, 215, 140)


def _png_chunk(tag: bytes, data: bytes) -> bytes:
    crc = zlib.crc32(tag + data) & 0xFFFFFFFF
    return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", crc)


def write_png(path: Path, size: int) -> None:
    """Minimal PNG writer — dark tile with gold cross / sword motif."""
    pixels = bytearray()
    cx, cy = size // 2, int(size * 0.42)
    blade_half = max(2, size // 32)
    blade_len = int(size * 0.28)
    guard_w = int(size * 0.22)
    guard_h = max(3, size // 40)
    corner = max(8, size // 8)

    for y in range(size):
        row = bytearray([0])  # filter byte
        for x in range(size):
            in_round = (x - corner) ** 2 + (y - corner) ** 2 > corner ** 2 and x < corner and y < corner
            in_round |= (x - (size - corner)) ** 2 + (y - corner) ** 2 > corner ** 2 and x > size - corner and y < corner
            in_round |= (x - corner) ** 2 + (y - (size - corner)) ** 2 > corner ** 2 and x < corner and y > size - corner
            in_round |= (x - (size - corner)) ** 2 + (y - (size - corner)) ** 2 > corner ** 2 and x > size - corner and y > size - corner

            if in_round:
                row.extend((0, 0, 0, 0))
                continue

            on_blade = abs(x - cx) <= blade_half and cy - blade_len <= y <= cy + int(size * 0.08)
            on_guard = cy + int(size * 0.06) <= y <= cy + int(size * 0.06) + guard_h and abs(x - cx) <= guard_w // 2
            on_pommel = (x - cx) ** 2 + (y - (cy - blade_len - size // 20)) ** 2 <= (size // 16) ** 2
            border = x < 3 or y < 3 or x >= size - 3 or y >= size - 3

            if on_blade or on_guard or on_pommel:
                color = GOLD_LIGHT if y < cy else GOLD
            elif border:
                color = (28, 33, 40)
            else:
                color = BG
            row.extend((*color, 255))
        pixels.extend(row)

    raw = zlib.compress(bytes(pixels), 9)
    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)
    png = b"\x89PNG\r\n\x1a\n"
    png += _png_chunk(b"IHDR", ihdr)
    png += _png_chunk(b"IDAT", raw)
    png += _png_chunk(b"IEND", b"")
    path.write_bytes(png)


def main():
    try:
        from PIL import Image, ImageDraw
        use_pil = True
    except ImportError:
        use_pil = False

    for size in SIZES:
        out = ICONS_DIR / f"icon-{size}.png"
        if use_pil:
            img = Image.new("RGBA", (size, size), BG + (255,))
            draw = ImageDraw.Draw(img)
            margin = size // 16
            draw.rounded_rectangle([margin, margin, size - margin, size - margin], radius=size // 8, outline=GOLD, width=max(1, size // 128))
            cx, top = size // 2, int(size * 0.22)
            blade_w = max(4, size // 24)
            blade_h = int(size * 0.36)
            draw.rectangle([cx - blade_w, top, cx + blade_w, top + blade_h], fill=GOLD_LIGHT)
            gy = top + blade_h + size // 64
            draw.rectangle([cx - size // 5, gy, cx + size // 5, gy + max(4, size // 40)], fill=GOLD)
            draw.ellipse([cx - size // 14, top - size // 10, cx + size // 14, top + size // 14], fill=GOLD)
            img.save(out, "PNG")
        else:
            write_png(out, size)
        print(f"Wrote {out.name}")


if __name__ == "__main__":
    main()