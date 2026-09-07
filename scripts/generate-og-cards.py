#!/usr/bin/env python3
"""The social share cards in public/og/, and favicon.ico.

A link to preqal.org pasted into WhatsApp, LinkedIn, iMessage or Slack shows
og:image. Two crops of that one picture matter: the large card (about 1.9:1)
and the small square thumbnail shown while composing, which is the middle of
the image. So the mark sits dead centre, where both crops keep it, and the
only text is one short line under the wordmark. The image says who; the
og:title and og:description say what.

These cards are rendered here, on demand, and committed — not in the build.
The build used to draw them in CI with whatever font Ubuntu had, which is
how the old card shipped in DejaVu Sans on a Rubik-only brand.

    python3 scripts/generate-og-cards.py            # writes public/og/*.png and public/favicon.ico
    python3 scripts/generate-og-cards.py --preview  # writes light + dark home cards to /tmp for a look

Needs Pillow (python3 -m pip install pillow). The Rubik faces come from the
@fontsource/rubik package the site already bundles.
"""
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
OUT = PUBLIC / "og"
FONTS = ROOT / "node_modules" / "@fontsource" / "rubik" / "files"

W, H = 1200, 630
BG = (0xE0, 0xE5, 0xEC)            # page background
NAVY = (0x0F, 0x17, 0x2A)          # dark band
SLATE_700 = (0x33, 0x41, 0x55)     # strong body text
SHADOW_DARK = (0xA3, 0xB1, 0xC6)   # neu shadow, dark side
SHADOW_LIGHT = (0xFF, 0xFF, 0xFF)  # neu shadow, light side
AMBER_600 = (0xD9, 0x77, 0x06)

# One card per page. The line is the only copy in the picture, so it is short
# and set in Rubik 500 — a caption under the mark, not a headline. It has to
# fit the middle square (630px) so the compose-box thumbnail never clips it.
CARDS = {
    "home": "ISO 9001 system setup for SMEs",
    "services": "Five fixed-scope services for SMEs",
    "resources": "Free quality management templates",
    "e-courses": "Build Systems That Actually Work",
    "e-courses-register": "Build Systems That Actually Work",
    "contact": "Talk to Dr. Stefan Gravesande",
    "book": "Book a Risk Scan",
    "bga": "Business Growth Assessment",
    "preqal-not-prequel": "Preqal, not prequel",
    "about": "Who you will be talking to",
    "case-studies": "Client stories",
}


def rubik(weight: int, size: int) -> ImageFont.FreeTypeFont:
    """Rubik at a weight, loaded from the web font files (FreeType reads WOFF)."""
    for ext in ("woff2", "woff"):
        try:
            return ImageFont.truetype(str(FONTS / f"rubik-latin-{weight}-normal.{ext}"), size)
        except OSError:
            continue
    raise SystemExit(f"Rubik {weight} not found under {FONTS}; run npm install first")


def rounded(size, radius, fill, alpha=255):
    layer = Image.new("RGBA", size, (0, 0, 0, 0))
    ImageDraw.Draw(layer).rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), radius, fill=(*fill, alpha))
    return layer


def light_ground() -> Image.Image:
    """The page background with one raised neumorphic panel, as the site draws them."""
    img = Image.new("RGBA", (W, H), (*BG, 255))
    # neu-raised-lg is 10px 10px 20px: a 20px CSS blur is a Gaussian of sigma 10.
    inset, radius, offset, sigma = 60, 36, 10, 10
    panel = (W - 2 * inset, H - 2 * inset)
    for dx, dy, color, alpha in ((-offset, -offset, SHADOW_LIGHT, 255), (offset, offset, SHADOW_DARK, 150)):
        shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        shadow.paste(rounded(panel, radius, color, alpha), (inset + dx, inset + dy))
        img = Image.alpha_composite(img, shadow.filter(ImageFilter.GaussianBlur(sigma)))
    face = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    face.paste(rounded(panel, radius, BG), (inset, inset))
    return Image.alpha_composite(img, face)


def dark_ground() -> Image.Image:
    """The dark navy band: diagonal texture and an amber glow on the left."""
    img = Image.new("RGBA", (W, H), (*NAVY, 255))
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse((-420, -80, 660, H + 80), fill=(*AMBER_600, 26))
    img = Image.alpha_composite(img, glow.filter(ImageFilter.GaussianBlur(90)))
    stripes = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(stripes)
    for x in range(-H, W + H, 80):
        d.polygon([(x, H), (x + 40, H), (x + 40 + H, 0), (x + H, 0)], fill=(255, 255, 255, 3))
    return Image.alpha_composite(img, stripes)


def card(line: str, dark: bool = False) -> Image.Image:
    img = dark_ground() if dark else light_ground()

    mark = Image.open(PUBLIC / "favicon.png").convert("RGBA")
    wordmark = Image.open(PUBLIC / "Preqal Logo Sep25-9.png").convert("RGBA")
    font = rubik(500, 32)

    mark_h, word_w = 250, 372
    mark = mark.resize((round(mark.width * mark_h / mark.height), mark_h), Image.LANCZOS)
    wordmark = wordmark.resize((word_w, round(wordmark.height * word_w / wordmark.width)), Image.LANCZOS)
    gap_mark, gap_word = 26, 34
    line_h = font.getbbox("Ag")[3]
    line_w = font.getlength(line)
    assert line_w <= H - 40, f"{line!r} is {line_w:.0f}px wide; it must fit the {H}px middle square"
    block = mark.height + gap_mark + wordmark.height + gap_word + line_h
    y = (H - block) // 2

    img.alpha_composite(mark, ((W - mark.width) // 2, y))
    y += mark.height + gap_mark
    img.alpha_composite(wordmark, ((W - wordmark.width) // 2, y))
    y += wordmark.height + gap_word
    ImageDraw.Draw(img).text(
        (W // 2, y), line, font=font, anchor="mt",
        fill=(255, 255, 255, 190) if dark else (*SLATE_700, 255),
    )
    return img.convert("RGB")


def favicon_ico() -> None:
    """Some link-preview and crawler code asks for /favicon.ico by name and
    never reads the <link> tags; the site had none, so the card had no badge."""
    Image.open(PUBLIC / "favicon.png").convert("RGBA").save(
        PUBLIC / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)]
    )


def main() -> None:
    if "--preview" in sys.argv:
        out = Path(sys.argv[sys.argv.index("--preview") + 1]) if len(sys.argv) > sys.argv.index("--preview") + 1 else Path("/tmp")
        for name, dark in (("home-light", False), ("home-dark", True)):
            card(CARDS["home"], dark).save(out / f"{name}.png", optimize=True)
            print(f"preview: {out / name}.png")
        return

    OUT.mkdir(parents=True, exist_ok=True)
    for stale in OUT.glob("*.webp"):
        stale.unlink()
    for name, line in CARDS.items():
        path = OUT / f"{name}.png"
        card(line).save(path, optimize=True)
        kb = path.stat().st_size // 1024
        assert kb < 300, f"{path.name} is {kb}KB; WhatsApp only shows a large card under 300KB"
        print(f"✓ og/{name}.png  {kb}KB")
    favicon_ico()
    print("✓ favicon.ico")


if __name__ == "__main__":
    main()
