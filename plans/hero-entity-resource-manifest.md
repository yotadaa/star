# Resource Manifest — Hero Entity Sprite Sheets

**Status:** generated and verified
**Parent plan:** `plans/hero-entity-implementation-plan.md`

## Kontrak asset bersama

- Output final: WebP transparan, satu sheet horizontal `1024 × 256 px`, empat cell identik `256 × 256 px`.
- Frame `0 → 3` harus pose yang benar-benar berbeda tetapi volume tubuh dan baseline tetap konsisten. Tidak ada frame duplikat dan tidak ada animasi kurang dari empat frame.
- Background generator: hijau chroma key solid `#00ff00`; setelah pemeriksaan visual akan dihapus menjadi alpha dengan helper imagegen. Hijau ini hanya background kerja, tidak masuk asset runtime ataupun CSS aplikasi.
- Gaya: flat pixel-game pastoral yang hangat, edge geometris tajam, outline konsisten, tanpa gradasi, blur baked-in, tekstur realistis, teks, badge, atau emoji.
- Palet desain: hanya keluarga token saat ini di `app/globals.css`: ink/pine (`--ink`, `--pine-deep`, `--moss-dark`), cream/parchment (`--cream`, `--parchment`), dan aksen `--gold`, `--coral`, `--aurora`. Generator boleh memakai variasi anti-alias internal yang perlu lalu direject jika mengubah gaya flat/pixel.
- Pengemasan: chroma key → inspeksi alpha → potong empat cell → urutkan kiri-ke-kanan 0–3 → convert WebP kualitas visual tinggi → cek dimensi dan byte size → hapus source kerja dari folder publik.
- Tidak dibuat: watchtower, crosshair, projectile, “hit” asset, skull/target, atau icon score.

## Prompt sumber dan kontrak per asset

### 1. `butterfly-terracotta.webp`

```
Create one clean 2-by-2 sprite grid for a web game, exactly four equal square
frames, read left-to-right then top-to-bottom. It is the same small friendly
butterfly in all four cells, facing right at a slight top-side angle:
frame 1 wings open, frame 2 wings three-quarters open, frame 3 wings folded
close, frame 4 wings three-quarters open. Keep body position, visual scale,
and baseline identical in every cell. Flat pixel-game illustration with sharp
geometric edges, chunky but elegant, no text, no border between cells, no
drop shadow, no blur, no gradient, no realistic veins, no photorealism.
Use a warm terracotta and existing-gold family with deep pine ink outline;
friendly pastoral portfolio world, not generic retro 8-bit. Entire canvas
background must be one solid bright chroma green #00ff00 with no texture.
Leave generous green space around each sprite, and make all four sprites fit
inside their own quadrant without crossing cell boundaries.
```

### 2. `butterfly-moss.webp`

```
Create one clean 2-by-2 sprite grid for a web game, exactly four equal square
frames, read left-to-right then top-to-bottom. Same small friendly butterfly
in all four cells, facing right at a slight top-side angle: wings open,
three-quarters open, folded close, three-quarters open. Keep body position,
visual scale, and baseline identical. Flat sharp pixel-game forms only; no
text, cell border, shadow, blur, gradient, vein texture, photorealism, or
generic 8-bit look. Use a moss/cream palette from a warm pastoral portfolio
world, with a deep pine ink outline. Whole canvas must be solid bright chroma
green #00ff00, no texture. Keep each sprite safely inside its quadrant.
```

### 3. `sparrow.webp`

```
Create one clean 2-by-2 sprite grid for a web game, exactly four equal square
frames, read left-to-right then top-to-bottom. Same tiny rounded sparrow in
side profile facing right in all cells: wings high, wings mid, wings low,
wings mid. Keep its body center, scale, and baseline precisely consistent.
It must read clearly when rendered at 42 pixels. Flat crisp pixel-game asset,
warm cream body with restrained coral wing accent and deep pine ink outline;
cozy pastoral portfolio world. No text, no cell divider, no drop shadow,
no blur, gradients, realism, or generic retro 8-bit pixels. Entire background
is solid bright chroma green #00ff00, no texture, and sprites never cross
their quadrant boundaries.
```

### 4. `migration-v.webp`

```
Create one clean 2-by-2 sprite grid for a web game, exactly four equal square
frames, read left-to-right then top-to-bottom. Each cell contains the same
small V formation of four migrating birds as one cohesive wide group, moving
right: all wings high, all wings mid, all wings low, all wings mid. Keep the
formation geometry, center point, width, and baseline consistent between all
four frames. Flat sharp pixel-game silhouette, deep pine ink with very subtle
existing coral edge accent only, no text, cell border, shadow, blur, gradient,
realistic feathers, or photorealism. The entire canvas is solid bright chroma
green #00ff00, no texture. Leave generous green padding and keep every group
inside its cell.
```

### 5. `bat.webp`

```
Create one clean 2-by-2 sprite grid for a web game, exactly four equal square
frames, read left-to-right then top-to-bottom. Same friendly small bat in
side profile facing right in each cell: wings raised, wings half-raised,
wings low and open, wings half-raised. Keep body center, scale, and baseline
identical. Make a cute, non-scary flat pixel-game silhouette in deep pine/ink
tones with one tiny existing-gold eye accent. No text, divider lines, shadow,
glow, blur, gradients, anatomical realism, or generic retro 8-bit style.
Entire canvas is solid bright chroma green #00ff00, no texture; no wing crosses
the quadrant boundary.
```

### 6. `firefly.webp`

```
Create one clean 2-by-2 sprite grid for a web game, exactly four equal square
frames, read left-to-right then top-to-bottom. Same large friendly firefly
in side profile facing right in each cell: wings high, wings mid, wings low,
wings mid. Keep its rounded body center, scale, and baseline identical.
Use deep pine/ink body and a clear flat existing-gold abdomen tip, but no
baked glow because any subtle emphasis comes from CSS. Flat sharp pixel-game
geometry only: no text, grid divider, shadow, blur, gradient, realism, or
generic 8-bit look. Whole canvas must be solid bright chroma green #00ff00
without texture, and every sprite stays inside its quadrant with padding.
```

## Acceptance inspection per generation

1. The image visibly contains exactly four readable poses in a 2 × 2 order.
2. The subject faces right and retains silhouette continuity across poses.
3. Cell backgrounds are uniformly chroma green; no green is part of the sprite.
4. There are no unwanted words, props, borders, shadows, gradients, or unsafe visual motifs.
5. The four postprocessed frames retain transparent alpha and correct `1024 × 256` runtime layout.
6. The final WebP is referenced only by the entity config and loads from `public/assets/hero-entities/`.

## Output verification (2026-07-30)

| File | Size | Runtime bytes | Chroma-green pixels |
| --- | ---: | ---: | ---: |
| `bat.webp` | 1024 × 256 | 54,860 | 0 |
| `butterfly-moss.webp` | 1024 × 256 | 89,352 | 0 |
| `butterfly-terracotta.webp` | 1024 × 256 | 79,822 | 0 |
| `firefly.webp` | 1024 × 256 | 67,092 | 0 |
| `migration-v.webp` | 1024 × 256 | 26,446 | 0 |
| `sparrow.webp` | 1024 × 256 | 54,422 | 0 |
