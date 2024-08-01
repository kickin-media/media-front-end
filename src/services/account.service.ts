import { Injectable } from '@angular/core';
import { AuthService } from "@auth0/auth0-angular";

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  readonly user$: AuthService["user$"];

  constructor(
    protected auth: AuthService,
  ) {
    this.user$ = auth.user$
  }

  login() {
    this.auth.loginWithRedirect();
  }

  logout() {
    this.auth.logout({ openUrl: false });
  }

}
