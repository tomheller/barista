import {
  BaSinglePageMeta,
  BaPageLayoutType,
} from '@dynatrace/shared/barista-definitions';
import { BaJSONFile, BaFile } from '../page-types/file';

export function componentPagesBuilder(sources: BaFile[]) {
  const markdownFiles = sources.filter(file => file.fileType === 'md');
  const componentSources = markdownFiles.filter(file =>
    file.directory.startsWith('libs/barista-components'),
  );

  // console.log(componentSources);

  for (const mdFile of markdownFiles) {
    // const baristaMetadata = componentSources.find(
    //   source =>
    //     source.directory === mdFile.directory &&
    //     source.fileType === 'json',
    // ) as BaJSONFile<any> | undefined;
    // console.log(baristaMetadata);
  }
}
