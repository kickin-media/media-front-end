import { Component, Inject, OnInit, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { APP_CONFIG, Config } from "../config";
import { ConfigService } from "../services/config.service";
import { AsyncPipe, NgForOf, NgIf, NgOptimizedImage } from "@angular/common";
import { AccountService } from "../services/account.service";
import { AuthService } from "@auth0/auth0-angular";
import { MatDialog } from "@angular/material/dialog";
import { window } from "rxjs";
import { CookiesDialogComponent } from "../components/cookies-dialog/cookies-dialog.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,

    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    NgOptimizedImage,
    RouterLink,
    NgForOf,
    NgIf,
    AsyncPipe,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  protected readonly menuLinks = [
    { title: "Home", url: "/", icon: "home" },
    { title: "Events", url: "/event", icon: "home" },
  ];

  protected readonly menu = signal(false);

  constructor(
    protected dialog: MatDialog,
    protected account: AccountService,
    protected config: ConfigService,
  ) {
  }

  ngOnInit(): void {
    // Delay the cookies dialog by 0ms to display it on top of the lightbox of
    // the album page
    setTimeout(() => this.openCookiesDialog(), 0);
  }

  protected openCookiesDialog(): void {
    const cookies = localStorage.getItem("cookie-dialog");
    if (!cookies) {
      const dialogRef = this.dialog.open(
        CookiesDialogComponent,
        { closeOnNavigation: false, disableClose: true },
      );
      dialogRef.afterClosed().subscribe(() => {
        localStorage.setItem("cookie-dialog", "true");
      });
    }
  }

  protected logout() {
    this.account.logout();
    location.reload();
  }

}
