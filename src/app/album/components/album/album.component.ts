import { Component, inject, input } from '@angular/core';
import { Album } from '../../../../util/types';
import { ImageQualityService } from '../../../../services/image-quality.service';
import { AsyncPipe, DatePipe, NgClass, NgOptimizedImage } from '@angular/common';
import { SkeletonLineComponent } from '../../../../components/skeleton-line/skeleton-line.component';
import { TimestampPipe } from '../../../../pipes/timestamp.pipe';
import { RouterLink } from '@angular/router';
import slugify from 'slugify';
import { MatIconModule } from '@angular/material/icon';
import { AccountService } from '../../../../services/account.service';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-album',
  imports: [
    NgOptimizedImage,
    SkeletonLineComponent,
    TimestampPipe,
    RouterLink,
    MatIconModule,
    DatePipe,
    NgClass,
    AsyncPipe,
  ],
  templateUrl: './album.component.html',
  styleUrl: './album.component.scss',
})
export class AlbumComponent {
  protected accountService = inject(AccountService);
  protected imageQualityService = inject(ImageQualityService);

  readonly album = input<Album>();

  protected canOpenUnreleasedAlbums$: Observable<boolean>;

  constructor() {
    this.canOpenUnreleasedAlbums$ = this.accountService.scopes$.pipe(
      map(scopes =>
        ['albums:manage', 'photos:upload', 'albums:read_hidden'].some(permission => scopes.indexOf(permission) >= 0)
      )
    );
  }

  protected getAlbumUrl(): string | undefined {
    const album = this.album();
    if (!album) return undefined;
    return `/album/${album.id}/${slugify(album.name)}`;
  }

  protected getCoverPhoto(): string | null {
    const album = this.album();
    if (!album) return null;

    const cover = album.cover_photo;
    if (!cover) return null;

    return cover.img_urls[this.imageQualityService.previewQuality];
  }

  protected isReleased(): boolean {
    const album = this.album();
    if (!album || !album.release_time) return true;

    // TODO: Fix timezone
    const releaseTime = new Date(album.release_time);
    return releaseTime.getTime() - new Date().getTime() < 0;
  }
}
