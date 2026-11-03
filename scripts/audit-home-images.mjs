import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import sharp from 'sharp';

const html = await readFile('index.html', 'utf8');
const sources = [...html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"[^>]*>/gi)]
  .map((match) => match[1])
  .filter((source) => source.startsWith('./image/') || source.startsWith('/image/'));

for (const source of [...new Set(sources)]) {
  const path = resolve(source.replace(/^\.\//, '').replace(/^\//, ''));
  const { width, height, format } = await sharp(path).metadata();
  console.log(JSON.stringify({ source, width, height, format }));
}

