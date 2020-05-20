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

import { Component, Output, EventEmitter, Input } from '@angular/core';
import { FluidPaletteGenerationOptions } from '@dynatrace/shared/barista-definitions';
import { DEFAULT_GENERATION_OPTIONS } from '@dynatrace/design-tokens-ui/shared';

@Component({
  selector: 'design-tokens-ui-easing-settings',
  templateUrl: './easing-settings.component.html',
  styleUrls: ['./easing-settings.component.scss'],
})
export class DesignTokensUiEasingSettingsComponent {
  /** Input palette generation options object */
  @Input() options: FluidPaletteGenerationOptions = DEFAULT_GENERATION_OPTIONS;

  /** Number of shades in the current palette */
  @Input() distributionCount = 7;

  @Output() optionsChange = new EventEmitter<FluidPaletteGenerationOptions>();
  @Output() distributionsChange = new EventEmitter<number[]>();

  /* @internal Change detection workaround */
  _updateOptions(): void {
    this.options = { ...this.options };
    this.optionsChange.emit(this.options);
  }
}
