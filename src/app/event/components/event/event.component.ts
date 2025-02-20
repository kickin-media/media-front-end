import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

import { Album, PhotoEvent } from '../../../../util/types';
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { RouterLink } from "@angular/router";
import { SlugPipe } from "../../../../pipes/slug.pipe";
import { NgForOf } from "@angular/common";
import { AlbumComponent } from "../../../album/components/album/album.component";
import { parseDate } from "../../../../pipes/timestamp.pipe";

@Component({
  selector: 'event',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    RouterLink,
    SlugPipe,
    NgForOf,
    AlbumComponent
  ],
  templateUrl: './event.component.html',
  styleUrl: './event.component.scss'
})
export class EventComponent implements OnChanges {

  @Input() event!: PhotoEvent;
  @Input() albums!: Album[];
  @Input() canSeeAllAlbums!: boolean;

  protected sortedAlbums: (Album | undefined)[] | undefined;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["albums"]) {
      const albums: Album[] = changes["albums"].currentValue;

      const filtered = albums
        ? albums.filter(album => this.canSeeAllAlbums || album.photos_count > 0) as Album[]
        : [];

      // Sort the albums based on most-popular first (and only take the first 4)
      const sorted = filtered.sort((a: Album, b: Album) => b.views - a.views).slice(0, 4);

      // Fill with placeholder albums up to 4
      this.sortedAlbums = [...sorted, ...new Array(4 - sorted.length).fill(undefined)];
    }
  }

}
