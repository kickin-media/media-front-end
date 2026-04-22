import { Component, HostBinding, Input } from '@angular/core';

import { RouterLink } from '@angular/router';
import { SkeletonLineComponent } from '../skeleton-line/skeleton-line.component';

@Component({
  selector: 'app-title-section',
  imports: [RouterLink, SkeletonLineComponent],
  templateUrl: './title-section.component.html',
  styleUrl: './title-section.component.scss',
})
export class TitleSectionComponent {
  @Input() title?: string;
  @Input() breadcrumb?: Breadcrumb[] | null;

  @HostBinding('class.sticky')
  @Input()
  sticky = false;
}

export interface Breadcrumb {
  title?: string;
  url?: string;
}
