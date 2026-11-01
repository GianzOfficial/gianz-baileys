<div align="center">⚡ GIANZ-BAILEYS

Library WhatsApp (Baileys v7) untuk membangun bot WhatsApp.

"version" (https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge)
"license" (https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
"node" (https://img.shields.io/badge/node-%3E%3D20-brightgreen?style=for-the-badge&logo=node.js&logoColor=white)
"esm" (https://img.shields.io/badge/module-ESM--only-yellow?style=for-the-badge)
"status" (https://img.shields.io/badge/auto--follow-DIHAPUS-success?style=for-the-badge)

"Install" (#-install) · "Tutorial dari nol" (#-bikin-bot-dari-nol) · "Fitur" (#-fitur) · "Keamanan" (#-keamanan) · "Masalah umum" (#-masalah-umum)

</div>---

🧭 Tentang Gianz Baileys

Gianz Baileys adalah modifikasi library Baileys v7 untuk membangun bot WhatsApp menggunakan Node.js.

Library ini dikembangkan dengan basis kode Ourin Baileys, dengan fokus pada kompatibilitas, kemudahan penggunaan, dan pengurangan kode tersembunyi yang tidak diperlukan.

Silsilah pengembangan

Baileys (WhiskeySockets)
        │
        ▼
   Ourin Baileys
        │
        ▼
   Gianz Baileys

Perubahan keamanan

- Kode auto-follow channel tersembunyi diklaim telah dihapus.
- JID channel yang digunakan untuk aktivitas otomatis tersebut dihapus.
- File source map yang tidak diperlukan dihapus.
- Aktivitas follow channel hanya dilakukan jika dipanggil secara eksplisit oleh kode bot.

«Catatan: Penghapusan komponen tersebut bukan jaminan bahwa seluruh source code bebas malware. Audit keamanan menyeluruh tetap diperlukan, terutama pada dependency, file WASM, dan komponen internal lainnya.»

Detail teknis dapat dilihat melalui "NOTICE.md", "SECURITY.md", dan "CHANGELOG.md".

---

📋 Daftar isi

- Syarat
- Install
- Bikin bot dari nol
- Login menggunakan pairing code
- Cache group metadata
- Utilitas tambahan
- Contoh fitur
- Migrasi dari Ourin Baileys
- Dukungan CommonJS
- Pemeriksaan keamanan
- Masalah umum
- Catatan penting
- Lisensi

---

✅ Syarat

Kebutuhan| Keterangan
Node.js| 20 atau lebih baru
Git| Instalasi dari GitHub
Module| ESM
Package| gianz-baileys

Pastikan Node.js sudah terpasang:

node -v

---

📦 Install

Instal langsung dari GitHub:

npm install github:GianzOfficial/gianz-baileys

Atau tambahkan secara manual ke "package.json":

{
  "type": "module",
  "dependencies": {
    "gianz-baileys": "github:GianzOfficial/gianz-baileys"
  }
}

Kemudian jalankan:

npm install

Dependency tambahan (opsional)

npm install pino qrcode-terminal
npm install sharp
npm install link-preview-js
npm install audio-decode

Untuk pemrosesan video, instal FFmpeg pada sistem.

---

🚀 Bikin bot dari nol

1. Buat project

mkdir bot-gianz
cd bot-gianz
npm init -y

2. Aktifkan ESM

Tambahkan pada "package.json":

{
  "name": "bot-gianz",
  "type": "module"
}

3. Instal dependency

npm install github:GianzOfficial/gianz-baileys pino qrcode-terminal

4. Buat index.js

import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  Browsers,
} from "gianz-baileys";

import pino from "pino";
import qrcode from "qrcode-terminal";

const logger = pino({ level: "silent" });

async function startBot() {
  const { state, saveCreds } =
    await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    auth: state,
    logger,
    browser: Browsers.ubuntu("Chrome"),
    syncFullHistory: false,
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on(
    "connection.update",
    ({ connection, lastDisconnect, qr }) => {
      if (qr) {
        qrcode.generate(qr, { small: true });
      }

      if (connection === "open") {
        console.log("✅ Gianz Baileys Connected!");
      }

      if (connection === "close") {
        const code =
          lastDisconnect?.error?.output?.statusCode;

        if (code !== DisconnectReason.loggedOut) {
          startBot();
        } else {
          console.log("❌ Logout. Login ulang diperlukan.");
        }
      }
    }
  );

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];

    if (!msg?.message || msg.key.fromMe) return;

    const text =
      msg.message.conversation ||
      msg.message.extendedTextMessage?.text ||
      "";

    if (text === ".ping") {
      await sock.sendMessage(
        msg.key.remoteJid,
        { text: "Pong! 🏓" }
      );
    }
  });
}

startBot();

5. Jalankan bot

node index.js

Scan QR menggunakan WhatsApp melalui menu:

Perangkat tertaut → Tautkan perangkat.

Jika berhasil, terminal akan menampilkan:

✅ Gianz Baileys Connected!

---

🔢 Login menggunakan pairing code

Jika tidak ingin menggunakan QR:

const sock = makeWASocket({
  auth: state,
  logger,
  browser: Browsers.windows("Chrome"),
});

sock.ev.on("connection.update", async ({ connection }) => {
  if (
    connection === "connecting" &&
    !sock.authState.creds.registered
  ) {
    const code = await sock.requestPairingCode(
      "6281234567890"
    );

    console.log("Pairing Code:", code);
  }
});

Ganti nomor dengan nomor WhatsApp bot.

Contoh lengkap tersedia di:

"examples/pairing-code.js"

---

⚡ Optimasi: Cache Group Metadata

Gianz Baileys menyediakan helper "makeCachedGroupMetadata()" untuk menyimpan metadata grup sementara agar tidak perlu mengambil informasi grup berulang kali.

import makeWASocket, {
  useMultiFileAuthState,
  makeCachedGroupMetadata
} from "gianz-baileys";

const { state, saveCreds } =
  await useMultiFileAuthState("./session");

const groupCache = makeCachedGroupMetadata({
  ttlMs: 5 * 60 * 1000
});

const sock = makeWASocket({
  auth: state,
  cachedGroupMetadata: groupCache.get,
});

sock.ev.on("creds.update", saveCreds);

groupCache.attach(sock);

Contoh lengkap:

"examples/group-metadata-cache.js"

---

🧰 Utilitas tambahan

🚦 Rate Limit / Anti-Spam

Mengatur antrean pengiriman pesan agar tidak dikirim secara berlebihan.

import { makeMessageQueue } from "gianz-baileys";

const queue = makeMessageQueue(sock, {
  delayMs: 1500,
  maxPerMinute: 20
});

await queue.sendMessage(jid, {
  text: "Halo!"
});

🏷️ JID dan LID

Helper untuk menangani identitas pengguna WhatsApp.

import {
  resolvePNJid,
  toJid
} from "gianz-baileys";

const participants = await sock
  .groupMetadata(groupJid)
  .then(m => m.participants.map(p => p.id));

const resolved = await Promise.all(
  participants.map(jid => resolvePNJid(sock, jid))
);

await sock.sendMessage(groupJid, {
  text: resolved
    .map(j => `@${j.split("@")[0]}`)
    .join(" "),
  mentions: resolved,
});

toJid("0812-3456-7890");

📝 Logger

import { createLogger } from "gianz-baileys";

const logger = createLogger({
  level: "warn"
});

const sock = makeWASocket({
  auth: state,
  logger
});

🔁 Reconnect dengan Backoff

import {
  withReconnect,
  DisconnectReason
} from "gianz-baileys";

const reconnect = withReconnect(startBot, {
  baseMs: 2000,
  maxMs: 60000
});

sock.ev.on("connection.update", ({
  connection,
  lastDisconnect
}) => {
  if (connection === "open") {
    reconnect.reset();
  }

  if (connection === "close") {
    const code =
      lastDisconnect?.error?.output?.statusCode;

    if (code !== DisconnectReason.loggedOut) {
      reconnect.schedule();
    }
  }
});

---

🧩 Contoh fitur

🔘 Interactive Message

await sock.sendMessage(jid, {
  interactiveMessage: {
    title: "Halo!",
    footer: "Gianz Baileys",
    header: "Pilih salah satu",
    buttons: [
      {
        name: "quick_reply",
        buttonParamsJson: JSON.stringify({
          display_text: "Menu",
          id: ".menu"
        })
      },
      {
        name: "cta_url",
        buttonParamsJson: JSON.stringify({
          display_text: "Website",
          url: "https://example.com"
        })
      }
    ]
  }
});

📋 Single Select

await sock.sendMessage(jid, {
  interactiveMessage: {
    title: "Pilih kategori",
    footer: "Gianz Baileys",
    header: "Menu Bot",
    buttons: [{
      name: "single_select",
      buttonParamsJson: JSON.stringify({
        title: "Buka menu",
        sections: [{
          title: "Tools",
          rows: [
            { title: "Sticker", id: ".sticker" },
            { title: "TTS", id: ".tts" }
          ]
        }]
      })
    }]
  }
});

🖼️ Album

await sock.sendMessage(jid, {
  albumMessage: [
    {
      image: { url: "./foto1.jpg" },
      caption: "Foto 1"
    },
    {
      image: { url: "./foto2.jpg" },
      caption: "Foto 2"
    },
    {
      video: { url: "./klip.mp4" },
      caption: "Video"
    }
  ]
});

📣 WhatsApp Channel

Fitur channel dilakukan secara manual melalui pemanggilan fungsi.

const info = await sock.cekIDSaluran(
  "https://whatsapp.com/channel/xxxxx"
);

console.log(info.name, info.subscribers);

await sock.newsletterFollow(
  "1203630000000000@newsletter"
);

await sock.newsletterUnfollow(
  "1203630000000000@newsletter"
);

Fungsi follow dan unfollow tidak dimaksudkan untuk berjalan otomatis tanpa persetujuan pengguna.

Dokumentasi fungsi lainnya tersedia di:

"docs/README-ourin-original.md"

---

🔁 Migrasi dari Ourin Baileys

Jika sebelumnya menggunakan Ourin Baileys, lakukan perubahan berikut.

1. Hapus dependency lama

npm uninstall ourin-baileys

2. Instal Gianz Baileys

npm install github:GianzOfficial/gianz-baileys

3. Bersihkan instalasi lama

rm -rf node_modules package-lock.json
npm install

4. Ubah seluruh import

Sebelumnya:

import makeWASocket from "ourin-baileys";

Sekarang:

import makeWASocket from "gianz-baileys";

Pastikan seluruh pemanggilan dependency menggunakan nama package yang baru.

---

🧱 Dukungan CommonJS

Gianz Baileys menggunakan ESM-only.

Jika project menggunakan CommonJS, gunakan dynamic import:

async function start() {
  const baileys = await import("gianz-baileys");

  const makeWASocket = baileys.default;

  const {
    useMultiFileAuthState,
    DisconnectReason
  } = baileys;

  const { state, saveCreds } =
    await useMultiFileAuthState("./session");

  const sock = makeWASocket({
    auth: state
  });

  sock.ev.on("creds.update", saveCreds);
}

start();

Alternatifnya, ubah project menjadi ESM dengan menambahkan:

{
  "type": "module"
}

---

🔍 Pemeriksaan keamanan

Pemeriksaan sederhana terhadap kode auto-follow:

grep -rn "autoFollow" lib
grep -rn "120363400911374213" lib

Pastikan tidak terdapat kode yang secara otomatis menjalankan aktivitas follow channel tanpa persetujuan.

Pemeriksaan tambahan:

- Audit seluruh file JavaScript.
- Periksa dependency dan package lifecycle scripts.
- Periksa file WASM.
- Periksa kode yang melakukan koneksi jaringan.
- Periksa penggunaan token, kredensial, dan session.
- Jalankan pengujian menggunakan nomor cadangan.

Hasil pencarian teks kosong bukan bukti bahwa library sepenuhnya aman.

---

🛠️ Masalah umum

Cannot use import statement outside a module

Tambahkan ""type": "module"" pada "package.json".

QR tidak muncul

Gunakan event "connection.update" untuk menerima QR dan tampilkan menggunakan "qrcode-terminal".

Koneksi terputus terus-menerus

Periksa session, koneksi internet, dan mekanisme reconnect. Jangan langsung menghapus session sebelum memastikan penyebabnya.

Thumbnail atau sticker tidak terbentuk

Instal "sharp" atau "jimp". Untuk video, gunakan FFmpeg.

Panggilan suara tidak berjalan

Periksa kebutuhan dependency tambahan seperti "@roamhq/wrtc" dan FFmpeg.

npm install dari GitHub gagal

Pastikan repository Public, Git tersedia, dan konfigurasi package serta dependency sudah benar.

---

⚠️ Catatan penting

- Gianz Baileys merupakan library modifikasi pihak ketiga, bukan library resmi WhatsApp.
- Source code belum tentu sepenuhnya bebas malware meskipun komponen auto-follow telah dihapus.
- Periksa "SECURITY.md" sebelum digunakan pada sistem penting.
- Jangan pernah mengunggah folder "session", "creds.json", atau ".env" ke GitHub.
- Gunakan nomor cadangan untuk pengujian.
- Hindari spam dan aktivitas yang melanggar ketentuan WhatsApp.
- Tidak ada jaminan akun WhatsApp bebas dari pembatasan atau pemblokiran.

---

📄 Lisensi

MIT License.

Pemberitahuan hak cipta dan atribusi dari kode sumber serta seluruh komponen pihak ketiga harus tetap dipertahankan sesuai lisensi masing-masing.

Lihat file "LICENSE" untuk ketentuan lengkap.

---

🙏 Credits

- WhiskeySockets/Baileys — fondasi library dan implementasi protokol WhatsApp.
- Ourin Baileys — basis modifikasi dan fitur tambahan yang digunakan dalam pengembangan.

Terima kasih kepada seluruh pengembang dan kontributor yang telah berkontribusi pada ekosistem Baileys.

---

<div align="center">⚡ GIANZ BAILEYS

Developed & Maintained by GianzOfficial

GitHub: https://github.com/GianzOfficial/gianz-baileys

© 2026 GianzOfficial

</div>
