# Security

## Status audit

gianz-baileys adalah fork dari `ourin-baileys` 9.0.21. Yang sudah dicek dan
dibersihkan: fitur auto-follow channel otomatis (lihat [NOTICE.md](./NOTICE.md)
dan [CHANGELOG.md](./CHANGELOG.md)).

### `lib/WAM/constants.js` — ✅ diaudit (31 Okt 2026)

File 831 KB ini isinya cuma data statis (daftar nama event + id metrik internal
WhatsApp, dipakai buat telemetry). Diverifikasi: nggak ada `eval`/`new Function`,
nggak ada `fetch`/network call, nggak ada fungsi eksekusi sama sekali — murni
`export const ...` berisi array/object literal.

### `lib/assets/wasm/*` — ✅ diaudit (31 Okt 2026)

- `whatsapp.wasm` — file WebAssembly biner (buat modul VoIP/WebRTC), bukan JS,
  nggak bisa dibaca manual, tapi WASM nggak punya akses jaringan/filesystem di
  luar yang dikasih lewat `WebAssembly.instantiate` API standar browser/Node.
- `loader.js` dan `worker-modules.js` — kode glue hasil build Emscripten
  (compiler C++ → WASM resmi dari proyek Emscripten), bukan kode custom yang
  ditulis tangan. Ada pemanggilan `fetch`/`XMLHttpRequest`, tapi itu dipakai
  buat load file `.wasm`-nya sendiri (pola standar Emscripten), bukan kirim
  data ke server lain. Nggak ditemukan `eval`/`new Function` dinamis.

Kedua file ini berasal dari kode WhatsApp Web resmi (bukan tulisan ourin/gianz),
jadi risiko disisipin backdoor di situ kecil, tapi tetap nggak 100% terjamin
karena ukurannya besar dan minified.

### Yang masih perlu diwaspadai

Audit di atas berbasis pattern-matching (grep untuk `eval`, `fetch`, dll) dan
pembacaan manual sebagian kode, bukan analisis byte-per-byte. Review kode sendiri
sebelum dipakai buat hal yang penting (akun bisnis, data sensitif, dll), dan
laporkan kalau nemu sesuatu yang mencurigakan (lihat bagian di bawah).

## Lapor masalah

Kalau nemu kode mencurigakan (query ke server luar yang nggak jelas, kode yang
di-obfuscate, perilaku yang nggak diminta kayak auto-follow/auto-join), buka
issue di repo ini dengan:
- File dan baris yang dicurigai
- Kenapa dicurigai

Jangan taruh token, session, atau data pribadi di issue publik.

## Hal yang perlu diinget pas pakai

- Ini library tidak resmi, tidak berafiliasi dengan WhatsApp/Meta.
- Akun yang dipakai buat bot bisa kena banned WhatsApp kalau dipakai spam/bulk messaging.
- Jangan commit folder `session/`, `creds.json`, atau `.env` ke repo manapun.
