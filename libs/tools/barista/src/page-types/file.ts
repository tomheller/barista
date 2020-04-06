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

import { basename, dirname } from 'path';

/**
 * The base class that is used for every file that will be generated or transformed.
 * It is used to abstract the path logic and hold all the information that are needed
 * about the folder structure and the file system.
 */
export class BaFile<T = object | string> {
  /** The root directory in the assets folder */
  rootDir: string;
  /** The folder path of the file always absolute for the dist */
  directory: string;
  /** The file name of the page */
  fileName: string;

  constructor(public filePath: string, public content: T) {
    const directory = dirname(filePath);
    this.fileName = basename(filePath);
    this.directory = directory.replace(/^[\.\/]/, ''); // replace starting dot or slash
    this.rootDir = this.directory.split('/')[0];
  }
}
