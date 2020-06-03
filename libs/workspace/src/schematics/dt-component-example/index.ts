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
import { existsSync } from 'fs';
import {
  apply,
  chain,
  mergeWith,
  Rule,
  template,
  Tree,
  url,
  noop,
} from '@angular-devkit/schematics';
import { formatFiles } from '@nrwl/workspace';
import { DtComponentExampleOptions } from './schema';
import { normalize } from '@angular-devkit/core';
import { LICENSE_HEADER } from '../../utils/common-utils';
import { join } from 'path';
import { getSourceFile, findNodes } from '../utils/ast-utils';
import * as ts from 'typescript';
import { commitChanges, InsertChange } from '../utils/change';

interface DtExampleExtendedOptions {
  componentSelector: string;
  examplesModule: string;
  exampleRoute: string;
  selector: string;
  componentModule: {
    name: string;
    package: string;
  };
  exampleComponent: {
    component: string;
    module: string;
    modulesConstant: string;
    template: string;
  };
  name: string;
  component: string;
}

function generateComponentOptions(
  options: DtComponentExampleOptions,
): { name: string; package: string } {
  return {
    name: `Dt${strings.classify(options.component)}Module`,
    package: `@dynatrace/barista-components/${strings.dasherize(
      options.component,
    )}`,
  };
}

function generateExampleComponentOptions(
  options: DtComponentExampleOptions,
): {
  component: string;
  module: string;
  modulesConstant: string;
  template: string;
} {
  return {
    component: `DtExample${strings.classify(options.name)}${strings.classify(
      options.component,
    )}`,
    module: `DtExample${strings.classify(options.name)}Module`,
    modulesConstant: `DT_${strings
      .underscore(options.component)
      .toUpperCase()}_EXAMPLES`,
    template: `${strings.dasherize(options.component)}-${strings.dasherize(
      options.name,
    )}-example.html`,
  };
}

function generateIndexFileContent(options: DtExampleExtendedOptions): string {
  return `${LICENSE_HEADER}

  export * from './${strings.dasherize(options.component)}-examples.module';
  export * from './${options.exampleRoute}';
  `;
}

function generateModuleFileContent(options: DtExampleExtendedOptions): string {
  return `${LICENSE_HEADER}
  import { NgModule } from '@angular/core';
  import { ${options.componentModule.name} } from '${options.componentModule.package}';
  import { ${options.exampleComponent.component} } from './${options.exampleRoute}';

  export const ${options.exampleComponent.modulesConstant} = [
    ${options.exampleComponent.component},
  ];

  @NgModule({
    imports: [${options.componentModule.name}],
    declarations: [...${options.exampleComponent.modulesConstant}],
    entryComponents: [...${options.exampleComponent.modulesConstant}],
  })
  export class ${options.examplesModule} {}`;
}

function addImport(
  sourceFile: ts.SourceFile,
  name: string,
  importPath: string,
  modulePath: string,
): InsertChange {
  const lastImport = findNodes(
    sourceFile,
    ts.SyntaxKind.ImportDeclaration,
  ).pop() as ts.ImportDeclaration;
  const end = lastImport.end + 1;
  const toInsertImport = `import { ${name} } from './${importPath}';`;
  return new InsertChange(modulePath, end, toInsertImport);
}

function addExport(
  sourceFile: ts.SourceFile,
  exportPath: string,
  modulePath: string,
): InsertChange {
  const lastExport = findNodes(
    sourceFile,
    ts.SyntaxKind.ExportDeclaration,
  ).pop() as ts.ExportDeclaration;
  const end = lastExport.end + 1;
  const toInsertExport = `export * from './${exportPath}';`;
  return new InsertChange(modulePath, end, toInsertExport);
}

function updateModules(options: DtExampleExtendedOptions): Rule {
  return (host: Tree) => {
    // add import
    const modulePath = join(
      'libs',
      'examples',
      'src',
      strings.dasherize(options.component),
      `${strings.dasherize(options.component)}-examples.module.ts`,
    );
    const sourceFile = getSourceFile(host, modulePath);

    const importChange = addImport(
      sourceFile,
      options.exampleComponent.component,
      options.exampleRoute,
      modulePath,
    );

    // find last module in the array, and add new module
    const modulesDeclaration = findNodes(
      sourceFile,
      ts.SyntaxKind.VariableDeclaration,
    ).find(
      (node: ts.VariableDeclaration) =>
        node.name.getText() === options.exampleComponent.modulesConstant,
    ) as ts.VariableDeclaration;
    const modulesElements = (modulesDeclaration.initializer as ts.ArrayLiteralExpression)
      .elements;
    const lastElement = modulesElements[modulesElements.length - 1];
    const end = modulesElements.hasTrailingComma
      ? lastElement.getEnd() + 1
      : lastElement.getEnd();
    const routesChange = new InsertChange(
      modulePath,
      end,
      `${modulesElements.hasTrailingComma ? ' ' : ', '}${
        options.exampleComponent.component
      }`,
    );

    return commitChanges(host, [importChange, routesChange], modulePath);
  };
}

function updateIndex(options: DtExampleExtendedOptions): Rule {
  return (host: Tree) => {
    // add export to index.ts
    const indexPath = join(
      'libs',
      'examples',
      'src',
      strings.dasherize(options.component),
      'index.ts',
    );
    const sourceIndexFile = getSourceFile(host, indexPath);
    const exportChange = addExport(
      sourceIndexFile,
      options.exampleRoute,
      indexPath,
    );

    return commitChanges(host, exportChange, indexPath);
  };
}

export default function (options: DtComponentExampleOptions): Rule {
  return async (tree: Tree) => {
    const exampleId = `${strings.dasherize(
      options.component,
    )}-${strings.dasherize(options.name)}`;
    const extendedOptions: DtExampleExtendedOptions = {
      ...options,
      componentSelector: `dt-${strings.dasherize(options.component)}`,
      selector: `dt-example-${strings.dasherize(
        options.name,
      )}-${strings.dasherize(options.component)}`,
      componentModule: generateComponentOptions(options),
      exampleComponent: generateExampleComponentOptions(options),
      examplesModule: `DtExamples${strings.classify(options.component)}Module`,
      exampleRoute: `${exampleId}-example/${exampleId}-example`,
    };

    const templateSource = apply(url('./files'), [
      template({
        ...strings,
        ...extendedOptions,
      }),
    ]);

    const indexPath = normalize(
      `libs/examples/src/${strings.dasherize(options.component)}/index.ts`,
    );
    const isNewComponent = !existsSync(indexPath);

    if (isNewComponent) {
      tree.create(indexPath, generateIndexFileContent(extendedOptions));

      const modulePath = normalize(
        `libs/examples/src/${strings.dasherize(
          options.component,
        )}/${strings.dasherize(options.component)}-examples.module.ts`,
      );
      tree.create(modulePath, generateModuleFileContent(extendedOptions));
    }

    return chain([
      mergeWith(templateSource),
      isNewComponent ? noop() : updateModules(extendedOptions),
      isNewComponent ? noop() : updateIndex(extendedOptions),
      formatFiles(),
    ]);
  };
}
