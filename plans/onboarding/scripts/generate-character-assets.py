from __future__ import annotations

import json
from pathlib import Path
from typing import Iterable

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
W, H = 96, 128

PALETTE = {
    "ink": (22, 36, 31, 255),
    "ink_soft": (71, 88, 79, 255),
    "cream": (245, 236, 216, 255),
    "parchment": (234, 221, 192, 255),
    "parchment_dark": (221, 203, 164, 255),
    "gold": (236, 182, 63, 255),
    "aurora": (69, 184, 164, 255),
    "aurora_deep": (43, 138, 122, 255),
    "moss": (106, 154, 85, 255),
    "moss_dark": (63, 95, 52, 255),
    "coral": (224, 106, 69, 255),
    "coral_dark": (184, 73, 43, 255),
}

GENDERS = ("male", "female")
VIEWS = ("front", "back", "side")
POSES = {
    "idle": VIEWS,
    "walk": VIEWS,
    "sit-floor": ("front",),
    "sit-chair": ("side",),
}
EXPRESSIVE_POSES = ("idle", "thinking", "happy", "confused", "greeting", "pointing")
FRAME_COUNT = 4

SETS = {
    "field-researcher": {
        "hair": "short-crop",
        "face-accessory": "round-glasses",
        "expression": "focused",
        "shirt": "field-shirt",
        "body-accessory": "satchel",
        "pants": "utility-pants",
        "shoes": "boots",
    },
    "campus-organizer": {
        "hair": "side-part",
        "face-accessory": "round-glasses",
        "expression": "happy",
        "shirt": "varsity-tee",
        "body-accessory": "lanyard",
        "pants": "straight-pants",
        "shoes": "sneakers",
    },
    "night-coder": {
        "hair": "low-bun",
        "face-accessory": "half-mask",
        "expression": "calm",
        "shirt": "pixel-hoodie",
        "body-accessory": "utility-strap",
        "pants": "dark-cargos",
        "shoes": "soft-boots",
    },
}

INDEPENDENT = {
    "hair": ("short-crop", "side-part", "low-bun"),
    "face-accessory": ("round-glasses", "half-mask", "mustache"),
    "expression": ("calm", "happy", "focused"),
    "shirt": ("plain-tee", "field-shirt", "varsity-tee", "pixel-hoodie"),
    "body-accessory": ("satchel", "lanyard", "utility-strap"),
    "pants": ("utility-pants", "straight-pants", "dark-cargos", "shorts"),
    "shoes": ("boots", "sneakers", "soft-boots"),
}


def rgba(name: str) -> tuple[int, int, int, int]:
    return PALETTE[name]


def out(path: Path) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    return path


def new() -> Image.Image:
    return Image.new("RGBA", (W, H), (0, 0, 0, 0))


def draw_box(d: ImageDraw.ImageDraw, box, fill, outline="ink", width=2) -> None:
    d.rectangle(box, fill=rgba(fill), outline=rgba(outline), width=width)


def draw_poly(d: ImageDraw.ImageDraw, pts, fill, outline="ink") -> None:
    d.polygon(pts, fill=rgba(fill), outline=rgba(outline))


def draw_head(d: ImageDraw.ImageDraw, x: int, y: int, gender: str, view: str) -> None:
    skin = "cream"
    if view == "side":
        d.ellipse((x + 4, y, x + 28, y + 28), fill=rgba(skin), outline=rgba("ink"), width=2)
        d.rectangle((x + 26, y + 12, x + 31, y + 17), fill=rgba(skin), outline=rgba("ink"), width=1)
        d.rectangle((x + 5, y + 13, x + 9, y + 18), fill=rgba(skin), outline=rgba("ink"), width=1)
    else:
        d.ellipse((x, y, x + 28, y + 28), fill=rgba(skin), outline=rgba("ink"), width=2)
        d.rectangle((x - 4, y + 12, x, y + 18), fill=rgba(skin), outline=rgba("ink"), width=1)
        d.rectangle((x + 28, y + 12, x + 32, y + 18), fill=rgba(skin), outline=rgba("ink"), width=1)
    d.rectangle((x + 11, y + 28, x + 17, y + 35), fill=rgba(skin), outline=rgba("ink"), width=1)
    if gender == "female":
        d.line((x + 6, y + 25, x + 22, y + 25), fill=rgba("parchment_dark"), width=1)


def draw_face(d: ImageDraw.ImageDraw, x: int, y: int, expression: str) -> None:
    if expression == "happy":
        d.arc((x + 6, y + 10, x + 13, y + 17), 10, 170, fill=rgba("ink"), width=2)
        d.arc((x + 16, y + 10, x + 23, y + 17), 10, 170, fill=rgba("ink"), width=2)
        d.rectangle((x + 11, y + 21, x + 18, y + 23), fill=rgba("coral_dark"))
    elif expression == "focused":
        d.rectangle((x + 7, y + 12, x + 12, y + 14), fill=rgba("ink"))
        d.rectangle((x + 17, y + 12, x + 22, y + 14), fill=rgba("ink"))
        d.line((x + 9, y + 9, x + 13, y + 11), fill=rgba("ink"), width=1)
        d.line((x + 20, y + 9, x + 16, y + 11), fill=rgba("ink"), width=1)
        d.rectangle((x + 13, y + 22, x + 17, y + 23), fill=rgba("ink"))
    else:
        d.rectangle((x + 8, y + 13, x + 11, y + 16), fill=rgba("ink"))
        d.rectangle((x + 18, y + 13, x + 21, y + 16), fill=rgba("ink"))
        d.rectangle((x + 12, y + 22, x + 18, y + 23), fill=rgba("ink"))


def draw_limb(d, box, skin="cream") -> None:
    d.rectangle(box, fill=rgba(skin), outline=rgba("ink"), width=2)


def draw_pose_symbol(d: ImageDraw.ImageDraw, pose: str, frame: int) -> None:
    drift = [0, -1, 0, 1][frame % 4]
    if pose == "thinking":
        d.ellipse((64, 8 + drift, 88, 31 + drift), fill=rgba("cream"), outline=rgba("ink"), width=2)
        d.ellipse((58, 29 + drift, 66, 37 + drift), fill=rgba("cream"), outline=rgba("ink"), width=1)
        d.rectangle((73, 16 + drift, 79, 22 + drift), fill=rgba("gold"), outline=rgba("ink"), width=1)
        d.rectangle((75, 13 + drift, 77, 25 + drift), fill=rgba("gold"))
        d.rectangle((70, 18 + drift, 82, 20 + drift), fill=rgba("gold"))
    elif pose == "happy":
        for x, y in ((22, 21 + drift), (72, 18 - drift), (78, 38 + drift)):
            d.line((x, y - 5, x, y + 5), fill=rgba("gold"), width=2)
            d.line((x - 5, y, x + 5, y), fill=rgba("gold"), width=2)
    elif pose == "confused":
        x, y = 68, 12 + drift
        d.rectangle((x, y, x + 12, y + 4), fill=rgba("gold"), outline=rgba("ink"), width=1)
        d.rectangle((x + 8, y + 4, x + 12, y + 12), fill=rgba("gold"), outline=rgba("ink"), width=1)
        d.rectangle((x + 4, y + 12, x + 8, y + 17), fill=rgba("gold"), outline=rgba("ink"), width=1)
        d.rectangle((x + 4, y + 23, x + 8, y + 27), fill=rgba("gold"), outline=rgba("ink"), width=1)
    elif pose == "greeting":
        d.line((73, 20 + drift, 83, 12 + drift), fill=rgba("coral_dark"), width=2)
        d.line((78, 25 + drift, 90, 23 + drift), fill=rgba("coral_dark"), width=2)
    elif pose == "pointing":
        d.rectangle((79, 45 + drift, 88, 49 + drift), fill=rgba("gold"), outline=rgba("ink"), width=1)
        d.rectangle((86, 47 + drift, 91, 51 + drift), fill=rgba("gold"), outline=rgba("ink"), width=1)


def draw_expressive_base(gender: str, pose: str, frame: int) -> Image.Image:
    img = new()
    d = ImageDraw.Draw(img)
    bob = [0, -1, 0, 1][frame % 4]
    sway = [-1, 0, 1, 0][frame % 4]
    skin = "cream"
    under = "parchment" if gender == "male" else "parchment_dark"
    face = {
        "idle": "calm",
        "thinking": "focused",
        "happy": "happy",
        "confused": "calm",
        "greeting": "happy",
        "pointing": "focused",
    }[pose]

    draw_head(d, 34, 12 + bob, gender, "front")
    draw_face(d, 34, 12 + bob, face)

    if pose == "greeting":
        draw_limb(d, (25, 52 + bob, 35, 78 + bob))
        draw_poly(d, ((62, 51 + bob), (70, 48 + bob), (76 + sway, 29 + bob), (68 + sway, 27 + bob), (61, 45 + bob)), skin)
        d.rectangle((68 + sway, 21 + bob, 78 + sway, 32 + bob), fill=rgba(skin), outline=rgba("ink"), width=2)
    elif pose == "pointing":
        draw_limb(d, (25, 52 + bob, 35, 78 + bob))
        draw_limb(d, (60, 50 + bob, 84, 61 + bob))
        d.rectangle((82, 49 + bob, 92, 59 + bob), fill=rgba(skin), outline=rgba("ink"), width=2)
    elif pose == "thinking":
        draw_limb(d, (25, 52 + bob, 35, 78 + bob))
        draw_poly(d, ((61, 53 + bob), (70, 57 + bob), (65, 71 + bob), (57, 68 + bob)), skin)
        d.rectangle((56, 42 + bob, 66, 55 + bob), fill=rgba(skin), outline=rgba("ink"), width=2)
    elif pose == "happy":
        draw_poly(d, ((25, 55 + bob), (35, 51 + bob), (29 + sway, 72 + bob), (21 + sway, 75 + bob)), skin)
        draw_poly(d, ((61, 51 + bob), (71, 55 + bob), (77 - sway, 75 + bob), (69 - sway, 78 + bob)), skin)
    elif pose == "confused":
        draw_poly(d, ((25, 54 + bob), (35, 52 + bob), (31, 80 + bob), (21, 78 + bob)), skin)
        draw_poly(d, ((61, 52 + bob), (71, 54 + bob), (75, 78 + bob), (65, 80 + bob)), skin)
    else:
        draw_limb(d, (25, 51 + bob, 35, 78 + bob))
        draw_limb(d, (61, 51 + bob, 71, 78 + bob))

    draw_poly(d, ((34, 48 + bob), (62, 48 + bob), (58, 78 + bob), (38, 78 + bob)), skin)
    if gender == "female":
        d.rectangle((36, 51 + bob, 60, 61 + bob), fill=rgba(under), outline=rgba("ink"), width=2)
    d.rectangle((38, 68 + bob, 58, 80 + bob), fill=rgba(under), outline=rgba("ink"), width=2)
    leg_shift = [0, 1, 0, -1][frame % 4]
    draw_limb(d, (36 + leg_shift, 78 + bob, 46 + leg_shift, 111 + bob))
    draw_limb(d, (50 - leg_shift, 78 + bob, 60 - leg_shift, 111 + bob))
    d.rectangle((33 + leg_shift, 108 + bob, 48 + leg_shift, 116 + bob), fill=rgba(skin), outline=rgba("ink"), width=2)
    d.rectangle((48 - leg_shift, 108 + bob, 63 - leg_shift, 116 + bob), fill=rgba(skin), outline=rgba("ink"), width=2)
    draw_pose_symbol(d, pose, frame)
    return img


def draw_base(gender: str, pose: str, view: str, frame: int) -> Image.Image:
    img = new()
    d = ImageDraw.Draw(img)
    bob = [0, -1, 0, 1][frame % 4] if pose == "idle" else [0, 0, -1, 0][frame % 4]
    step = [-5, -2, 4, 2][frame % 4] if pose == "walk" else 0
    skin = "cream"
    under = "parchment" if gender == "male" else "parchment_dark"

    if pose == "sit-floor":
        y = 16 + [0, -1, 0, 1][frame % 4]
        draw_head(d, 34, y, gender, "front")
        draw_face(d, 34, y, "calm")
        draw_poly(d, ((34, 50 + y // 16), (62, 50 + y // 16), (58, 78), (38, 78)), skin)
        d.rectangle((36, 54, 60, 68), fill=rgba(under), outline=rgba("ink"), width=2)
        draw_limb(d, (25, 58, 35, 82))
        draw_limb(d, (61, 58, 71, 82))
        draw_limb(d, (23, 82, 47, 91))
        draw_limb(d, (49, 82, 73, 91))
        d.rectangle((34, 88, 44, 96), fill=rgba(skin), outline=rgba("ink"), width=2)
        d.rectangle((52, 88, 62, 96), fill=rgba(skin), outline=rgba("ink"), width=2)
        return img

    if pose == "sit-chair":
        y = 12 + [0, -1, 0, 1][frame % 4]
        draw_head(d, 38, y, gender, "side")
        draw_face(d, 42, y, "calm")
        draw_poly(d, ((42, 48), (60, 48), (62, 74), (43, 74)), skin)
        d.rectangle((44, 54, 62, 69), fill=rgba(under), outline=rgba("ink"), width=2)
        draw_limb(d, (58, 54, 67, 75))
        draw_limb(d, (41, 74, 64, 84))
        draw_limb(d, (60, 80, 70, 105))
        d.rectangle((58, 102, 76, 110), fill=rgba(skin), outline=rgba("ink"), width=2)
        return img

    if view == "front":
        draw_head(d, 34, 12 + bob, gender, view)
        draw_face(d, 34, 12 + bob, "calm")
        draw_poly(d, ((34, 48 + bob), (62, 48 + bob), (58, 78 + bob), (38, 78 + bob)), skin)
        if gender == "female":
            d.rectangle((36, 51 + bob, 60, 61 + bob), fill=rgba(under), outline=rgba("ink"), width=2)
        d.rectangle((38, 68 + bob, 58, 80 + bob), fill=rgba(under), outline=rgba("ink"), width=2)
        draw_limb(d, (25, 51 + bob - step // 3, 35, 78 + bob - step))
        draw_limb(d, (61, 51 + bob + step // 3, 71, 78 + bob + step))
        draw_limb(d, (36 + step // 2, 78 + bob, 46 + step, 111 + bob))
        draw_limb(d, (50 - step // 2, 78 + bob, 60 - step, 111 + bob))
        d.rectangle((33 + step, 108 + bob, 48 + step, 116 + bob), fill=rgba(skin), outline=rgba("ink"), width=2)
        d.rectangle((48 - step, 108 + bob, 63 - step, 116 + bob), fill=rgba(skin), outline=rgba("ink"), width=2)
    elif view == "back":
        draw_head(d, 34, 12 + bob, gender, view)
        draw_poly(d, ((34, 48 + bob), (62, 48 + bob), (59, 78 + bob), (37, 78 + bob)), skin)
        d.line((48, 43 + bob, 48, 74 + bob), fill=rgba("parchment_dark"), width=1)
        if gender == "female":
            d.rectangle((36, 51 + bob, 60, 61 + bob), fill=rgba(under), outline=rgba("ink"), width=2)
        d.rectangle((38, 68 + bob, 58, 80 + bob), fill=rgba(under), outline=rgba("ink"), width=2)
        draw_limb(d, (25, 51 + bob - step // 3, 35, 78 + bob - step))
        draw_limb(d, (61, 51 + bob + step // 3, 71, 78 + bob + step))
        draw_limb(d, (36 + step // 2, 78 + bob, 46 + step, 111 + bob))
        draw_limb(d, (50 - step // 2, 78 + bob, 60 - step, 111 + bob))
        d.rectangle((33 + step, 108 + bob, 48 + step, 116 + bob), fill=rgba(skin), outline=rgba("ink"), width=2)
        d.rectangle((48 - step, 108 + bob, 63 - step, 116 + bob), fill=rgba(skin), outline=rgba("ink"), width=2)
    else:
        draw_head(d, 38, 12 + bob, gender, view)
        draw_face(d, 42, 12 + bob, "calm")
        draw_poly(d, ((42, 48 + bob), (59, 48 + bob), (62, 78 + bob), (43, 78 + bob)), skin)
        if gender == "female":
            d.rectangle((44, 52 + bob, 62, 61 + bob), fill=rgba(under), outline=rgba("ink"), width=2)
        d.rectangle((44, 68 + bob, 61, 80 + bob), fill=rgba(under), outline=rgba("ink"), width=2)
        draw_limb(d, (56, 51 + bob + step // 2, 66, 78 + bob + step))
        draw_limb(d, (42 - step // 2, 78 + bob, 52 - step, 111 + bob))
        draw_limb(d, (55 + step // 2, 78 + bob, 65 + step, 111 + bob))
        d.rectangle((39 - step, 108 + bob, 55 - step, 116 + bob), fill=rgba(skin), outline=rgba("ink"), width=2)
        d.rectangle((55 + step, 108 + bob, 74 + step, 116 + bob), fill=rgba(skin), outline=rgba("ink"), width=2)
    return img


def item_layer(gender: str, category: str, name: str) -> Image.Image:
    img = new()
    d = ImageDraw.Draw(img)
    head_x, head_y = 34, 12
    if category == "hair":
        if name == "short-crop":
            d.arc((31, 9, 65, 40), 190, 350, fill=rgba("coral_dark"), width=7)
            d.rectangle((34, 14, 62, 20), fill=rgba("coral_dark"))
        elif name == "side-part":
            d.pieslice((29, 8, 67, 44), 180, 360, fill=rgba("coral"), outline=rgba("ink"))
            d.rectangle((34, 14, 47, 20), fill=rgba("gold"))
            d.rectangle((30, 28, 36, 44), fill=rgba("coral_dark"), outline=rgba("ink"))
        else:
            d.pieslice((31, 9, 65, 43), 180, 360, fill=rgba("coral"), outline=rgba("ink"))
            d.ellipse((24, 25, 38, 42), fill=rgba("coral_dark"), outline=rgba("ink"), width=2)
            d.ellipse((58, 25, 72, 42), fill=rgba("coral_dark"), outline=rgba("ink"), width=2)
    elif category == "face-accessory":
        if name == "round-glasses":
            d.ellipse((39, 25, 48, 34), outline=rgba("ink"), width=2)
            d.ellipse((50, 25, 59, 34), outline=rgba("ink"), width=2)
            d.line((48, 29, 50, 29), fill=rgba("ink"), width=1)
        elif name == "half-mask":
            d.rectangle((38, 27, 60, 37), fill=rgba("ink_soft"), outline=rgba("ink"), width=2)
            d.rectangle((42, 30, 46, 33), fill=rgba("cream"))
            d.rectangle((52, 30, 56, 33), fill=rgba("cream"))
        else:
            d.rectangle((42, 35, 56, 39), fill=rgba("ink"), outline=rgba("ink"))
    elif category == "expression":
        draw_face(d, head_x, head_y, name)
    elif category == "shirt":
        if name == "plain-tee":
            draw_poly(d, ((30, 48), (66, 48), (63, 78), (33, 78)), "aurora")
        elif name == "field-shirt":
            draw_poly(d, ((29, 47), (67, 47), (63, 80), (33, 80)), "moss")
            d.rectangle((43, 49, 53, 80), fill=rgba("parchment"), outline=rgba("ink"), width=1)
            d.rectangle((34, 56, 44, 65), fill=rgba("moss_dark"), outline=rgba("ink"), width=1)
            d.rectangle((53, 56, 63, 65), fill=rgba("moss_dark"), outline=rgba("ink"), width=1)
        elif name == "varsity-tee":
            draw_poly(d, ((30, 48), (66, 48), (63, 79), (33, 79)), "coral")
            d.rectangle((44, 51, 52, 74), fill=rgba("gold"))
        else:
            draw_poly(d, ((28, 46), (68, 46), (65, 82), (31, 82)), "ink_soft")
            d.rectangle((41, 48, 55, 58), fill=rgba("gold"), outline=rgba("ink"), width=1)
            d.rectangle((31, 45, 65, 51), fill=rgba("ink"), outline=rgba("ink"), width=1)
    elif category == "body-accessory":
        if name == "satchel":
            d.line((33, 47, 64, 82), fill=rgba("gold"), width=4)
            d.rectangle((58, 73, 73, 90), fill=rgba("moss_dark"), outline=rgba("ink"), width=2)
        elif name == "lanyard":
            d.line((43, 48, 48, 66), fill=rgba("gold"), width=2)
            d.line((53, 48, 48, 66), fill=rgba("gold"), width=2)
            d.rectangle((44, 66, 52, 76), fill=rgba("aurora"), outline=rgba("ink"), width=1)
        else:
            d.line((32, 49, 64, 77), fill=rgba("ink"), width=4)
            d.rectangle((31, 74, 65, 80), fill=rgba("gold"), outline=rgba("ink"), width=1)
    elif category == "pants":
        if name == "utility-pants":
            d.rectangle((35, 78, 47, 110), fill=rgba("moss_dark"), outline=rgba("ink"), width=2)
            d.rectangle((49, 78, 61, 110), fill=rgba("moss_dark"), outline=rgba("ink"), width=2)
            d.rectangle((34, 88, 46, 95), fill=rgba("gold"), outline=rgba("ink"), width=1)
        elif name == "straight-pants":
            d.rectangle((35, 78, 47, 111), fill=rgba("aurora_deep"), outline=rgba("ink"), width=2)
            d.rectangle((49, 78, 61, 111), fill=rgba("aurora_deep"), outline=rgba("ink"), width=2)
        elif name == "shorts":
            d.rectangle((35, 78, 47, 96), fill=rgba("coral_dark"), outline=rgba("ink"), width=2)
            d.rectangle((49, 78, 61, 96), fill=rgba("coral_dark"), outline=rgba("ink"), width=2)
        else:
            d.rectangle((35, 78, 47, 111), fill=rgba("ink_soft"), outline=rgba("ink"), width=2)
            d.rectangle((49, 78, 61, 111), fill=rgba("ink_soft"), outline=rgba("ink"), width=2)
            d.rectangle((35, 88, 45, 96), fill=rgba("moss"), outline=rgba("ink"), width=1)
    elif category == "shoes":
        if name == "boots":
            d.rectangle((32, 108, 49, 119), fill=rgba("moss_dark"), outline=rgba("ink"), width=2)
            d.rectangle((47, 108, 64, 119), fill=rgba("moss_dark"), outline=rgba("ink"), width=2)
        elif name == "sneakers":
            d.rectangle((31, 110, 49, 118), fill=rgba("cream"), outline=rgba("ink"), width=2)
            d.rectangle((47, 110, 65, 118), fill=rgba("cream"), outline=rgba("ink"), width=2)
            d.rectangle((35, 110, 45, 113), fill=rgba("gold"))
        else:
            d.rectangle((32, 110, 49, 118), fill=rgba("ink_soft"), outline=rgba("ink"), width=2)
            d.rectangle((47, 110, 64, 118), fill=rgba("ink_soft"), outline=rgba("ink"), width=2)
    return img


def save_base_assets(manifest: dict) -> None:
    for gender in GENDERS:
        manifest["base"][gender] = {}
        for pose, views in POSES.items():
            manifest["base"][gender][pose] = {}
            for view in views:
                manifest["base"][gender][pose][view] = []
                for frame in range(FRAME_COUNT):
                    image = draw_base(gender, pose, view, frame)
                    path = ASSETS / "base" / gender / pose / view / f"frame-{frame:02d}.png"
                    image.save(out(path), optimize=True)
                    manifest["base"][gender][pose][view].append(str(path.relative_to(ROOT)))
        manifest["base"][gender]["expressive"] = {}
        for pose in EXPRESSIVE_POSES:
            manifest["base"][gender]["expressive"][pose] = []
            for frame in range(FRAME_COUNT):
                image = draw_expressive_base(gender, pose, frame)
                path = ASSETS / "base" / gender / "expressive" / pose / f"frame-{frame:02d}.png"
                image.save(out(path), optimize=True)
                manifest["base"][gender]["expressive"][pose].append(str(path.relative_to(ROOT)))


def save_item_assets(manifest: dict) -> None:
    for gender in GENDERS:
        manifest["items"][gender] = {}
        for category, names in INDEPENDENT.items():
            manifest["items"][gender][category] = {}
            for name in names:
                image = item_layer(gender, category, name)
                path = ASSETS / "items" / gender / category / f"{name}.png"
                image.save(out(path), optimize=True)
                manifest["items"][gender][category][name] = str(path.relative_to(ROOT))


def compose_outfit(gender: str, set_name: str) -> Image.Image:
    base = draw_base(gender, "idle", "front", 0)
    for category in ("hair", "expression", "face-accessory", "shirt", "pants", "shoes", "body-accessory"):
        base.alpha_composite(item_layer(gender, category, SETS[set_name][category]))
    return base


def compose_expressive_outfit(gender: str, set_name: str, pose: str, frame: int) -> Image.Image:
    base = draw_expressive_base(gender, pose, frame)
    layer_order = ("hair", "face-accessory", "shirt", "pants", "shoes", "body-accessory")
    if pose == "idle":
        layer_order = ("hair", "expression", "face-accessory", "shirt", "pants", "shoes", "body-accessory")
    for category in layer_order:
        base.alpha_composite(item_layer(gender, category, SETS[set_name][category]))
    return base


def save_expressive_pose_assets(manifest: dict) -> None:
    manifest["poses"] = {}
    for gender in GENDERS:
        manifest["poses"][gender] = {}
        for set_name in SETS:
            manifest["poses"][gender][set_name] = {}
            for pose in EXPRESSIVE_POSES:
                manifest["poses"][gender][set_name][pose] = []
                for frame in range(FRAME_COUNT):
                    image = compose_expressive_outfit(gender, set_name, pose, frame)
                    path = ASSETS / "poses" / gender / set_name / pose / f"frame-{frame:02d}.png"
                    image.save(out(path), optimize=True)
                    manifest["poses"][gender][set_name][pose].append(str(path.relative_to(ROOT)))


def save_previews(manifest: dict) -> None:
    preview_dir = ASSETS / "previews"
    for gender in GENDERS:
        for set_name in SETS:
            image = compose_outfit(gender, set_name)
            path = preview_dir / f"{gender}-{set_name}.png"
            image.save(out(path), optimize=True)
            manifest["sets"].setdefault(gender, {})[set_name] = {
                "layers": SETS[set_name],
                "preview": str(path.relative_to(ROOT)),
            }
        for pose, view in (("idle", "front"), ("walk", "side"), ("sit-floor", "front"), ("sit-chair", "side")):
            frames = [draw_base(gender, pose, view, i).resize((192, 256), Image.Resampling.NEAREST) for i in range(FRAME_COUNT)]
            path = preview_dir / f"{gender}-{pose}-{view}.gif"
            frames[0].save(out(path), save_all=True, append_images=frames[1:], duration=180, loop=0, disposal=2)

    base_sheet = Image.new("RGBA", (760, 1780), rgba("parchment"))
    d = ImageDraw.Draw(base_sheet)
    font = load_font(14)
    x, y = 24, 24
    for gender in GENDERS:
        d.text((x, y), f"{gender.upper()} BASE ANIMATIONS", fill=rgba("ink"), font=font)
        y += 28
        for pose, views in POSES.items():
            for view in views:
                d.text((x, y + 42), f"{gender}/{pose}/{view}", fill=rgba("coral_dark"), font=font)
                for frame in range(FRAME_COUNT):
                    img = draw_base(gender, pose, view, frame).resize((72, 96), Image.Resampling.NEAREST)
                    base_sheet.alpha_composite(img, (x + 150 + frame * 82, y))
                y += 104
        y += 28
    base_sheet.save(out(preview_dir / "base-animation-contact-sheet.png"), optimize=True)

    set_sheet = Image.new("RGBA", (820, 500), rgba("parchment"))
    d = ImageDraw.Draw(set_sheet)
    x = 30
    for set_name in SETS:
        d.text((x, 22), set_name.upper(), fill=rgba("ink"), font=font)
        for idx, gender in enumerate(GENDERS):
            img = compose_outfit(gender, set_name).resize((144, 192), Image.Resampling.NEAREST)
            set_sheet.alpha_composite(img, (x + idx * 104, 58))
            d.text((x + idx * 104 + 22, 260), gender, fill=rgba("coral_dark"), font=font)
        y = 300
        for category, item in SETS[set_name].items():
            d.text((x, y), f"{category}: {item}", fill=rgba("ink_soft"), font=font)
            y += 22
        x += 260
    set_sheet.save(out(preview_dir / "fashion-set-contact-sheet.png"), optimize=True)

    pose_sheet = Image.new("RGBA", (900, 1100), rgba("parchment"))
    d = ImageDraw.Draw(pose_sheet)
    d.text((28, 22), "EXPRESSIVE POSES PER FASHION SET", fill=rgba("ink"), font=font)
    y = 62
    for gender in GENDERS:
        for set_name in SETS:
            d.text((28, y + 44), f"{gender}/{set_name}", fill=rgba("coral_dark"), font=font)
            for idx, pose in enumerate(EXPRESSIVE_POSES):
                x = 190 + idx * 112
                d.text((x, y), pose, fill=rgba("ink_soft"), font=font)
                img = compose_expressive_outfit(gender, set_name, pose, 0).resize((72, 96), Image.Resampling.NEAREST)
                pose_sheet.alpha_composite(img, (x + 12, y + 22))
            y += 164
    pose_sheet.save(out(preview_dir / "expressive-pose-contact-sheet.png"), optimize=True)


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


def validate_pngs(paths: Iterable[Path]) -> list[str]:
    errors: list[str] = []
    for path in paths:
        img = Image.open(path)
        if "previews" in path.parts or "reference" in path.parts:
            continue
        if img.size != (W, H):
            errors.append(f"{path}: expected {(W, H)}, got {img.size}")
        if img.mode != "RGBA":
            errors.append(f"{path}: expected RGBA, got {img.mode}")
        alpha = img.getchannel("A")
        corners = [
            alpha.getpixel((0, 0)),
            alpha.getpixel((W - 1, 0)),
            alpha.getpixel((0, H - 1)),
            alpha.getpixel((W - 1, H - 1)),
        ]
        if any(corners):
            errors.append(f"{path}: corners are not transparent: {corners}")
    return errors


def main() -> None:
    manifest = {
        "canvas": {"width": W, "height": H},
        "palette": {key: "#{:02x}{:02x}{:02x}".format(*value[:3]) for key, value in PALETTE.items()},
        "base": {},
        "items": {},
        "sets": {},
        "poses": {},
        "notes": [
            "Adult non-sexual mannequin base with minimal undergarment/base layer.",
            "All production layers share a 96x128 transparent canvas.",
            "Expressive pose frames mirror the Nala plan states: idle, thinking, happy, confused, greeting, pointing.",
            "CSS/JS mockup freezes animation under prefers-reduced-motion.",
        ],
    }
    save_base_assets(manifest)
    save_item_assets(manifest)
    save_expressive_pose_assets(manifest)
    save_previews(manifest)
    manifest_path = ASSETS / "asset-manifest.json"
    manifest_path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    errors = validate_pngs(ASSETS.glob("**/*.png"))
    if errors:
        raise SystemExit("\n".join(errors))
    print(f"Generated onboarding character assets under {ASSETS}")


if __name__ == "__main__":
    main()
