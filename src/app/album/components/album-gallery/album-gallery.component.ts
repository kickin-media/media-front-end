import { Component, HostBinding, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SelectionModel } from "@angular/cdk/collections";
import { AlbumDetailed, Photo } from "../../../../util/types";
import { AsyncPipe, NgClass, NgForOf, NgIf } from "@angular/common";
import slugify from "slugify";
import { Router, RouterLink, UrlTree } from "@angular/router";

@Component({
  selector: 'album-gallery',
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    NgForOf,
    RouterLink,
    NgClass
  ],
  templateUrl: './album-gallery.component.html',
  styleUrl: './album-gallery.component.scss'
})
export class AlbumGalleryComponent implements OnChanges {

  @Input() album!: AlbumDetailed | null;
  @Input() photos!: Photo[] | null;
  @Input() select!: SelectionModel<Photo["id"]> | null;

  @HostBinding("class.select-mode") selectMode: boolean = false;

  constructor(protected router: Router) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["select"]) {
      this.selectMode = changes["select"].currentValue !== null;
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
