import { sync } from 'glob';
import { promises as fs } from 'fs';
import { BaFile } from '../page-types/file';

const files = sync('libs/barista-components/**/*/{barista.json,README.md}');

function componentsBuilder(com) {}

export async function fileReader(filePath: string): Promise<BaFile<string>> {
  const content = await fs.readFile(filePath, { encoding: 'utf8' });
  return new BaFile<string>(filePath, content);
}

export async function main() {
  console.log(files);

  const bulkRead = await Promise.all(files.map(file => fileReader(file)));
  console.log(bulkRead);
}
