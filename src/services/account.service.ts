import { Injectable } from '@angular/core';
import { AuthService } from "@auth0/auth0-angular";
import { catchError, first, map, Observable, of, shareReplay, switchMap } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { BaseService } from "./base.service";

@Injectable({
  providedIn: 'root'
})
export class AccountService extends BaseService {

  readonly scopes$: Observable<string[]>;
  readonly user$: AuthService["user$"];

  readonly canDownloadOther$: Observable<boolean>;
  readonly canManageAlbums$: Observable<boolean>;
  readonly canManageEvents$: Observable<boolean>;
  readonly canManageOther$: Observable<boolean>;
  readonly canUpload$: Observable<boolean>;

  constructor(
    router: Router,
    activatedRoute: ActivatedRoute,
    protected auth: AuthService,
  ) {
    super(router, activatedRoute);

    this.user$ = auth.user$.pipe(catchError(() => of(null)));

    // Extract the scopes
    this.scopes$ = auth.isAuthenticated$.pipe(
      switchMap(authenticated => {
        if (!authenticated) return of([]);
        return auth.getAccessTokenSilently({ detailedResponse: true }).pipe(
          map(res => res.scope),
          map(scope => scope ? scope.split(" ") : []),
          // Logout if the session is invalid
          catchError(() => auth.logout({ openUrl: false }).pipe(map(() => []))),
        );
      }),
      shareReplay(1),
    );

    // Populate permission observables
    this.canDownloadOther$ = this.hasPermissions("photos:download_other");
    this.canManageAlbums$ = this.hasPermissions("albums:manage");
    this.canManageEvents$ = this.hasPermissions("events:manage");
    this.canManageOther$ = this.hasPermissions("photos:manage_other");
    this.canUpload$ = this.hasPermissions("photos:upload");
  }

  hasPermissions(...permissions: string[]): Observable<boolean> {
    return this.scopes$.pipe(
      map(scopes => !permissions.some(permission => scopes.indexOf(permission) < 0)),
    );
  }

  login() {
    this.route$.pipe(first()).subscribe(route => {
      this.auth.loginWithRedirect({appState: { target: `/${route.url.join("/")}` }});
    });
  }

  logout() {
    this.auth.logout({ openUrl: false });
  }

}
