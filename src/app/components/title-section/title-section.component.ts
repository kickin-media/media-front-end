import { Component, Input } from '@angular/core';
import { NgIf } from "@angular/common";

@Component({
  selector: 'title-section',
  standalone: true,
  imports: [
    NgIf
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
