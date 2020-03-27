/**
 * @license
 * Copyright 2020 Dynatrace LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { EOL } from 'os';
import { BaPageBuildResult } from './types';

/**
 * Generates a routes definition for universal rendering based on a list
 * of all pages that are generated for barista.
 * The list is a string that is splinted by new lines.
 * The result can be written inside a txt file.
 * @param files The array of all pages for barista
 */
export function generateRoutes(files: BaPageBuildResult[]): string {
  return files
    .map(({ relativeOutFile }) => {
      const path = relativeOutFile
        .replace(/^\//, '') // replace the leading slash
        .replace(/\..+$/, ''); // replace the file ending

      if (path === 'index') {
        return '/';
      }

      return `/${path}`;
    })
    .join(EOL);
}
