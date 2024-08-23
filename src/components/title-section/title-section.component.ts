import { Component, Input } from '@angular/core';
import { NgForOf, NgIf } from "@angular/common";
import { RouterLink } from "@angular/router";
import { SkeletonLineComponent } from "../skeleton-line/skeleton-line.component";

@Component({
  selector: 'title-section',
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    RouterLink,
    SkeletonLineComponent
  ],
  templateUrl: './title-section.component.html',
  styleUrl: './title-section.component.scss'
})
export class TitleSectionComponent {

  @Input() title?: string;
  @Input() breadcrumb?: Breadcrumb[] | null;

}

export interface Breadcrumb {
  title?: string;
  url?: string;
}
