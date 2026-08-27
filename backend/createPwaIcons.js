import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPng(size, filename) {
  // Simple uncompressed/deflated RGBA PNG generator
  const width = size;
  const height = size;

  // Compute CRC32 table
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    crcTable[n] = c;
  }

  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const typeAndData = Buffer.concat([typeBuf, data]);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crc32(typeAndData), 0);
    return Buffer.concat([len, typeAndData, crcBuf]);
  }

  // Header: 89 50 4E 47 0D 0A 1A 0A
  const header = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bit depth
  ihdr[9] = 6; // Color type RGBA
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Pixel data: Indigo color #4f46e5 (79, 70, 229, 255)
  const rawRow = Buffer.alloc(1 + width * 4);
  rawRow[0] = 0; // No filter
  for (let x = 0; x < width; x++) {
    const idx = 1 + x * 4;
    // Draw rounded border effect / color gradient
    const dx = x - width / 2;
    const isCorner = Math.abs(dx) > width * 0.45;
    if (isCorner) {
      rawRow[idx] = 67; rawRow[idx + 1] = 56; rawRow[idx + 2] = 202; rawRow[idx + 3] = 255;
    } else {
      rawRow[idx] = 79; rawRow[idx + 1] = 70; rawRow[idx + 2] = 229; rawRow[idx + 3] = 255;
    }
  }

  const rawPixels = Buffer.alloc((1 + width * 4) * height);
  for (let y = 0; y < height; y++) {
    rawRow.copy(rawPixels, y * (1 + width * 4));
  }

  const deflated = zlib.deflateSync(rawPixels);
  const idatChunk = makeChunk('IDAT', deflated);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  const pngBuffer = Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
  fs.writeFileSync(filename, pngBuffer);
  console.log(`Generated PNG ${filename} (${width}x${height})`);
}

const outDir = path.join(process.cwd(), '..', 'frontend', 'public');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

createPng(192, path.join(outDir, 'pwa-192.png'));
createPng(512, path.join(outDir, 'pwa-512.png'));
