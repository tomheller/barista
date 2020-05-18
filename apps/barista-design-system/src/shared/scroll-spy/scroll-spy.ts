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
  OnInit,
  ElementRef,
  // ViewChildren,
  QueryList,
  ComponentFactoryResolver,
  ViewContainerRef,
  ComponentRef,
  ComponentFactory,
  Injector,
  AfterViewInit,
  ContentChildren,
} from '@angular/core';
import { createComponent } from '../../utils/create-component';

@Component({
  selector: 'h2[baTableOfContentSection], h3[baTableOfContentSection]',
  template: '<ng-content></ng-content>',
})
export class BaTableOfContentSection implements OnInit {
  tableOfContentItem: HTMLAnchorElement;

  constructor(private _elementRef: ElementRef) {}

  ngOnInit(): void {
    this.tableOfContentItem = this._elementRef.nativeElement;
  }
}

@Component({
  selector: '[baTableOfContentsArea]',
  template: '<ng-content></ng-content>',
})
export class BaTableOfContentsArea implements AfterViewInit {
  // @ContentChildren('[baTableOfContentSection]')
  // tableOfContentSections: QueryList<BaTableOfContentSection>;

  tableOfContentSectionsCompRef: ComponentRef<BaTableOfContentSection>[] = [];

  private _componentFactory: ComponentFactory<BaTableOfContentSection>;

  private _componentRefs: ComponentRef<any>[] = [];

  options = {
    root: null, // relative to document viewport
    rootMargin: '0px', // margin around root. Values are similar to css property. Unitless values not allowed
    threshold: 1.0, // visible amount of item shown in relation to root
  };

  observer = new IntersectionObserver(this.onChange, this.options);

  constructor(
    private _elementRef: ElementRef<HTMLElement>,
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _viewContainerRef: ViewContainerRef,
    private _injector: Injector,
  ) {}

  ngAfterViewInit(): void {
    // tslint:disable-next-line: await-promise
    this.createComponents();
    console.log(this.tableOfContentSectionsCompRef);
    this.tableOfContentSectionsCompRef.forEach((tocItem) => {
      console.log(tocItem);
      this.observer.observe(tocItem.instance.tableOfContentItem);
    });
  }

  // TODO: Fetch all TOC sections and instantiate them dynamically for each headline.
  // TODO: Use Component Factory Resolver. UNDERSTAND IT THEN USE IT TO YOUR ADVANTAGE

  createComponents(): void {
    console.log('created area');
    this._componentFactory = this._componentFactoryResolver.resolveComponentFactory(
      BaTableOfContentSection,
    );
    const placeholderElements: HTMLElement[] = Array.from(
      this._elementRef.nativeElement.querySelectorAll(
        this._componentFactory.selector,
      ),
    );
    placeholderElements.forEach((el) => {
      const children = [].slice.call(el.childNodes);
      const component = createComponent<BaTableOfContentSection>(
        this._componentFactory,
        this._viewContainerRef,
        this._injector,
        el,
        [...children],
      );
      this._componentRefs.push(component);
      this.tableOfContentSectionsCompRef.push(component);
      debugger;
    });
  }

  // tslint:disable-next-line: typedef
  onChange(changes, observer): void {
    console.log(typeof changes, typeof observer);
    changes.forEach((change) => {
      if (change.intersectionRatio > 0) {
        console.log('intersected', change);
      }
    });
  }
}
