import { Component, HostBinding, OnChanges, SimpleChanges, inject, input } from '@angular/core';
import { AlbumDetailed, Photo } from '../../../../util/types';
import { NgClass } from '@angular/common';
import slugify from 'slugify';
import { Router, RouterLink, UrlTree } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { SelectedPhotosStore } from '../../stores/selected-photos.store';

@Component({
  selector: 'app-album-gallery',
  imports: [RouterLink, NgClass, MatIcon],
  templateUrl: './album-gallery.component.html',
  styleUrl: './album-gallery.component.scss',
})
export class AlbumGalleryComponent implements OnChanges {
  protected router = inject(Router);

  readonly album = input.required<AlbumDetailed | null>();
  readonly photos = input.required<Photo[] | null>();

  protected selectedPhotosStore = inject(SelectedPhotosStore);

  @HostBinding('class.select-mode') selectModeStyle = false;

  processingCount = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['photos']) {
      const photos: Photo[] | null = changes['photos'].currentValue;
      if (photos && photos.length > 0) {
        this.processingCount = photos.filter(photo => !photo.upload_processed).length;
      }
    }

    if (changes['selectMode']) {
      this.selectModeStyle = changes['selectMode'].currentValue;
    }
  }

  onClickPhoto(photo: Photo, e: MouseEvent) {
    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();

    this.selectedPhotosStore.toggle(photo.id);
  }

  onImageLoad(event: Event) {
    const target = event.target as HTMLImageElement;
    const parent = target.parentNode as HTMLAnchorElement;
    parent.style.setProperty('--w', target.naturalWidth.toString());
    parent.style.setProperty('--h', target.naturalHeight.toString());
  }

  getPhotoUrl(photo: Photo): UrlTree | undefined {
    const album = this.album();
    if (!album) return undefined;
    return this.router.createUrlTree([`/album/${album.id}/${slugify(album.name)}`], {
      queryParams: { lightbox: photo.id },
      queryParamsHandling: 'merge',
    });
  }
}
