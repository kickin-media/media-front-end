import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { Album, PhotoEvent } from '../../../../util/types';
import { MatIcon, MatIconModule } from "@angular/material/icon";
import { MatButton, MatButtonModule } from "@angular/material/button";
import { RouterLink } from "@angular/router";
import { SlugPipe } from "../../../../util/slug.pipe";
import { DatePipe, NgForOf } from "@angular/common";
import { AlbumComponent } from "../../../album/components/album/album.component";

@Component({
  selector: 'event',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    RouterLink,
    SlugPipe,
    DatePipe,
    NgForOf,
    AlbumComponent
  ],
  templateUrl: './event.component.html',
  styleUrl: './event.component.scss'
})
export class EventComponent implements OnChanges {

  @Input() event!: PhotoEvent;
  @Input() albums!: Album[];

  protected sortedAlbums: (Album | undefined)[] | undefined;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["albums"]) {
      const albums = changes["albums"].currentValue;

      // Sort the albums based on most-popular first (and only take the first 4)
      const sorted = albums
        ? albums.sort((a: Album, b: Album) => b.views - a.views).slice(0, 4)
        : [];

      // Fill with placeholder albums up to 4
      this.sortedAlbums = [...sorted, ...new Array(4 - sorted.length).fill(undefined)];
    }
  }

}
