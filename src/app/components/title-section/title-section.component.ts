import { Component, Input } from '@angular/core';
import { NgForOf, NgIf } from "@angular/common";
import { RouterLink } from "@angular/router";

@Component({
  selector: 'title-section',
  standalone: true,
  imports: [
    NgIf,
    NgForOf,
    RouterLink
  ],
  templateUrl: './title-section.component.html',
  styleUrl: './title-section.component.scss'
})
export class TitleSectionComponent {

  @Input() title?: string;
  @Input() breadcrumb?: Breadcrumb[];

}

export interface Breadcrumb {
  title: string;
  url: string;
}
