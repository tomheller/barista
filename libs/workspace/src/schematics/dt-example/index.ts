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

import { strings } from '@angular-devkit/core';
import {
  apply,
  chain,
  mergeWith,
  move,
  Rule,
  template,
  url,
} from '@angular-devkit/schematics';
import { DtExampleOptions } from './schema';

// tslint:disable-next-line: no-default-export
export default function(options: DtExampleOptions): Rule {
  // options.moduleName = `Dt${strings.classify(options.name)}Module`;
  // options.selector = `dt-${strings.dasherize(options.name)}`;
  console.log('Options Dev:', options);

  const templateSource = apply(url('./files'), [
    template({
      ...strings,
      ...options,
    }),
    move('src'),
  ]);

  return chain([mergeWith(templateSource)]);
}
