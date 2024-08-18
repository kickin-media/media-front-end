import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Photo } from "../util/types";
import { map, Observable, of, switchMap } from "rxjs";
import { PhotoService } from "./api/photo.service";

@Injectable({
  providedIn: 'root'
})
export class DownloadService {

  constructor(
    protected http: HttpClient,
    protected photoService: PhotoService,
  ) { }

  downloadPhoto(photo: Photo, size: keyof Photo["img_urls"], filename: string) {
    this.http.get(photo.img_urls[size], { responseType: "blob" }).pipe(
      switchMap(file => this.download(file, filename)),
    ).subscribe();
  }

  downloadOriginal(photo: Photo, filename: string) {
    this.photoService.fetchPhotoOriginalUrl(photo.id).pipe(
      switchMap(url => this.http.get(url, { responseType: "blob" })),
      switchMap(file => this.download(file, filename)),
    ).subscribe();
  }

  protected download(file: Blob, filename: string): Observable<void> {
    return of(file).pipe(
      map(file => URL.createObjectURL(file)),
      map(url => {
        const root = document.body;
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = filename;
        anchor.style.display = "none";

        root.appendChild(anchor);
        anchor.click();
        root.removeChild(anchor);
      }),
    );
  }

}
