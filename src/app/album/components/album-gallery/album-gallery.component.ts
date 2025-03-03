import { Component, HostBinding, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SelectionModel } from "@angular/cdk/collections";
import { AlbumDetailed, Photo } from "../../../../util/types";
import { NgClass, NgForOf, NgIf } from "@angular/common";
import slugify from "slugify";
import { Router, RouterLink, UrlTree } from "@angular/router";
import { MatIcon } from "@angular/material/icon";

@Component({
  selector: 'album-gallery',
  standalone: true,
  imports: [
    NgForOf,
    RouterLink,
    NgClass,
    MatIcon,
    NgIf
  ],
  templateUrl: './album-gallery.component.html',
  styleUrl: './album-gallery.component.scss'
})
export class AlbumGalleryComponent implements OnChanges {

  @Input() album!: AlbumDetailed | null;
  @Input() photos!: Photo[] | null;
  @Input() select!: SelectionModel<Photo["id"]> | null;
  @Input() selectMode!: boolean;

  @HostBinding("class.select-mode") selectModeStyle: boolean = false;

  processingCount: number = 0;

  constructor(protected router: Router) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["photos"]) {
      const photos: Photo[] | null = changes["photos"].currentValue;
      if (photos && photos.length > 0) {
        this.processingCount = photos.filter(photo => !photo.upload_processed).length;
      }
    }

    if (changes["selectMode"]) {
      this.selectModeStyle = changes["selectMode"].currentValue;
    }
  }

  onClickPhoto(photo: Photo, e: MouseEvent) {
    e.preventDefault();
    e.stopImmediatePropagation();
    e.stopPropagation();

    if (this.select) this.select.toggle(photo.id);
  }

  onImageLoad(event: Event) {
    const target = event.target as HTMLImageElement;
    const parent = target.parentNode as HTMLAnchorElement;
    parent.style.setProperty("--w", target.naturalWidth.toString());
    parent.style.setProperty("--h", target.naturalHeight.toString());
  }

  getPhotoUrl(photo: Photo): UrlTree | undefined {
    if (!this.album) return undefined;
    return this.router.createUrlTree(
      [`/album/${this.album.id}/${slugify(this.album.name)}`],
      {
        queryParams: { lightbox: photo.id },
        queryParamsHandling: "merge",
      }
    );
  }

}
