# Security

## Status audit

xobe-baileys adalah fork dari `ourin-baileys` 9.0.21. Yang sudah dicek dan
dibersihkan: fitur auto-follow channel otomatis (lihat [NOTICE.md](./NOTICE.md)
dan [CHANGELOG.md](./CHANGELOG.md)).

Yang **belum** diaudit penuh:
- `lib/assets/wasm/*` — bundle wasm/loader buat VoIP
- `lib/WAM/constants.js` — konstanta metrik internal WhatsApp (file besar, minified)

Jangan anggap fork ini 100% bebas masalah. Review kode sendiri sebelum dipakai
buat hal yang penting (akun bisnis, data sensitif, dll).

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
