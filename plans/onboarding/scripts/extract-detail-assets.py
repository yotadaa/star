from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
DETAIL = ASSETS / "detail"
W, H = 96, 128
FRAME_COUNT = 4

GENDERS = ("male", "female")
SETS = ("field-researcher", "campus-organizer", "night-coder")
POSES = ("idle", "thinking", "happy", "confused", "greeting", "pointing")
FRAME_OFFSETS = ((0, 0), (0, -1), (0, 0), (0, 1))

PALETTE = {
    "ink": (22, 36, 31, 255),
    "cream": (245, 236, 216, 255),
    "parchment": (234, 221, 192, 255),
    "coral_dark": (184, 73, 43, 255),
    "ink_soft": (71, 88, 79, 255),
}


def rgba(name: str) -> tuple[int, int, int, int]:
    return PALETTE[name]


def load_font(size: int) -> ImageFont.ImageFont:
    for candidate in (
        "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ):
        try:
            return ImageFont.truetype(candidate, size)
        except OSError:
            continue
    return ImageFont.load_default()


def out(path: Path) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    return path


def remove_chroma_key(cell: Image.Image) -> Image.Image:
    image = cell.convert("RGBA")
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            r, g, b, a = pixels[x, y]
            is_key = r > 160 and b > 130 and g < 150
            if is_key:
                pixels[x, y] = (0, 0, 0, 0)
            elif a:
                pixels[x, y] = (r, g, b, 255)
    bbox = image.getbbox()
    if not bbox:
        return Image.new("RGBA", (W, H), (0, 0, 0, 0))
    left, top, right, bottom = bbox
    pad = 6
    left = max(0, left - pad)
    top = max(0, top - pad)
    right = min(image.width, right + pad)
    bottom = min(image.height, bottom + pad)
    sprite = image.crop((left, top, right, bottom))
    scale = min(92 / sprite.width, 124 / sprite.height)
    size = (max(1, int(sprite.width * scale)), max(1, int(sprite.height * scale)))
    return sprite.resize(size, Image.Resampling.NEAREST)


def place(sprite: Image.Image, dx: int = 0, dy: int = 0) -> Image.Image:
    canvas = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    x = (W - sprite.width) // 2 + dx
    y = H - sprite.height - 2 + dy
    canvas.alpha_composite(sprite, (x, y))
    return canvas


def extract_gender(gender: str, manifest: dict) -> None:
    sheet_path = DETAIL / "reference" / f"{gender}-fashion-expressive-sheet.png"
    sheet = Image.open(sheet_path).convert("RGBA")
    manifest["detailPoses"][gender] = {}
    for row, set_name in enumerate(SETS):
        manifest["detailPoses"][gender][set_name] = {}
        y0 = round(row * sheet.height / len(SETS))
        y1 = round((row + 1) * sheet.height / len(SETS))
        for col, pose in enumerate(POSES):
            x0 = round(col * sheet.width / len(POSES))
            x1 = round((col + 1) * sheet.width / len(POSES))
            sprite = remove_chroma_key(sheet.crop((x0, y0, x1, y1)))
            manifest["detailPoses"][gender][set_name][pose] = []
            for frame, (dx, dy) in enumerate(FRAME_OFFSETS):
                path = DETAIL / "poses" / gender / set_name / pose / f"frame-{frame:02d}.png"
                place(sprite, dx, dy).save(out(path), optimize=True)
                manifest["detailPoses"][gender][set_name][pose].append(str(path.relative_to(ROOT)))


def make_contact_sheet(manifest: dict) -> None:
    font = load_font(14)
    sheet = Image.new("RGBA", (900, 1100), rgba("parchment"))
    d = ImageDraw.Draw(sheet)
    d.text((28, 22), "IMAGE-GEN DETAILED EXPRESSIVE POSES", fill=rgba("ink"), font=font)
    y = 62
    for gender in GENDERS:
        for set_name in SETS:
            d.text((28, y + 44), f"{gender}/{set_name}", fill=rgba("coral_dark"), font=font)
            for idx, pose in enumerate(POSES):
                x = 190 + idx * 112
                d.text((x, y), pose, fill=rgba("ink_soft"), font=font)
                img = Image.open(DETAIL / "poses" / gender / set_name / pose / "frame-00.png")
                sheet.alpha_composite(img.resize((72, 96), Image.Resampling.NEAREST), (x + 12, y + 22))
            y += 164
    sheet.save(out(DETAIL / "previews" / "detail-expressive-contact-sheet.png"), optimize=True)


def validate_assets() -> list[str]:
    errors: list[str] = []
    for path in (DETAIL / "poses").glob("**/*.png"):
        image = Image.open(path)
        if image.size != (W, H):
            errors.append(f"{path}: expected {(W, H)}, got {image.size}")
        if image.mode != "RGBA":
            errors.append(f"{path}: expected RGBA, got {image.mode}")
        alpha = image.getchannel("A")
        corners = [alpha.getpixel(pt) for pt in ((0, 0), (W - 1, 0), (0, H - 1), (W - 1, H - 1))]
        if any(corners):
            errors.append(f"{path}: corners are not transparent: {corners}")
    return errors


def main() -> None:
    manifest = {
        "canvas": {"width": W, "height": H},
        "source": "Built-in image generation fashion expressive sheets, cropped from magenta chroma key.",
        "detailPoses": {},
    }
    for gender in GENDERS:
        extract_gender(gender, manifest)
    make_contact_sheet(manifest)
    (DETAIL / "detail-manifest.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    errors = validate_assets()
    if errors:
        raise SystemExit("\n".join(errors))
    print(f"Extracted detailed onboarding poses under {DETAIL / 'poses'}")


if __name__ == "__main__":
    main()
