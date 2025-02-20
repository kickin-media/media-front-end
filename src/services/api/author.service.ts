import { Injectable } from "@angular/core";
import { BaseService, FetchedObject } from "../base.service";
import { catchError, map, Observable } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { AccountService } from "../account.service";
import { User } from "@auth0/auth0-angular";
import { Author, AuthorCreate } from "../../util/types";

@Injectable({
  providedIn: 'root'
})
export class AuthorService extends BaseService {

  readonly id$: Observable<string | null>;

  readonly author: FetchedObject<Author | null>;

  constructor(
    router: Router,
    activatedRoute: ActivatedRoute,

    protected http: HttpClient,

    protected account: AccountService,
  ) {
    super(router, activatedRoute);

    this.id$ = account.user$.pipe(map(user => user && user.sub ? user.sub : null));

    // Retrieve the current author
    this.author = this.fetchOnChange(
      this.id$,
      id => this.fetchAuthorData(id),
      null,
      true,
    );
  }

  updateAuthor(data: AuthorCreate): Observable<boolean> {
    return this.http.put("/author/", data).pipe(map(() => true));
  }

  deleteAuthor(): Observable<boolean> {
    return this.http.delete("/author/").pipe(map(() => true));
  }

  protected fetchAuthorData(id: NonNullable<User["sub"]>) {
    return this.http.get<Author>(`/author/${id}`);
  }

}
