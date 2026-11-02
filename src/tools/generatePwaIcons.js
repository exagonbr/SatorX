/**
 * Gera ícones PNG/ICO do PWA a partir de src/brand/pwa-mark.png.
 * Uso: npm run pwa:icons
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const root = path.join(__dirname, "..", "..");
const publicDir = path.join(__dirname, "..", "public");
const iconsDir = path.join(publicDir, "icons");
const sourcePath = path.join(root, "src", "brand", "pwa-mark.png");

function pngToIco(pngBuffers) {
  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);
  const dir = Buffer.alloc(16 * count);
  let offset = 6 + 16 * count;
  const parts = [header, dir];
  for (let i = 0; i < count; i++) {
    const png = pngBuffers[i];
    const width = png.readUInt32BE(16);
    const height = png.readUInt32BE(20);
    const entry = 16 * i;
    dir[entry] = width >= 256 ? 0 : width;
    dir[entry + 1] = height >= 256 ? 0 : height;
    dir.writeUInt16LE(1, entry + 4);
    dir.writeUInt16LE(32, entry + 6);
    dir.writeUInt32LE(png.length, entry + 8);
    dir.writeUInt32LE(offset, entry + 12);
    offset += png.length;
    parts.push(png);
  }
  return Buffer.concat(parts);
}

async function square(size) {
  return sharp(sourcePath)
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 1 }
    })
    .flatten({ background: "#000000" })
    .png()
    .toBuffer();
}

async function main() {
  if (!fs.existsSync(sourcePath)) {
    console.error("Arquivo não encontrado:", sourcePath);
    process.exit(1);
  }
  if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

  const icon192 = await square(192);
  const icon512 = await square(512);
  const apple = await square(180);
  fs.writeFileSync(path.join(iconsDir, "icon-192.png"), icon192);
  fs.writeFileSync(path.join(iconsDir, "icon-512.png"), icon512);
  fs.writeFileSync(path.join(iconsDir, "apple-touch-icon.png"), apple);

  const size = 512;
  const inner = Math.round(size * 0.72);
  const pad = Math.round((size - inner) / 2);
  const innerPng = await sharp(sourcePath)
    .resize(inner, inner, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .png()
    .toBuffer();
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 1 }
    }
  })
    .composite([{ input: innerPng, left: pad, top: pad }])
    .png()
    .toFile(path.join(iconsDir, "icon-maskable-512.png"));

  const ico = pngToIco([await square(16), await square(32), await square(48)]);
  fs.writeFileSync(path.join(publicDir, "favicon.ico"), ico);

  console.log("Ícones PWA gravados em", iconsDir);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
