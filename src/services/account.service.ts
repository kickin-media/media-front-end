import { Injectable } from '@angular/core';
import { AuthService } from "@auth0/auth0-angular";
import { map, Observable, shareReplay, startWith } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  readonly scopes$: Observable<string[]>;
  readonly user$: AuthService["user$"];

  constructor(
    protected auth: AuthService,
  ) {
    this.user$ = auth.user$;

    // Extract the scopes
    this.scopes$ = auth.getAccessTokenSilently({detailedResponse: true}).pipe(
      map(res => res.scope),
      map(scope => scope ? scope.split(" ") : []),
      startWith([]),
      shareReplay(1),
    );
  }

  hasPermissions(...permissions: string[]): Observable<boolean> {
    return this.scopes$.pipe(map(scopes => !permissions.some(permission => scopes.indexOf(permission) < 0)));
  }

  login() {
    this.auth.loginWithRedirect();
  }

  logout() {
    this.auth.logout({ openUrl: false });
  }

}
