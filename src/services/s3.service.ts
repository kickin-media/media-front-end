import { Injectable } from '@angular/core';
import { S3PreSignedUrl } from "../util/types";
import { map, Observable, switchMap } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { fromPromise } from "rxjs/internal/observable/innerFrom";

@Injectable({
  providedIn: 'root'
})
export class S3Service {

  constructor(protected http: HttpClient) {
  }

  /**
   * Uploads a photo to S3
   * @param photo the photo to upload
   * @param s3Url the required S3 upload information
   */
  uploadPhoto(photo: File, s3Url: S3PreSignedUrl): Observable<boolean> {
    // Read photo file and upload
    return fromPromise(photo.arrayBuffer()).pipe(
      map(data => {
        // Create a multipart form
        const form = new FormData();

        // Add S3 authorization fields
        Object.entries(s3Url.fields).forEach(([key, value]) => form.append(key, value));

        // Convert file to blob and append it to the form
        const blob = new Blob([data], { type: "image/jpeg" });
        form.append("file", blob);

        return form;
      }),
      switchMap(form => this.http.post(s3Url.url, form)),
      map(() => true),
    );
  }

}
