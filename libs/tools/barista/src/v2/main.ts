import { sync } from 'glob';
import { promises as fs } from 'fs';
import { BaFile, BaJSONFile } from './page-types/file';
import { extname } from 'path';
import { componentPagesBuilder } from './builders/component-pages-builder';

const ASSETS = [
  ...sync('libs/barista-components/**/*/{barista.json,README.md}'),
  ...sync('libs/barista-components/*.md'),
];

export async function fileReader(filePath: string): Promise<BaFile> {
  const content = await fs.readFile(filePath, { encoding: 'utf8' });

  switch (extname(filePath)) {
    case '.json':
      return new BaJSONFile(filePath, content);
    default:
      return new BaFile<string>(filePath, content);
  }
}

export function readAllResources(assets: string[]): Promise<BaFile[]> {
  const uniqueFiles = Array.from(new Set(assets));
  return Promise.all(uniqueFiles.map(file => fileReader(file)));
}

export async function main() {
  // 1. Read all necessary assets
  const sources = await readAllResources(ASSETS);

  // 2 Build all pages with the builders
  componentPagesBuilder(sources);

  // 3. Transform all pages

  // 4. If all done write the files to the filesystem.
}
