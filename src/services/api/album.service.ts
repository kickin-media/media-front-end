import { Injectable } from '@angular/core';
import { BaseService, FetchedObject } from "../base.service";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { map, Observable, of } from "rxjs";
import { Album, AlbumCreate, AlbumDetailed, AlbumUpdate, Photo } from "../../util/types";

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
  ) {
    super(router, activatedRoute);

    // TODO: Get the album ID from the window location
    this.id$ = this.trackRouteParam("album_id");

    // Retrieve the current album
    this.album = this.fetchOnChange(
      this.id$,
      id => this.fetchAlbum(id),
      null,
    );
  }

  create(album: AlbumCreate): Observable<AlbumDetailed> {
    return this.http.post<AlbumDetailed>("/album/", album);
  }

  update(id: Album["id"], album: AlbumUpdate): Observable<AlbumDetailed> {
    return this.http.put<AlbumDetailed>(`/album/${id}`, album);
  }

  delete(id: Album["id"]): Observable<boolean> {
    return this.http.delete(`/album/${id}`).pipe(map(() => true));
  }

  setAlbumCover(id: Album["id"], photoId: Photo["id"]): Observable<boolean> {
    return this.http.put(`/album/${id}/cover`, { photo_id: photoId }).pipe(map(() => true));
  }

  setSecretStatus(id: Album["id"], isSecret: boolean, refreshSecret: boolean = false): Observable<boolean> {
    return this.http.put(
      `/album/${id}/hidden`,
      { is_secret: isSecret, refresh_secret: refreshSecret },
    ).pipe(map(() => true));
  }

  empty(id: Album["id"]): Observable<boolean> {
    return this.http.delete(`/album/${id}/empty`).pipe(map(() => true));
  }

  increaseViewcount(id: Album["id"]): Observable<boolean> {
    return this.http.put(`/album/${id}/view`, "").pipe(map(() => true));
  }

  protected fetchAlbum(id: Album["id"]): Observable<AlbumDetailed> {
    return this.http.get<AlbumDetailed>(`/album/${id}`);
  }

}
