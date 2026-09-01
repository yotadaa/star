# Laporan validasi

## Gate editorial

- Draft: 1.083 kata; 17 heading; 6 tautan sumber; narasi orang ketiga dan hanya isi artikel.
- Audit grounded: 0 temuan hard, 1 peringatan ritme seragam yang sudah diperiksa sebagai pola minor.
- Tidak ada bagian verdict, catatan proses investigasi, research note, atau paragraf cutoff di artikel.
- Klaim utama dipetakan dalam `claim-ledger.md`; panduan empat PR lama diatribusikan ke repositori komunitas bernama, bukan dianggap sebagai kebijakan 2026.
- Kelebihan dan konsekuensi model acara baru dijelaskan.

## Gate bukti

- 6 sumber dibuka: halaman utama Hacktoberfest, FAQ resmi, halaman sponsor, pengumuman MLH, Global Hack Week MLH, dan repositori komunitas lama yang masih memuat panduan Indonesia.
- Sumber resmi mendukung format 2026, Preptember 1–30 September, 300+ acara, format acara, perbedaan kaus online/tatap muka, milestone online yang belum diterbitkan, dan pekan online 9–15 Oktober.
- Tracker Indonesia tidak membuat acara fiktif; statusnya “perlu dicek” sampai galeri resmi mencantumkan acara.

## Gate media

- Satu feature editorial original 1672×941 PNG, SHA-256 `c851038d76234482405596fce2b45acc3f2436ab8fc34a7a0e0b13f3c1201bc6`.
- Tidak ada gambar web hasil koleksi yang dipublikasikan.
- Enam screenshot sumber dari in-app Browser tersimpan secara privat di `sources/`; identitas sumber dan konteks tampak sudah diperiksa. Tidak ada screenshot eksternal yang menjadi aset artikel publik.

## Gate payload

- Payload native: `payload.json`, 46 block: 31 paragraf, 10 heading, 2 list, 2 tabel, 1 gambar.
- `status`: published; `language`: `id-ID`; `articleSection`: `Community Story`.
- SEO title 45 karakter; description 135 karakter.
- `verify-package.mjs`: PASS; dimensi, checksum, identitas gambar, alt text, dan payload provider-neutral lolos.
