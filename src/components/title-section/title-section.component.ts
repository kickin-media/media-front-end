import { Component, HostBinding, input } from '@angular/core';

import { RouterLink } from '@angular/router';
import { SkeletonLineComponent } from '../skeleton-line/skeleton-line.component';

@Component({
  selector: 'app-title-section',
  imports: [RouterLink, SkeletonLineComponent],
  templateUrl: './title-section.component.html',
  styleUrl: './title-section.component.scss',
})
export class TitleSectionComponent {
  readonly title = input<string>();
  readonly breadcrumb = input<Breadcrumb[] | null>();

  @HostBinding('class.sticky')
  readonly sticky = input(false);
}

export interface Breadcrumb {
  title?: string;
  url?: string;
}
