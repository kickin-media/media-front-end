import { Component, Input } from '@angular/core';
import { Album } from "../../../../util/types";
import { ImageQualityService } from "../../../../services/image-quality.service";
import { NgIf, NgOptimizedImage } from "@angular/common";
import { SkeletonComponent } from "../../../../components/skeleton/skeleton.component";
import { SkeletonLineComponent } from "../../../../components/skeleton-line/skeleton-line.component";
import { TimestampPipe } from "../../../../pipes/timestamp.pipe";
import { SlugPipe } from "../../../../pipes/slug.pipe";
import { RouterLink } from "@angular/router";
import slugify from "slugify";

@Component({
  selector: 'album',
  standalone: true,
  imports: [
    NgOptimizedImage,
    NgIf,
    SkeletonComponent,
    SkeletonLineComponent,
    TimestampPipe,
    SlugPipe,
    RouterLink
  ],
  templateUrl: './album.component.html',
  styleUrl: './album.component.scss'
})
export class AlbumComponent {

  @Input() album?: Album;

  constructor(
    protected imageQualityService: ImageQualityService,
  ) {
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

}
