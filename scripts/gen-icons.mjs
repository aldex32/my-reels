import sharp from 'sharp';

// Blue background matching theme_color #2563eb
const bg = { r: 37, g: 99, b: 235, alpha: 1 };

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="96" fill="#2563eb"/>
  <text x="256" y="340" font-size="280" text-anchor="middle" font-family="serif">🎬</text>
</svg>`;

const input = Buffer.from(svg);

await sharp(input).resize(192).png().toFile('public/icon-192.png');
console.log('✓ icon-192.png');

await sharp(input).resize(512).png().toFile('public/icon-512.png');
console.log('✓ icon-512.png');

// Maskable icon: extra padding so the icon fits within the safe zone
await sharp(input)
  .resize(512, 512, { fit: 'contain', background: bg })
  .png()
  .toFile('public/icon-512-maskable.png');
console.log('✓ icon-512-maskable.png');

// Apple touch icon
await sharp(input).resize(180).png().toFile('public/apple-touch-icon.png');
console.log('✓ apple-touch-icon.png');
