import { Injectable } from '@angular/core';
import { BaseService, FetchedObject } from "../base.service";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import {
  BehaviorSubject,
  catchError, combineLatest,
  concatAll,
  EMPTY,
  expand, first,
  map,
  Observable,
  of,
  scan,
  shareReplay,
  startWith,
  switchMap,
  tap
} from "rxjs";
import { Album, Photo, PhotoDetailed, PhotoUpload } from "../../util/types";
import { MatSnackBar } from "@angular/material/snack-bar";
import { S3Service } from "../s3.service";
import { AccountService } from "../account.service";

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
    protected s3: S3Service,
    protected http: HttpClient,
    protected snackbar: MatSnackBar,
    protected accountService: AccountService,
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

  upload(albumId: Album["id"], files: File[]): Observable<PhotoUploadStatus> {
    if (files.length === 0) throw new Error("No files selected");

    return this.http.post<PhotoUpload[]>("/photo/", "", { params: { num_uploads: files.length } }).pipe(
      // Expand into N events
      map(photos => ({ index: 0, photos })),
      expand(item => {
        if (item.index + 1 >= files.length) return EMPTY;
        return of({ ...item, index: item.index + 1 });
      }),

      // Create upload observables per photo
      map(item => {
        // Upload to S3
        return this.s3.uploadPhoto(
          files[item.index],
          item.photos[item.index].pre_signed_url
        ).pipe(
          // Add to the selected album
          switchMap(() => this.setPhotoAlbums(
            item.photos[item.index].photo_id,
            [albumId],
          )),
          map(() => ({ index: item.index, file: files[item.index], success: true })),
          // Catch any errors
          catchError(() => of({ index: item.index, file: files[item.index], success: false })),
        );
      }),

      // Combine results
      concatAll(),
      scan(
        (acc, next) => {
          const res = {
            ...acc,
            total: acc.total + 1,
            remaining: acc.remaining - 1,
          };
          if (next.success) {
            res.successes += 1;
          } else {
            res.errors = [...res.errors, next.file];
          }

          return res;
        },
        { successes: 0, errors: [], total: 0, remaining: files.length, started: true } as PhotoUploadStatus,
      ),

      startWith({ successes: 0, errors: [], total: 0, remaining: files.length, started: false } as PhotoUploadStatus),

      // Display status in the snackbar on finish...
      tap(status => {
        if (status.remaining > 0) return;
        this.snackbar.open(`${status.successes} photos uploaded successfully. (${status.errors.length} errors)`);
      }),

      // Ensure this entire pipeline is only triggered once, regardless of the number of subscriptions...
      shareReplay(1),
    );
  }

  setCurrentPhoto(photoId: Photo["id"] | null) {
    this.idSubject$.next(photoId);
    if (photoId) {
      // Only update the view count if this is not an authenticated user
      combineLatest([this.accountService.canManageAlbums$, this.accountService.canUpload$]).pipe(
        first(),
        switchMap(([canManage, canUpload]) => {
          if (canManage || canUpload) return of(true);
          return this.increaseViewCount(photoId);
        }),
      ).subscribe();
    }
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

export interface PhotoUploadStatus {
  successes: number;
  errors: File[];
  total: number;
  remaining: number
  started: boolean;
}
