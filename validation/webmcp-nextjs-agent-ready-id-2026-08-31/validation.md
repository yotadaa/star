# Validation

- Research Gate: PASS
- Draft: 1.292 kata; 9 heading; 5 URL sumber primer
- Payload native: 45 block; status `published`; bahasa `id-ID`; tiga gambar dengan alt deskriptif
- Verifier WebMCP: lima definisi; nama unik; schema tertutup; abort cleanup; batas JSON 1.500 karakter; selector project bersama
- Batas API: respons anonim dan arbitrary-cookie sama; `includeDrafts=true` menghasilkan 400
- Build: Convex typecheck dan production build Next.js lolos
- Browser smoke: client tanpa fitur tetap stabil; filter project menampilkan dua kartu di desktop/mobile tanpa horizontal overflow
- Batas eksplisit: discovery/pemilihan tool native tidak diuji karena browser tersedia tidak mengekspos `document.modelContext`
- Audit grounded-blog: 0 hard finding; Slopbeth batch 0 hard dan 0 review signature
- Scan narasi proses / verdict / penutup research note: bersih
- Gate publikasi: siap setelah resolusi aset R2 dan validasi route live pasca-deploy
