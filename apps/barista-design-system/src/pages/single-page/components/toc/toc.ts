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

import {
  Component,
  ViewChildren,
  OnInit,
  Inject,
  Input,
  QueryList,
  NgZone,
} from '@angular/core';
import { Platform } from '@angular/cdk/platform';
import { DOCUMENT } from '@angular/common';
import { TableOfContents } from '@dynatrace/shared/barista-definitions';
import { BaScrollSpyService } from '../../../../shared/services/scroll-spy.service';

@Component({
  selector: 'ba-toc',
  templateUrl: 'toc.html',
  styleUrls: ['toc.scss'],
  host: {
    class: 'ba-toc',
  },
})
export class BaToc implements OnInit {
  @Input()
  tocItems: TableOfContents[];

  /** @internal all TOC entries */
  @ViewChildren('headline') _headlines: QueryList<HTMLElement>;

  /** @internal whether the TOC is expanded  */
  _expandToc: boolean;

  /** @internal the TOC items that are currently active */
  _activeItems: TableOfContents[] = [];

  constructor(
    private _scrollSpyService: BaScrollSpyService,
    private _platform: Platform,
    private _zone: NgZone,
    @Inject(DOCUMENT) private _document: any,
  ) {}

  ngOnInit(): void {
    this.subscribeToActiveItems();
  }

  /** Subscribes to the activeItemId$ stream from the scroll spy and sets the active item */
  subscribeToActiveItems(): void {
    this._zone.runOutsideAngular(() => {
      this._scrollSpyService.activeItemId$
        .asObservable()
        .subscribe((activeItemId) => {
          this._activeItems = [];
          for (const tocItem of this.tocItems) {
            if (tocItem.id === activeItemId) {
              this._activeItems.push(tocItem);
            }
            if (tocItem.children) {
              for (const tocSubItem of tocItem.children) {
                if (tocSubItem.id === activeItemId) {
                  this._activeItems.push(tocItem, tocSubItem);
                }
              }
            }
          }
        });
    });
  }

  /** @internal toggle the expandable menu */
  _expandTocMenu(): void {
    this._expandToc = !this._expandToc;
  }

  /** @internal handle the click on a TOC item */
  _handleTocClick(ev: MouseEvent): void {
    /* Preventing the default behavior is necessary, because on Angular component pages
     * there's a base URL defined and the on-page-links are always relative to "/"
     * and not to the current page. */
    ev.preventDefault();
    ev.stopImmediatePropagation();
    const targetId = (ev.currentTarget as HTMLAnchorElement).hash;
    const target = this._document.querySelector(targetId);

    if (this._platform.isBrowser && target) {
      // Has to be set manually because of preventDefault() above.
      const newLocation =
        window.location.origin + window.location.pathname + targetId;
      window.history.replaceState('', '', newLocation);

      requestAnimationFrame(() => {
        target.scrollIntoView({
          behavior: 'smooth',
        });
      });
    }
  }
}
