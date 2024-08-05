import { Component } from '@angular/core';

import { PhotoService } from "../../services/api/photo.service";
import { MatToolbar } from "@angular/material/toolbar";
import { filter, first, Observable } from "rxjs";
import { Photo } from "../../util/types";
import { MatIcon } from "@angular/material/icon";
import { MatIconButton } from "@angular/material/button";
import { MatTooltip } from "@angular/material/tooltip";
import { MatChipsModule } from "@angular/material/chips";
import { NgIf } from "@angular/common";
import { ImageQualityService } from "../../services/image-quality.service";

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
  ],
  templateUrl: './lightbox.component.html',
  styleUrl: './lightbox.component.scss'
})
export class LightboxComponent {

  protected photos: Photo[] | null = null;
  protected photo: Photo | null = null;
  protected index: number = 0;

  protected closeOverlay: (() => void) | null = null;

  constructor(
    protected imageQualityService: ImageQualityService,
    protected photoService: PhotoService,
  ) {
    // If the PhotoService is able to resolve the photo's detailed info before
    // the photo array is loaded, then preview it asap
    photoService.photo.data$.pipe(
      filter(photo => photo !== null),
      first(),
    ).subscribe(photo => {
      if (this.photo === null) this.photo = photo;
    });
  }

  onOpen(close: () => void, initialPhotoId: string, photos$: Observable<Photo[] | null>) {
    this.closeOverlay = close;
    this.photoService.setCurrentPhoto(initialPhotoId);

    // Listen to the first result of the `photos$` observable and save it
    photos$.pipe(
      filter(photos => photos !== null),
      first(),
    ).subscribe(photos => {
      this.photos = photos;
    });

    photos$.subscribe(console.log);
  }

  go(direction: -1 | 1) {
    if (!this.photos) return;

    this.index += direction;
    this.photo = this.photos[this.index];
    this.photoService.setCurrentPhoto(this.photo.id);
  }

  close() {
    if (!this.closeOverlay) return;
    this.closeOverlay();
  }

  protected getPhotoSrc(photo: Photo): string | null {
    return photo.img_urls[this.imageQualityService.lightboxQuality];
  }

}
