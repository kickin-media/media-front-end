import { Injectable } from '@angular/core';
import { BaseService } from "../base.service";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PhotoService extends BaseService {

  readonly id$: Observable<string | null>;

  constructor(
    router: Router,

    protected http: HttpClient,
  ) {
    super(router);

    // TODO: Get the album ID from the window location
    this.id$ = of("dbcfd4bc-e66b-496f-b8fe-c1b811610d17");
  }
}
