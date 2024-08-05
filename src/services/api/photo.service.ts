import { Injectable } from '@angular/core';
import { BaseService, FetchedObject } from "../base.service";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, of } from "rxjs";
import { Photo, PhotoDetailed } from "../../util/types";

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

  setCurrentPhoto(photoId: Photo["id"] | null) {
    this.idSubject$.next(photoId);
  }

  // TODO: Other CRUD actions

  protected fetchPhoto(photoId: string): Observable<PhotoDetailed> {
    return this.http.get<PhotoDetailed>(`/photo/${photoId}`);
  }

}
