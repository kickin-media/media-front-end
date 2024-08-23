import { Component, HostListener } from '@angular/core';

import { PhotoService } from "../../services/api/photo.service";
import { MatToolbar } from "@angular/material/toolbar";
import { filter, first, Observable } from "rxjs";
import { AlbumDetailed, Photo, PhotoDetailed } from "../../util/types";
import { MatIcon } from "@angular/material/icon";
import { MatIconButton } from "@angular/material/button";
import { MatTooltip } from "@angular/material/tooltip";
import { MatChipsModule } from "@angular/material/chips";
import { DecimalPipe, NgIf } from "@angular/common";
import { ImageQualityService } from "../../services/image-quality.service";
import { MatMenu, MatMenuItem } from "@angular/material/menu";
import { LightboxPhotoOptionsComponent } from "./components/lightbox-photo-options/lightbox-photo-options.component";
import { LightboxDownloadMenuComponent } from "./components/lightbox-download-menu/lightbox-download-menu.component";
import { ExifPipe, ExifShutterSpeedPipe } from "../../pipes/exif.pipe";
import { AlbumService } from "../../services/api/album.service";
import { ShareService } from "../../services/share.service";
import { Router } from "@angular/router";
import slugify from "slugify";

@Component({
  selector: 'lightbox',
  standalone: true,
  imports: [
    MatToolbar,
    MatIcon,
    MatIconButton,
    MatTooltip,
    MatChipsModule,
    NgIf,
    MatMenu,
    MatMenuItem,
    LightboxPhotoOptionsComponent,
    LightboxDownloadMenuComponent,
    ExifPipe,
    DecimalPipe,
    ExifPipe,
    ExifShutterSpeedPipe,
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
