import { Component, HostListener } from '@angular/core';

import { PhotoService } from "../../services/api/photo.service";
import { MatToolbarModule } from "@angular/material/toolbar";
import { filter, first, Observable } from "rxjs";
import { AlbumDetailed, Photo, PhotoDetailed } from "../../util/types";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatChipsModule } from "@angular/material/chips";
import { AsyncPipe, DecimalPipe, NgIf } from "@angular/common";
import { ImageQualityService } from "../../services/image-quality.service";
import { LightboxPhotoOptionsComponent } from "./components/lightbox-photo-options/lightbox-photo-options.component";
import { LightboxDownloadMenuComponent } from "./components/lightbox-download-menu/lightbox-download-menu.component";
import { ExifPipe, ExifShutterSpeedPipe } from "../../pipes/exif.pipe";
import { AlbumService } from "../../services/api/album.service";
import { ShareService } from "../../services/share.service";
import { Router } from "@angular/router";
import slugify from "slugify";
import { AccountService } from "../../services/account.service";

@Component({
  selector: 'lightbox',
  standalone: true,
  imports: [
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    NgIf,
    LightboxPhotoOptionsComponent,
    LightboxDownloadMenuComponent,
    ExifPipe,
    DecimalPipe,
    ExifPipe,
    ExifShutterSpeedPipe,
    AsyncPipe,
  ],
  templateUrl: './lightbox.component.html',
  styleUrl: './lightbox.component.scss'
})
export class LightboxComponent {

  protected album: AlbumDetailed | null = null;

  protected photos: Photo[] | null = null;
  protected photo: Photo | PhotoDetailed | null = null;
  protected index: number = 0;

  protected closeOverlay: (() => void) | null = null;

  constructor(
    protected router: Router,
    protected accountService: AccountService,
    protected albumService: AlbumService,
    protected imageQualityService: ImageQualityService,
    protected photoService: PhotoService,
    protected shareService: ShareService,
  ) {
    albumService.album.data$.pipe(
      filter(album => album !== null),
    ).subscribe(album => {
      this.album = album;
    });

    photoService.photo.data$.pipe(
      filter(photo => photo !== null),
    ).subscribe(photo => {
      this.photo = photo;
    });

    this.close = this.close.bind(this);
  }

  onOpen(
    close: () => void,
    initialPhotoId: string,
    photos$: Observable<Photo[] | null>
  ) {
    this.closeOverlay = close;
    this.photoService.setCurrentPhoto(initialPhotoId);

    // Listen to the first result of the `photos$` observable and save it
    photos$.pipe(
      filter(photos => photos !== null),
      first(),
    ).subscribe(photos => {
      this.photos = photos;
      this.index = photos.map(photo => photo.id).indexOf(initialPhotoId);
    });
  }

  go(direction: -1 | 1) {
    if (!this.photos) return;
    if (!this.album) return;

    this.index += direction;
    this.photo = this.photos[this.index];
    this.photoService.setCurrentPhoto(this.photo.id);

    const newUrl = this.router.createUrlTree(
      [`/album/${this.album.id}/${slugify(this.album.name)}`],
      {
        queryParams: { lightbox: this.photo.id },
        queryParamsHandling: "merge",
      }
    );
    history.replaceState({}, "", newUrl.toString());
  }

  @HostListener("document:keydown.escape")
  close() {
    if (!this.closeOverlay) return;
    this.closeOverlay();
  }

  @HostListener("document:keydown.arrowleft")
  goBack() {
    if (this.index <= 0) return;
    this.go(-1);
  }

  @HostListener("document:keydown.arrowright")
  goNext() {
    if (!this.photos || this.index + 1 >= this.photos.length) return;
    this.go(1);
  }

  protected getPhotoSrc(photo: Photo): string | null {
    return photo.img_urls[this.imageQualityService.lightboxQuality];
  }

}
