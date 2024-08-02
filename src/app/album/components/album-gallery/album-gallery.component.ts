import { Component, HostBinding, Input, OnChanges, SimpleChanges } from '@angular/core';
import { SelectionModel } from "@angular/cdk/collections";
import { Photo } from "../../../../util/types";
import { AsyncPipe, NgForOf, NgIf } from "@angular/common";

@Component({
  selector: 'album-gallery',
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    NgForOf
  ],
  templateUrl: './album-gallery.component.html',
  styleUrl: './album-gallery.component.scss'
})
export class AlbumGalleryComponent implements OnChanges {

  @Input() photos!: Photo[] | null;
  @Input() select!: SelectionModel<Photo["id"]> | null;

  @HostBinding("class.select-mode") selectMode: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["select"]) {
      this.selectMode = changes["select"].currentValue !== null;
    }
  }

  onImageLoad(event: Event) {
    const target = event.target as HTMLImageElement;
    const parent = target.parentNode as HTMLAnchorElement;
    parent.style.setProperty("--w", target.naturalWidth.toString());
    parent.style.setProperty("--h", target.naturalHeight.toString());
  }

}
