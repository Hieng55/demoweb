import { access, readFile, writeFile } from 'node:fs/promises';
import { extname, parse } from 'node:path';
import sharp from 'sharp';

const exists = async (path) => access(path).then(() => true).catch(() => false);
const htmlPath = 'index.html';
let html = await readFile(htmlPath, 'utf8');

const sizeRule = (source) => {
  if (source.includes('/logo/')) return '(max-width: 760px) 140px, 190px';
  if (source.includes('/business team/')) return '(max-width: 760px) 92vw, 48vw';
  if (source.includes('/help for you/')) return '(max-width: 760px) 92vw, 32vw';
  if (source.includes('/social-post/')) return '(max-width: 760px) 72vw, 360px';
  return '100vw';
};

const tags = [...html.matchAll(/<img\b[^>]*\bsrc="([^"]+)"[^>]*>/gi)];
for (const match of tags.reverse()) {
  const source = match[1];
  if (!source.startsWith('./image/') && !source.startsWith('/image/')) continue;

  const diskSource = source.replace(/^\.\//, '').replace(/^\//, '');
  const extension = extname(diskSource).toLowerCase();
  if (!['.jpg', '.jpeg', '.png', '.webp', '.svg'].includes(extension)) continue;

  const metadata = await sharp(diskSource).metadata();
  let outputSource = source;
  let outputDisk = diskSource;

  if (extension !== '.svg' && extension !== '.webp') {
    const parsed = parse(diskSource);
    outputDisk = `${parsed.dir}/${parsed.name}.webp`;
    outputSource = source.replace(/\.(?:jpe?g|png)$/i, '.webp');
  }

  let tag = match[0].replace(/\bsrc="[^"]+"/, `src="${outputSource}"`);
  if (!/\bwidth="/i.test(tag) && metadata.width) tag = tag.replace(/\s*\/>$/, ` width="${metadata.width}" />`);
  if (!/\bheight="/i.test(tag) && metadata.height) tag = tag.replace(/\s*\/>$/, ` height="${metadata.height}" />`);
  if (!/\bdecoding="/i.test(tag)) tag = tag.replace(/\s*\/>$/, ' decoding="async" />');

  if (extension !== '.svg') {
    const parsed = parse(outputDisk);
    const candidates = [];
    for (const width of [480, 960, 1600]) {
      const path = `${parsed.dir}/${parsed.name}-${width}.webp`;
      if (await exists(path)) candidates.push(`${outputSource.replace(/\.webp$/i, `-${width}.webp`)} ${width}w`);
    }
    const largestGenerated = candidates.some((candidate) => candidate.endsWith('1600w'));
    if (!largestGenerated && metadata.width) candidates.push(`${outputSource} ${metadata.width}w`);
    if (candidates.length > 1 && !/\bsrcset="/i.test(tag)) {
      tag = tag.replace(/\s*\/>$/, ` srcset="${candidates.join(', ')}" sizes="${sizeRule(source)}" />`);
    }
  }

  if (source.includes('/social-post/')) tag = tag.replace(/loading="eager"/g, 'loading="lazy"');
  if (source.includes('logo (1)') && match.index < 8000) tag = tag.replace(/\s*\/>$/, ' fetchpriority="high" />');

  html = `${html.slice(0, match.index)}${tag}${html.slice(match.index + match[0].length)}`;
}

await writeFile(htmlPath, html, 'utf8');

