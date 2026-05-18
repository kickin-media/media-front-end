import {Component, computed, effect, HostListener, inject, Signal, signal} from '@angular/core';

import { PhotoService } from '../../services/api/photo.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { filter, first, Observable } from 'rxjs';
import { AlbumDetailed, Photo, PhotoDetailed } from '../../util/types';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { ImageQualityService } from '../../services/image-quality.service';
import { LightboxPhotoOptionsComponent } from './components/lightbox-photo-options/lightbox-photo-options.component';
import { LightboxDownloadMenuComponent } from './components/lightbox-download-menu/lightbox-download-menu.component';
import { ExifPipe, ExifShutterSpeedPipe } from '../../pipes/exif.pipe';
import { AlbumService } from '../../services/api/album.service';
import { ShareService } from '../../services/share.service';
import { Router } from '@angular/router';
import slugify from 'slugify';
import { AccountService } from '../../services/account.service';
import {PhotoGalleryStore} from "../album/stores/photo-gallery.store";
import {AlbumStore} from "../../shared/stores/album.store";
import {PhotoReadSingleStub} from "../../shared/back-end";

@Component({
  selector: 'app-lightbox',
  imports: [
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatTooltipModule,
    MatChipsModule,
    LightboxPhotoOptionsComponent,
    LightboxDownloadMenuComponent,
    ExifPipe,
    DecimalPipe,
    ExifPipe,
    ExifShutterSpeedPipe,
    AsyncPipe,
  ],
  templateUrl: './lightbox.component.html',
  styleUrl: './lightbox.component.scss',
})
export class LightboxComponent {
  protected router = inject(Router);
  protected accountService = inject(AccountService);
  protected albumService = inject(AlbumService);
  protected imageQualityService = inject(ImageQualityService);
  protected photoService = inject(PhotoService);
  protected shareService = inject(ShareService);

  protected readonly albumStore = inject(AlbumStore);
  protected readonly photoGalleryStore = inject(PhotoGalleryStore);

  protected index = signal<number>(0);
  protected readonly photo: Signal<PhotoReadSingleStub | null>;

  protected closeOverlay: (() => void) | null = null;

  constructor() {
    this.close = this.close.bind(this);

    this.photo = computed(() => {
      const photos = this.photoGalleryStore.photos();
      const index = this.index();

      if (photos.length === 0 || index >= photos.length) return null;
      return photos[index];
    });

    effect(() => {
      const album = this.albumStore.album();
      if (!album) return;

      const photo = this.photo();
      if (!photo) return;

      // Update the current photo in the photo service
      this.photoService.setCurrentPhoto(photo.id);

      // Update the URL to reflect the current photo
      const newUrl = this.router.createUrlTree([`/album/${album.id}/${slugify(album.name)}`], {
        queryParams: { lightbox: photo.id },
        queryParamsHandling: 'merge',
      });
      history.replaceState({}, '', newUrl.toString());
    });
  }

  onOpen(close: () => void, initialPhotoId: string) {
    this.closeOverlay = close;
    this.photoService.setCurrentPhoto(initialPhotoId);

    const photos = this.photoGalleryStore.photos();
    const photoIds = photos.map(photo => photo.id);
    this.index.set(photoIds.indexOf(initialPhotoId));
  }

  go(direction: -1 | 1) {
    this.index.update(value => value + direction);
  }

  @HostListener('document:keydown.escape')
  close() {
    if (!this.closeOverlay) return;
    this.closeOverlay();
  }

  @HostListener('document:keydown.arrowleft')
  goBack() {
    if (this.index() <= 0) return;
    this.go(-1);
  }

  @HostListener('document:keydown.arrowright')
  goNext() {
    const photos = this.photoGalleryStore.photos();
    if (!photos || this.index() + 1 >= photos.length) return;
    this.go(1);
  }

  protected getPhotoSrc(photo: Photo): string | null {
    return photo.img_urls[this.imageQualityService.lightboxQuality];
  }
}
