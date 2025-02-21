import { Injectable } from '@angular/core';
import { BaseService, FetchedObject } from "../base.service";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { combineLatest, first, map, Observable, of, switchMap, tap } from "rxjs";
import { Album, AlbumCreate, AlbumDetailed, AlbumUpdate, Photo } from "../../util/types";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AccountService } from "../account.service";

@Injectable({
  providedIn: 'root'
})
export class AlbumService extends BaseService {

  readonly id$: Observable<string | null>;
  readonly album: FetchedObject<AlbumDetailed | null>;

  constructor(
    router: Router,
    activatedRoute: ActivatedRoute,
    protected http: HttpClient,
    protected snackbar: MatSnackBar,
    protected accountService: AccountService,
  ) {
    super(router, activatedRoute);

    this.id$ = this.trackRouteParam("album_id").pipe(
      tap(albumId => {
        if (!albumId) return;
        // Only update the view count if this is not an authenticated user
        combineLatest([this.accountService.canManageAlbums$, this.accountService.canUpload$]).pipe(
          first(),
          switchMap(([canManage, canUpload]) => {
            if (canManage || canUpload) return of(true);
            return this.increaseViewCount(albumId);
          }),
        ).subscribe();
      }),
    );

    // Retrieve the current album
    this.album = this.fetchOnChange(
      this.id$,
      id => this.fetchAlbum(id),
      null,
      true,
    );
  }

  create(album: AlbumCreate): Observable<AlbumDetailed> {
    return this.http.post<AlbumDetailed>("/album/", album).pipe(
      tap(() => this.snackbar.open("Album created.")),
    );
  }

  update(id: Album["id"], album: AlbumUpdate): Observable<AlbumDetailed> {
    return this.http.put<AlbumDetailed>(`/album/${id}`, album).pipe(
      tap(() => this.snackbar.open("Album updated.")),
    );
  }

  delete(id: Album["id"]): Observable<boolean> {
    return this.http.delete(`/album/${id}`).pipe(
      map(() => true),
      tap(() => this.snackbar.open("Album deleted.")),
    );
  }

  setAlbumCover(id: Album["id"], photoId: Photo["id"]): Observable<boolean> {
    return this.http.put(`/album/${id}/cover`, { photo_id: photoId }).pipe(
      map(() => true),
      tap(() => this.snackbar.open("Album cover updated.")),
    );
  }

  setSecretStatus(id: Album["id"], isSecret: boolean, refreshSecret: boolean = false): Observable<boolean> {
    return this.http.put(
      `/album/${id}/hidden`,
      { is_secret: isSecret, refresh_secret: refreshSecret },
    ).pipe(map(() => true));
  }

  empty(id: Album["id"]): Observable<boolean> {
    return this.http.delete(`/album/${id}/empty`).pipe(
      map(() => true),
      tap(() => this.snackbar.open("Photos unlinked.")),
    );
  }

  increaseViewCount(id: Album["id"]): Observable<boolean> {
    return this.http.put(`/album/${id}/view`, "").pipe(map(() => true));
  }

  protected fetchAlbum(id: Album["id"]): Observable<AlbumDetailed> {
    return this.http.get<AlbumDetailed>(`/album/${id}`);
  }

}
