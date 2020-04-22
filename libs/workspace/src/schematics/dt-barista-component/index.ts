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
  Rule,
  template,
  url,
  externalSchematic,
  Tree,
} from '@angular-devkit/schematics';
import { getWorkspace } from '@nrwl/workspace';
import { DtBaristaComponentOptions } from './schema';
import { relative, join } from 'path';

/** The name of the component libraries project in the angular.json file */
const BARISTA_COMPONENT_PROJECT = 'components';
const ERROR_NO_COMP_PROJECT_FOUND = `
  No project named "${BARISTA_COMPONENT_PROJECT}" found in workspace json.
  This project is mandatory since the new library will be added inside this project's root folder.
`;

function removeNgModuleFiles(options: DtBaristaComponentOptions): Rule {
  return (host: Tree) => {
    const projectRoot = join(options.directory, options.name);
    const dir = host.getDir(projectRoot);
    host.exists(projectRoot);
    dir.visit(file => {
      if (file.endsWith('.module.ts')) {
        host.delete(file);
      }
    });
    return host;
  };
}

function createLibrary(options: DtBaristaComponentOptions): Rule {
  return () => {
    // We need the directory relative to libs since nrwl creates all libraries inside libs automatically
    // and if we would add libs in our directory prop we would end up with libs/libs
    const directoryRelativeToLibs = relative('libs', options.directory);

    return externalSchematic('@nrwl/angular', 'library', {
      name: options.name,
      directory: directoryRelativeToLibs,
      style: 'scss',
      prefix: options.prefix,
      simpleModuleName: true,
    });
  };
}

function applyTemplate(options: DtBaristaComponentOptions): Rule {
  const templateSource = apply(url('./files'), [
    template({
      ...strings,
      ...options,
    }),
  ]);
  return mergeWith(templateSource);
}

// tslint:disable-next-line: no-default-export
export default function(options: DtBaristaComponentOptions): Rule {
  return async (host: Tree) => {
    const workspace = await getWorkspace(host);
    const baristaCompProject = workspace.projects.get(
      BARISTA_COMPONENT_PROJECT,
    );
    if (!baristaCompProject) {
      throw new Error(ERROR_NO_COMP_PROJECT_FOUND);
    }

    options = {
      ...options,
      dashed: strings.dasherize(options.name),
      dashedPrefixed: `dt-${strings.dasherize(options.name)}`,
      class: strings.classify(options.name),
      classPrefixed: `Dt${strings.classify(options.name)}`,
      moduleName: `Dt${strings.classify(options.name)}Module`,
      selector: `dt-${strings.dasherize(options.name)}`,
      directory: baristaCompProject.root,
      prefix: baristaCompProject.prefix || 'dt',
    };

    return chain([
      createLibrary(options),
      removeNgModuleFiles(options),
      applyTemplate(options),
    ]);
  };
}
