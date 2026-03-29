/**
 * Gera ícones PNG do PWA a partir de public/favicon.svg.
 * Uso: npm run pwa:icons
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const publicDir = path.join(__dirname, "..", "public");
const iconsDir = path.join(publicDir, "icons");
const svgPath = path.join(publicDir, "favicon.svg");

async function main() {
  if (!fs.existsSync(svgPath)) {
    console.error("Arquivo não encontrado:", svgPath);
    process.exit(1);
  }
  if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

  const buf = fs.readFileSync(svgPath);

  await sharp(buf).resize(192, 192).png().toFile(path.join(iconsDir, "icon-192.png"));
  await sharp(buf).resize(512, 512).png().toFile(path.join(iconsDir, "icon-512.png"));
  await sharp(buf).resize(180, 180).png().toFile(path.join(iconsDir, "apple-touch-icon.png"));

  const size = 512;
  const inner = Math.round(size * 0.8);
  const pad = Math.round((size - inner) / 2);
  const innerPng = await sharp(buf).resize(inner, inner).png().toBuffer();
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 4, g: 6, b: 10, alpha: 1 }
    }
  })
    .composite([{ input: innerPng, left: pad, top: pad }])
    .png()
    .toFile(path.join(iconsDir, "icon-maskable-512.png"));

  console.log("Ícones PWA gravados em", iconsDir);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
