import { Injectable } from '@angular/core';
import { BaseService, FetchedObject } from "../base.service";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, map, Observable, tap } from "rxjs";
import { Album, Photo, PhotoDetailed } from "../../util/types";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable({
  providedIn: 'root'
})
export class PhotoService extends BaseService {

  readonly id$: Observable<string | null>;
  protected readonly idSubject$ = new BehaviorSubject<string | null>(null);

  readonly photo: FetchedObject<PhotoDetailed | null>;

  constructor(
    router: Router,
    activatedRoute: ActivatedRoute,
    protected http: HttpClient,
    protected snackbar: MatSnackBar,
  ) {
    super(router, activatedRoute);

    this.id$ = this.idSubject$.asObservable();

    // Retrieve the current photo
    this.photo = this.fetchOnChange(
      this.id$,
      id => this.fetchPhoto(id),
      null,
    );
  }

  setCurrentPhoto(photoId: Photo["id"] | null, updateViewCount: boolean = true) {
    this.idSubject$.next(photoId);
    if (updateViewCount && photoId) this.increaseViewCount(photoId).subscribe();
  }

  delete(photoId: Photo["id"]): Observable<void> {
    return this.http.delete<void>(`/photo/${photoId}`).pipe(
      tap(() => this.snackbar.open("Photo deleted.")),
    );
  }

  increaseViewCount(photoId: Photo["id"]): Observable<void> {
    return this.http.put<void>(`/photo/${photoId}/view`, "");
  }

  reprocess(photoId: Photo["id"]): Observable<void> {
    return this.http.post<void>(`/photo/${photoId}/reprocess`, "");
  }

  setPhotoAlbums(photoId: Photo["id"], albumIds: Album["id"][]): Observable<Photo> {
    return this.http.put<Photo>(`/photo/${photoId}/albums`, albumIds);
  }

  fetchPhoto(photoId: Photo["id"]): Observable<PhotoDetailed> {
    return this.http.get<PhotoDetailed>(`/photo/${photoId}`);
  }

  public fetchPhotoOriginalUrl(photoId: Photo["id"]): Observable<string> {
    return this.http.get<{ download_url: string }>(`/photo/${photoId}/original`).pipe(
      map(res => res.download_url),
    );
  }

}
