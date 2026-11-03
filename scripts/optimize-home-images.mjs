import { mkdir, readdir } from 'node:fs/promises';
import { extname, join, parse } from 'node:path';
import sharp from 'sharp';

const roots = [
  'image',
  'image/business team',
  'image/help for you',
  'image/social-post/bamboo',
  'image/social-post/mad',
  'image/social-post/all',
  'image/project',
  'image/logo',
];

const supported = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const generatedSuffix = /-(480|960|1600)$/;

for (const directory of roots) {
  await mkdir(directory, { recursive: true });
  const files = await readdir(directory);

  for (const file of files) {
    const extension = extname(file).toLowerCase();
    const { name } = parse(file);
    if (!supported.has(extension) || generatedSuffix.test(name)) continue;

    const input = join(directory, file);
    const metadata = await sharp(input).metadata();
    const output = join(directory, `${name}.webp`);

    if (extension !== '.webp') {
      await sharp(input).webp({ quality: 82, effort: 5 }).toFile(output);
    }

    const fullInput = extension === '.webp' ? input : output;
    for (const width of [480, 960, 1600]) {
      if (!metadata.width || metadata.width <= width) continue;
      await sharp(fullInput)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 80, effort: 5 })
        .toFile(join(directory, `${name}-${width}.webp`));
    }
  }
}

