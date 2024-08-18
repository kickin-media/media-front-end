import { Injectable } from '@angular/core';
import { Album, AlbumDetailed, Photo, PhotoDetailed } from "../util/types";
import { MatSnackBar } from "@angular/material/snack-bar";
import slugify from "slugify";
import { HttpClient } from "@angular/common/http";
import { map, switchMap } from "rxjs";
import { readAndCompressImage } from "browser-image-resizer";
import { fromPromise } from "rxjs/internal/observable/innerFrom";

@Injectable({
  providedIn: 'root'
})
export class ShareService {

  constructor(
    protected http: HttpClient,
    protected snackbar: MatSnackBar,
  ) { }

  shareAlbum(album: Album | AlbumDetailed) {
    let albumUrl = window.location.origin + `/album/${album.id}/${slugify(album.name)}`;
    if (album.hidden_secret) {
      albumUrl += "?secret=" + album.hidden_secret;
    }

    if ("share" in navigator) {
      // If the user has `share` available in the navigator, then use the Share API
      navigator.share({
        title: "Kick-In Media -- " + album.name,
        url: albumUrl,
      });
    } else if ("clipboard" in navigator) {
      // Otherwise fall back on the Clipboard API
      const clipboardItem = new ClipboardItem({ "text/plain": albumUrl });
      (navigator as Navigator).clipboard.write([clipboardItem])
        .then(() => this.snackbar.open("Photo copied to clipboard."))
        .catch(error => {
          console.error(error);
          this.snackbar.open("Could not copy the photo; please check your browser settings...")
        });
    } else {
      this.snackbar.open("Could not share the album automatically, please share the URL manually...");
    }
  }

  sharePhoto(album: Album | AlbumDetailed, photo: Photo | PhotoDetailed) {
    const file$ = this.http.get(photo.img_urls.large, { responseType: "blob" });

    if ("share" in navigator) {
      // If the user has `share` available in the navigator, then use the Share API
      file$.subscribe({
        next: blob => {
          navigator.share({
            title: "Kick-In Media -- " + album.name,
            files: [new File(
              [blob],
              album.name + " -- " + photo.author.name + " -- " + photo.id + ".jpg",
              { type: "image/jpeg" },
            )],
          });
        },
        error: () => this.snackbar.open("Something went wrong while sharing the photo; please try again later..."),
      });
    } else if ("clipboard" in (navigator as any)) {
      // Otherwise fall back on the Clipboard API
      file$.pipe(
        map(file => readAndCompressImage(
          new File([file], "tmp", { type: file.type }),
          { maxHeight: 4000, maxWidth: 4000, quality: 1.0, mimeType: "image/png" },
        )),
        switchMap(file => fromPromise(file)),
      ).subscribe({
        next: file => {
          const clipboardItem = new ClipboardItem({ [file.type]: file });
          (navigator as Navigator).clipboard.write([clipboardItem])
            .then(() => this.snackbar.open("Photo copied to clipboard."))
            .catch(error => {
              console.error(error);
              this.snackbar.open("Could not copy the photo; please check your browser settings...")
            });
        },
        error: () => this.snackbar.open("Something went wrong while sharing the photo; please try again later..."),
      });
    } else {
      console.warn("Sharing not possible, Share API and Clipboard API are both unavailable.");
      this.snackbar.open("Could not share the photo automatically; please share the URL manually...");
    }
  }

}
