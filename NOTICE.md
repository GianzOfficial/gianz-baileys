# Catatan

gianz-baileys adalah fork dari `ourin-baileys` v9.0.21, yang merupakan mod dari
Baileys v7 (WhiskeySockets/Baileys). Semuanya berlisensi MIT.

Perubahan dari ourin-baileys 9.0.21:
- Dihapus: fitur auto-follow channel WhatsApp saat koneksi terbuka
  (`triggerAutoFollow`, `runAutoFollow`, JID channel hardcoded, opsi `autoFollowNewsletter*`).
- Dihapus: file source map (`.map`).
- Diganti: nama paket jadi `xobe-baileys`.

`newsletterFollow` dan fungsi channel lainnya tetap ada, tapi hanya jalan kalau kamu manggilnya sendiri.

Paket asli `ourin-baileys` ditandai malware di npm (MAL-2026-18412, Oktober 2026).
Fork ini sudah dibersihkan dari auto-follow, tapi kode lain belum diaudit penuh.
Review sendiri sebelum dipakai di produksi.

Hak cipta asli tetap milik pembuat Baileys dan ourin-baileys. Lihat LICENSE.
