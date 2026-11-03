#!/usr/bin/env python3
"""
Génère les visuels web optimisés à partir des sources de la charte graphique
(dossier brand/) vers public/img/brand/ et public/.

    python3 scripts/make-brand-assets.py

Dépendances : Pillow, numpy, scipy  (pip install pillow numpy scipy)

Les fichiers générés sont versionnés dans git : Netlify n'a donc PAS besoin de
Python pour construire le site. Ce script ne sert que si les logos changent.
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "brand"
OUT = ROOT / "public" / "img" / "brand"
PUBLIC = ROOT / "public"
OUT.mkdir(parents=True, exist_ok=True)

CREAM = (242, 233, 216)
CORAL = (217, 123, 102)
BROWN = (140, 92, 50)


def save_webp(img: Image.Image, path: Path, quality: int = 88) -> None:
    img.save(path, "WEBP", quality=quality, method=6)
    print(f"  {path.relative_to(ROOT)}  {img.size[0]}x{img.size[1]}  {path.stat().st_size // 1024} Ko")


def save_png(img: Image.Image, path: Path) -> None:
    img.save(path, "PNG", optimize=True)
    print(f"  {path.relative_to(ROOT)}  {img.size[0]}x{img.size[1]}  {path.stat().st_size // 1024} Ko")


def resize_to_width(img: Image.Image, width: int) -> Image.Image:
    height = round(img.height * width / img.width)
    return img.resize((width, height), Image.LANCZOS)


# --------------------------------------------------------------------------
# 1. Icône R&L : 3000x3000 avec ~11 % de marge transparente -> on rogne au
#    dessin, puis on remet une petite marge (pour l'ombre) et on garde un carré.
# --------------------------------------------------------------------------
def make_icon() -> Image.Image:
    icon = Image.open(SRC / "logo_icon.png").convert("RGBA")
    box = icon.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox()
    icon = icon.crop(box)
    side = max(icon.size)
    square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    square.paste(icon, ((side - icon.width) // 2, (side - icon.height) // 2))
    return square


# --------------------------------------------------------------------------
# 2. Wordmark : splash.png est sur fond blanc OPAQUE. On le détoure pour pouvoir
#    le poser sur n'importe quel fond (crème, corail, sombre).
#    - le blanc extérieur (connecté aux bords, peu saturé) devient transparent ;
#    - l'ombre portée grise (aussi peu saturée) devient un noir semi-transparent ;
#    - les reflets blancs DANS les lettres ne sont pas connectés au bord : intacts.
# --------------------------------------------------------------------------
def make_wordmark() -> Image.Image:
    rgb = np.array(Image.open(SRC / "splash.png").convert("RGB")).astype(np.float32)
    mx, mn = rgb.max(axis=2), rgb.min(axis=2)
    sat = mx - mn  # 0 pour le blanc / les gris

    candidate = sat < 22  # blanc + ombre grise (le corail a sat ~ 115)
    labels, _ = ndimage.label(candidate)
    border = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
    border = border[border != 0]
    outside = np.isin(labels, border)

    alpha = np.ones(mn.shape, dtype=np.float32)
    # extérieur : alpha = assombrissement par rapport au blanc (ombre portée)
    shadow_alpha = np.clip((255.0 - mn) / 255.0, 0, 1) * 1.15
    alpha[outside] = np.clip(shadow_alpha[outside], 0, 1)
    out_rgb = rgb.copy()
    out_rgb[outside] = 0  # ombre = noir semi-transparent (sinon halo blanc)

    # Liseré anti-aliasé entre l'extérieur et le corail : on retire la
    # contamination blanche en supposant la couleur du bord = corail.
    near_outside = ndimage.binary_dilation(outside, iterations=3) & ~outside
    coral = np.array(CORAL, dtype=np.float32)
    coral_min = coral.min()
    a_edge = np.clip((255.0 - mn) / (255.0 - coral_min), 0, 1)
    # dans cette zone on traite uniquement les pixels « rosâtres » (mélange blanc/corail)
    blend_zone = near_outside & (sat >= 22) & (mn > coral_min + 4)
    a = a_edge[blend_zone][:, None]
    safe = np.maximum(a, 1e-3)
    decon = (rgb[blend_zone] - 255.0 * (1 - a)) / safe
    out_rgb[blend_zone] = np.clip(decon, 0, 255)
    alpha[blend_zone] = a[:, 0]

    rgba = np.dstack([out_rgb, alpha * 255.0]).clip(0, 255).astype(np.uint8)
    img = Image.fromarray(rgba, "RGBA")
    box = img.getchannel("A").point(lambda v: 255 if v > 6 else 0).getbbox()
    pad = 12
    box = (max(box[0] - pad, 0), max(box[1] - pad, 0), min(box[2] + pad, img.width), min(box[3] + pad, img.height))
    return img.crop(box)


# --------------------------------------------------------------------------
# 3. Image de partage réseaux sociaux (1200x630) à partir de splash_2.png
#    (3:1 -> on l'étend verticalement avec le dégradé corail, bords fondus).
# --------------------------------------------------------------------------
def make_og() -> Image.Image:
    w, h = 1200, 630
    splash = Image.open(SRC / "splash_2.png").convert("RGB")
    splash = resize_to_width(splash, w)  # 1200x400
    # fond : dégradé radial identique à celui de l'image
    yy, xx = np.mgrid[0:h, 0:w]
    d = np.sqrt(((xx - w / 2) / (w * 0.62)) ** 2 + ((yy - h / 2) / (h * 0.62)) ** 2)
    t = np.clip(d, 0, 1)[..., None]
    center = np.array([229, 160, 145], dtype=np.float32)
    edge = np.array(CORAL, dtype=np.float32)
    bg = (center * (1 - t) + edge * t).astype(np.uint8)
    canvas = Image.fromarray(bg, "RGB")
    # masque fondu en haut/bas pour raccorder l'image au fond
    mask = Image.new("L", splash.size, 255)
    fade = 60
    arr = np.full((splash.height, splash.width), 255, dtype=np.float32)
    ramp = np.linspace(0, 255, fade)
    arr[:fade] = ramp[:, None]
    arr[-fade:] = ramp[::-1][:, None]
    mask = Image.fromarray(arr.astype(np.uint8), "L")
    canvas.paste(splash, (0, (h - splash.height) // 2 - 10), mask)
    return canvas


def make_favicons(icon: Image.Image) -> None:
    # favicon : on garde la transparence
    sizes = [(16, 16), (32, 32), (48, 48)]
    icon.resize((256, 256), Image.LANCZOS).save(PUBLIC / "favicon.ico", sizes=sizes)
    print(f"  public/favicon.ico  {sizes}")
    save_png(icon.resize((32, 32), Image.LANCZOS), PUBLIC / "favicon-32.png")

    def on_cream(size: int, inset: float) -> Image.Image:
        # iOS / Android remplissent la transparence en noir : fond crème + marge de sécurité
        canvas = Image.new("RGBA", (size, size), CREAM + (255,))
        inner = round(size * (1 - 2 * inset))
        canvas.paste(icon.resize((inner, inner), Image.LANCZOS), ((size - inner) // 2,) * 2, icon.resize((inner, inner), Image.LANCZOS))
        return canvas.convert("RGB")

    save_png(on_cream(180, 0.06), PUBLIC / "apple-touch-icon.png")
    save_png(on_cream(192, 0.08), PUBLIC / "icon-192.png")
    save_png(on_cream(512, 0.08), PUBLIC / "icon-512.png")
    # « maskable » : zone de sécurité de 20 % de chaque côté
    save_png(on_cream(512, 0.18), PUBLIC / "icon-maskable-512.png")


def main() -> None:
    print("Icône R&L")
    icon = make_icon()
    save_webp(resize_to_width(icon, 128), OUT / "logo-icon-128.webp")
    save_webp(resize_to_width(icon, 512), OUT / "logo-icon-512.webp", quality=90)
    make_favicons(icon)

    print("Wordmark Repair n' Learn (détouré)")
    wm = make_wordmark()
    print(f"  recadrage : {wm.size[0]}x{wm.size[1]}  (ratio {wm.size[0] / wm.size[1]:.2f}:1)")
    save_webp(resize_to_width(wm, 640), OUT / "wordmark-640.webp", quality=90)
    save_webp(resize_to_width(wm, 1280), OUT / "wordmark-1280.webp", quality=90)

    print("Image de partage (Open Graph)")
    og = make_og()
    path = PUBLIC / "og-image.jpg"
    og.save(path, "JPEG", quality=88, optimize=True, progressive=True)
    print(f"  public/og-image.jpg  1200x630  {path.stat().st_size // 1024} Ko")



if __name__ == "__main__":
    main()
