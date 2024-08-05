import { Component } from '@angular/core';

import { PhotoService } from "../../services/api/photo.service";
import { MatToolbar } from "@angular/material/toolbar";
import { Observable } from "rxjs";
import { Photo } from "../../util/types";
import { MatIcon } from "@angular/material/icon";
import { MatIconButton } from "@angular/material/button";
import { MatTooltip } from "@angular/material/tooltip";
import { MatChipsModule } from "@angular/material/chips";

@Component({
  selector: 'lightbox',
  standalone: true,
  imports: [
    MatToolbar,
    MatIcon,
    MatIconButton,
    MatTooltip,
    MatChipsModule,
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
    protected photoService: PhotoService,
  ) {
  }

  onOpen(close: () => void, initialPhotoId: string, photos$: Observable<Photo[] | null>) {
    this.closeOverlay = close;

  }

  close() {
    if (!this.closeOverlay) return;
    this.closeOverlay();
  }

}
