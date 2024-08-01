import { Component, Inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { APP_CONFIG, Config } from "../config";
import { ConfigService } from "../services/config.service";
import { AsyncPipe, NgForOf, NgIf, NgOptimizedImage } from "@angular/common";
import { AccountService } from "../services/account.service";
import { AuthService } from "@auth0/auth0-angular";

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
export class AppComponent {

  protected readonly menuLinks = [
    { title: "Home", url: "/", icon: "home" },
    { title: "Events", url: "/event", icon: "home" },
  ];

  protected readonly menu = signal(false);

  constructor(
    protected account: AccountService,
    protected config: ConfigService,
  ) {
  }

}
