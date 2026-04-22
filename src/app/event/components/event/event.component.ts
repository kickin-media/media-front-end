import { Component, OnChanges, SimpleChanges, input } from '@angular/core';

import { Album, PhotoEvent } from '../../../../util/types';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { SlugPipe } from '../../../../pipes/slug.pipe';

import { AlbumComponent } from '../../../album/components/album/album.component';

@Component({
  selector: 'app-event',
  imports: [MatIconModule, MatButtonModule, RouterLink, SlugPipe, AlbumComponent],
  templateUrl: './event.component.html',
  styleUrl: './event.component.scss',
})
export class EventComponent implements OnChanges {
  readonly event = input.required<PhotoEvent>();
  readonly albums = input.required<Album[]>();
  readonly canSeeAllAlbums = input.required<boolean>();

  protected sortedAlbums: (Album | undefined)[] | undefined;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['albums']) {
      const albums: Album[] = changes['albums'].currentValue;

      const filtered = albums
        ? (albums.filter(album => this.canSeeAllAlbums() || album.photos_count > 0) as Album[])
        : [];

      // Sort the albums based on most-popular first (and only take the first 4)
      const sorted = filtered.sort((a: Album, b: Album) => b.views - a.views).slice(0, 4);

      // Fill with placeholder albums up to 4
      this.sortedAlbums = [...sorted, ...new Array(4 - sorted.length).fill(undefined)];
    }
  }
}
