import { Component, Input } from '@angular/core';
import { Album } from "../../../../util/types";
import { ImageQualityService } from "../../../../services/image-quality.service";
import { AsyncPipe, DatePipe, NgClass, NgIf, NgOptimizedImage } from "@angular/common";
import { SkeletonLineComponent } from "../../../../components/skeleton-line/skeleton-line.component";
import { TimestampPipe } from "../../../../pipes/timestamp.pipe";
import { RouterLink } from "@angular/router";
import slugify from "slugify";
import { MatIconModule } from "@angular/material/icon";
import { AccountService } from "../../../../services/account.service";
import { map, Observable } from "rxjs";

@Component({
  selector: 'album',
  standalone: true,
  imports: [
    NgOptimizedImage,
    NgIf,
    SkeletonLineComponent,
    TimestampPipe,
    RouterLink,
    MatIconModule,
    DatePipe,
    NgClass,
    AsyncPipe
  ],
  templateUrl: './album.component.html',
  styleUrl: './album.component.scss'
})
export class AlbumComponent {

  @Input() album?: Album;

  protected canOpenUnreleasedAlbums$: Observable<boolean>;

  constructor(
    protected accountService: AccountService,
    protected imageQualityService: ImageQualityService,
  ) {
    this.canOpenUnreleasedAlbums$ = this.accountService.scopes$.pipe(
      map(scopes => ["albums:manage", "photos:upload"].some(permission => scopes.indexOf(permission) >= 0)),
    );
  }

  protected getAlbumUrl(): string | undefined {
    if (!this.album) return undefined;
    return `/album/${this.album.id}/${slugify(this.album.name)}`;
  }

  protected getCoverPhoto(): string | null {
    if (!this.album) return null;

    const cover = this.album.cover_photo;
    if (!cover) return null;

    return cover.img_urls[this.imageQualityService.previewQuality];
  }

  protected isReleased(): boolean {
    if (!this.album || !this.album.release_time) return true;

    // TODO: Fix timezone
    const releaseTime = new Date(this.album.release_time);
    return releaseTime.getTime() - new Date().getTime() < 0;
  }

}
