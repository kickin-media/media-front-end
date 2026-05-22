import { Component, effect, HostListener, inject } from '@angular/core';

import { MatToolbarModule } from '@angular/material/toolbar';
import { Photo } from '../../util/types';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { ImageQualityService } from '../../services/image-quality.service';
import { LightboxPhotoOptionsComponent } from './components/lightbox-photo-options/lightbox-photo-options.component';
import { LightboxDownloadMenuComponent } from './components/lightbox-download-menu/lightbox-download-menu.component';
import { ExifPipe, ExifShutterSpeedPipe } from '../../pipes/exif.pipe';
import { ShareService } from '../../services/share.service';
import { Router } from '@angular/router';
import slugify from 'slugify';
import { AccountService } from '../../services/account.service';
import { PhotoGalleryStore } from '../album/stores/photo-gallery.store';
import { AlbumStore } from '../../shared/stores/album.store';
import { LightboxPhotoStore } from './stores/lightbox-photo.store';

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
  protected imageQualityService = inject(ImageQualityService);
  protected shareService = inject(ShareService);

  protected readonly albumStore = inject(AlbumStore);
  protected readonly lightboxPhotoStore = inject(LightboxPhotoStore);
  protected readonly photoGalleryStore = inject(PhotoGalleryStore);

  protected closeOverlay: (() => void) | null = null;

  constructor() {
    this.close = this.close.bind(this);

    effect(() => {
      const album = this.albumStore.album();
      if (!album) return;

      const photo = this.lightboxPhotoStore.photo();
      if (!photo) return;

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
    this.lightboxPhotoStore.setCurrentPhoto(initialPhotoId);
  }

  @HostListener('document:keydown.escape')
  close() {
    if (!this.closeOverlay) return;
    this.closeOverlay();
  }

  @HostListener('document:keydown.arrowleft')
  goBack() {
    this.lightboxPhotoStore.back();
  }

  @HostListener('document:keydown.arrowright')
  goNext() {
    this.lightboxPhotoStore.next();
  }

  protected getPhotoSrc(photo: Photo): string | null {
    return photo.img_urls[this.imageQualityService.lightboxQuality];
  }
}
