import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { combineLatest, map, Observable, switchMap } from "rxjs";
import { Album, EventCreate, EventDetailed, EventUpdate, PhotoEvent, S3PreSignedUrl } from "../../util/types";
import { BaseService, FetchedObject } from "../base.service";
import { ActivatedRoute, Router } from "@angular/router";
import { S3Service } from "../s3.service";
import { AlbumService } from "./album.service";

@Injectable({
  providedIn: 'root'
})
export class EventService extends BaseService {

  readonly allEvents: FetchedObject<PhotoEvent[]>;

  readonly id$: Observable<string | null>;
  readonly event: FetchedObject<EventDetailed | null>;
  readonly albums: FetchedObject<Album[]>;
  readonly watermarkUrl: FetchedObject<string | null>;

  constructor(
    router: Router,
    activatedRoute: ActivatedRoute,
    protected http: HttpClient,
    protected s3: S3Service,
    protected albumService: AlbumService,
  ) {
    super(router, activatedRoute);

    // Fetch all events
    const allEvents = this.fetch(() => this.fetchEvents(), []);
    this.allEvents = this.transformFetchedObject(
      allEvents,
      events => events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
      [],
    );

    // Get the event ID from the window location (or the album, if available)
    this.id$ = combineLatest([
      this.trackRouteParam("event_id"),
      albumService.album.data$
    ]).pipe(
      map(([urlId, album]) => urlId ?? (album ? album.event_id : null)),
    );

    // Fetch event details
    this.event = this.fetchOnChange(
      this.id$,
      id => this.fetchEvent(id),
      null,
      true,
    );

    // Fetch this event's albums
    const albums = this.fetchOnChange(
      this.id$,
      id => this.fetchEventAlbums(id),
      [],
    );
    this.albums = this.transformFetchedObject(
      albums,
      albums => albums.sort((a, b) => b.views - a.views),
      [],
      true,
    )

    // Fetch the current watermark
    this.watermarkUrl = this.fetchOnChange(
      this.id$,
      id => this.fetchEventWatermark(id),
      null,
    );
  }

  create(event: EventCreate): Observable<EventDetailed> {
    return this.http.post<EventDetailed>("/event/", event);
  }

  update(id: PhotoEvent["id"], event: EventUpdate): Observable<EventDetailed> {
    return this.http.put<EventDetailed>(`/event/${id}`, event);
  }

  delete(id: PhotoEvent["id"]): Observable<boolean> {
    return this.http.delete(`/event/${id}`).pipe(map(() => true));
  }

  updateWatermark(id: PhotoEvent["id"], photo: File): Observable<boolean> {
    return this.http.post<S3PreSignedUrl>(`/event/${id}/watermark`, "").pipe(
      switchMap(s3Url => this.s3.uploadPhoto(photo, s3Url)),
    );
  }

  deleteWatermark(id: PhotoEvent["id"]): Observable<boolean> {
    return this.http.delete(`/event/${id}/watermark`).pipe(map(() => true));
  }

  protected fetchEvents(): Observable<PhotoEvent[]> {
    return this.http.get<PhotoEvent[]>("/event/");
  }

  protected fetchEvent(id: PhotoEvent["id"]): Observable<EventDetailed> {
    return this.http.get<EventDetailed>(`/event/${id}`);
  }

  public fetchEventAlbums(id: PhotoEvent["id"]): Observable<Album[]> {
    return this.http.get<Album[]>(`/event/${id}/albums`);
  }

  protected fetchEventWatermark(id: PhotoEvent["id"]): Observable<string> {
    return this.http.get<string>(`/event/${id}/watermark`);
  }

}
