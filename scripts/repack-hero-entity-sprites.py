#!/usr/bin/env python3
"""Repack generated 2x2 hero-entity frames into transparent 4-frame WebP strips.

Input files are the chroma-keyed PNG resources from the hero entity plan. The
runtime sheets are deliberately single-row strips so CSS can use a cheap
``steps(4)`` background-position animation without JavaScript frame updates.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
INPUT_DIR = ROOT / "plans" / "hero-entity-assets" / "keyed"
OUTPUT_DIR = ROOT / "public" / "assets" / "hero-entities"
ENTITY_FILES = (
    "butterfly-terracotta",
    "butterfly-moss",
    "sparrow",
    "migration-v",
    "bat",
    "firefly",
)
CELL_SIZE = 256


def split_grid(image: Image.Image) -> list[Image.Image]:
    width, height = image.size
    if width != height or width % 2 or height % 2:
        raise ValueError(f"Expected an even square 2x2 source image, got {image.size}.")

    half = width // 2
    boxes = (
        (0, 0, half, half),
        (half, 0, width, half),
        (0, half, half, height),
        (half, half, width, height),
    )
    return [image.crop(box) for box in boxes]


def repack_entity(stem: str) -> tuple[Path, int]:
    source_path = INPUT_DIR / f"{stem}.png"
    if not source_path.exists():
        raise FileNotFoundError(source_path)

    with Image.open(source_path) as source:
        frames = split_grid(source.convert("RGBA"))

    sheet = Image.new("RGBA", (CELL_SIZE * 4, CELL_SIZE), (0, 0, 0, 0))
    for index, frame in enumerate(frames):
        pixel_frame = frame.resize((CELL_SIZE, CELL_SIZE), Image.Resampling.NEAREST)
        sheet.alpha_composite(pixel_frame, (index * CELL_SIZE, 0))

    output_path = OUTPUT_DIR / f"{stem}.webp"
    sheet.save(output_path, "WEBP", lossless=True, method=6, exact=True)
    return output_path, output_path.stat().st_size


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for stem in ENTITY_FILES:
        output_path, byte_size = repack_entity(stem)
        print(f"{output_path.relative_to(ROOT)}: 1024x256, {byte_size} bytes")


if __name__ == "__main__":
    main()
