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

import { Injectable, NgZone, Inject } from '@angular/core';
import { BehaviorSubject, Observable, fromEvent } from 'rxjs';
import { distinctUntilChanged, auditTime } from 'rxjs/operators';
import { Platform } from '@angular/cdk/platform';
import { compareValues } from '@dynatrace/barista-components/core';
import { DOCUMENT } from '@angular/common';

/** Contains boundingclientrect top property and element. Used for check which item is active */
interface HeadlineElement {
  top: number;
  element: Element;
}

/**
 * The Scroll spy service should get the elements from outside, then check wich element is
 * currently active and should be highlighted.
 * Save that item into a stream and the toc component then subscribes to it.
 * The TOC component then handles the check which item to highlight
 */
@Injectable({ providedIn: 'root' })
export class BaScrollSpyService {
  /** Top Offset */
  OFFSET = 66;

  /** Top value and elements for every headline in the page content */
  headlineElements: HeadlineElement[] = [];

  /** Id of currently active item */
  activeItemId$ = new BehaviorSubject<string>('');

  constructor(
    private _platform: Platform,
    private _zone: NgZone,
    @Inject(DOCUMENT) private _document: any,
  ) {}

  /** Start spying on an element array of headlines returning a stream with the active item */
  spyOn(elements: Element[]): Observable<string> {
    // Initially calculate boundclientrect top values for every headline.
    this.calcTopValues(elements);
    // Resize and Scroll trigger event calculates top values and active item.
    fromEvent(window, 'resize')
      .pipe(auditTime(300))
      .subscribe(() => {
        this.calculateActiveItem(elements);
      });
    fromEvent(window, 'scroll')
      .pipe(auditTime(10))
      .subscribe(() => {
        this.calculateActiveItem(elements);
      });
    return this.activeItemId$.asObservable().pipe(distinctUntilChanged());
  }

  /** Calculates top values and finds the active item putting it into a stream */
  calculateActiveItem(elements: Element[]): void {
    this.calcTopValues(elements);
    this.activeItemId$.next(this.findActiveItem());
  }

  /** Calculates top bounding properties for an element array */
  calcTopValues(elements: Element[]): void {
    this.headlineElements = [];
    elements.forEach((element) => {
      const headlineElement: HeadlineElement = {
        top:
          this._getScrollTop() +
          element.getBoundingClientRect().top -
          this.OFFSET,
        element: element,
      };
      this.headlineElements.push(headlineElement);
    });
    this.headlineElements.sort((a, b) => compareValues(a.top, b.top, 'asc'));
  }

  /**
   * Evaluates by comparing the users scroll position with element top property and return the id of an element
   * that should be highlighted
   */
  findActiveItem(): string {
    // The element id of the item to be hghlighted
    let activeItem: string | null = null;
    this._zone.runOutsideAngular(() => {
      const scrollTop = this._getScrollTop();
      const contentHeight = this._getContentHeight();
      const viewportHeight = this._getViewportHeight();
      for (let i = 0; i < this.headlineElements.length; i++) {
        // Check whether an elements top value is smaller then the users scroll top position and offset
        // resulting in setting that value as `active`
        if (this.headlineElements[i].top <= scrollTop + this.OFFSET) {
          activeItem = this.headlineElements[i].element.id;
        } else if (scrollTop + viewportHeight >= contentHeight) {
          // Special case when user is at the bottom of the page and there's no way tthe last item will be active
          activeItem = this.headlineElements[this.headlineElements.length - 1]
            .element.id;
        }
      }
    });
    return activeItem!;
  }

  /** Current position of user in Browser */
  private _getScrollTop(): number {
    return (this._platform.isBrowser && window.pageYOffset) || 0;
  }

  /** Height of the whole content */
  private _getContentHeight(): number {
    return this._document.body.scrollHeight || Number.MAX_SAFE_INTEGER;
  }

  /** Height of the viewport */
  private _getViewportHeight(): number {
    return (this._platform.isBrowser && window.innerHeight) || 0;
  }
}
