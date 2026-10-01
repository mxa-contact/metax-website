#!/usr/bin/env python3
"""Generate the estate's favicon set and default social-share card.

Writes (all referenced from every page <head> by tools/seo-head.js):
  /favicon.ico            16/32/48 multi-size
  /img/icon-192.png       web manifest icon
  /img/icon-512.png       web manifest icon
  /apple-touch-icon.png   180x180
  /img/og-image.jpg       1200x630 default Open Graph / Twitter card
(/favicon.svg is hand-written and versioned; it is not generated here.)

Colours are the tokens from css/style.css (--bg, --violet, --cyan, --gold).
Usage: python3 tools/gen-brand-assets.py
"""
import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BG, BG2 = (5, 6, 15), (13, 16, 36)
VIOLET, INDIGO, CYAN, GOLD = (124, 77, 255), (77, 99, 255), (34, 211, 238), (255, 203, 107)
TEXT, MUTED = (238, 241, 255), (166, 173, 207)
FONT_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_R = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def gradient(w, h, c1, c2, diagonal=True):
    g = Image.new("RGB", (w, h))
    px = g.load()
    for y in range(h):
        for x in range(w):
            t = ((x / w) + (y / h)) / 2 if diagonal else x / w
            px[x, y] = lerp(c1, c2, t)
    return g


def star(cx, cy, r, inner=0.28):
    """Four-point star (the estate glyph) as a polygon."""
    import math
    pts = []
    for i in range(8):
        a = math.pi / 4 * i - math.pi / 2
        rr = r if i % 2 == 0 else r * inner
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    return pts


def icon(size):
    s = size * 4  # supersample
    base = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    mask = Image.new("L", (s, s), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, s - 1, s - 1], radius=int(s * 0.22), fill=255)
    bg = Image.new("RGBA", (s, s), BG + (255,))
    base.paste(bg, (0, 0), mask)
    grad = gradient(s, s, VIOLET, CYAN).convert("RGBA")
    smask = Image.new("L", (s, s), 0)
    ImageDraw.Draw(smask).polygon(star(s / 2, s / 2, s * 0.40), fill=255)
    base.paste(grad, (0, 0), smask)
    return base.resize((size, size), Image.LANCZOS)


def og_image(path):
    W, H = 1200, 630
    img = gradient(W, H, BG, BG2).convert("RGBA")
    # soft glow behind the glyph
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([780, 90, 1180, 490], fill=VIOLET + (90,))
    gd.ellipse([860, 170, 1140, 450], fill=CYAN + (60,))
    img = Image.alpha_composite(img, glow.filter(ImageFilter.GaussianBlur(70)))
    # faint grid veil
    veil = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    vd = ImageDraw.Draw(veil)
    for x in range(0, W, 60):
        vd.line([(x, 0), (x, H)], fill=(255, 255, 255, 12))
    for y in range(0, H, 60):
        vd.line([(0, y), (W, y)], fill=(255, 255, 255, 12))
    img = Image.alpha_composite(img, veil)
    # glyph
    grad = gradient(W, H, VIOLET, CYAN).convert("RGBA")
    m = Image.new("L", (W, H), 0)
    ImageDraw.Draw(m).polygon(star(975, 290, 150), fill=255)
    img.paste(grad, (0, 0), m)
    d = ImageDraw.Draw(img)
    f_eye = ImageFont.truetype(FONT_B, 24)
    f_h1 = ImageFont.truetype(FONT_B, 76)
    f_h2 = ImageFont.truetype(FONT_B, 44)
    f_p = ImageFont.truetype(FONT_R, 27)
    d.text((80, 110), "ONE ESTATE · NINE PILLARS", font=f_eye, fill=GOLD)
    d.text((80, 160), "MetaX.Academy", font=f_h1, fill=TEXT)
    d.text((80, 262), "One standard of mastery.", font=f_h2, fill=CYAN)
    lines = ["Every substantive claim carries what a", "stranger needs to find out that it is wrong."]
    for i, ln in enumerate(lines):
        d.text((80, 350 + i * 40), ln, font=f_p, fill=MUTED)
    d.rounded_rectangle([80, 490, 82 + 6, 540], radius=3, fill=VIOLET)
    d.text((104, 492), "TopTech · Method · Ascent · Meta-X · Academies", font=f_p, fill=TEXT)
    d.text((104, 528), "Credentials · Library · License · About", font=f_p, fill=MUTED)
    img.convert("RGB").save(path, "JPEG", quality=88, optimize=True, progressive=True)


def main():
    os.makedirs(os.path.join(ROOT, "img"), exist_ok=True)
    big = icon(256)
    big.save(os.path.join(ROOT, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])
    icon(180).save(os.path.join(ROOT, "apple-touch-icon.png"), optimize=True)
    icon(192).save(os.path.join(ROOT, "img/icon-192.png"), optimize=True)
    icon(512).save(os.path.join(ROOT, "img/icon-512.png"), optimize=True)
    og_image(os.path.join(ROOT, "img/og-image.jpg"))
    print("brand assets written")


if __name__ == "__main__":
    main()
