import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ConfigService } from '../services/config.service';
import { AsyncPipe } from '@angular/common';
import { AccountService } from '../services/account.service';
import { MatDialog } from '@angular/material/dialog';
import { CookiesDialogComponent } from '../components/cookies-dialog/cookies-dialog.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatButtonModule, MatIconModule, MatToolbarModule, RouterLink, AsyncPipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  protected dialog = inject(MatDialog);
  protected account = inject(AccountService);
  protected config = inject(ConfigService);

  protected readonly menuLinks = [
    { title: 'Home', url: '/', icon: 'home' },
    { title: 'Events', url: '/event', icon: 'home' },
  ];

  protected readonly menu = signal(false);

  ngOnInit(): void {
    // Delay the cookies dialog by 0ms to display it on top of the lightbox of
    // the album page
    setTimeout(() => this.openCookiesDialog(), 0);
  }

  protected openCookiesDialog(): void {
    const cookies = localStorage.getItem('cookie-dialog');
    if (!cookies) {
      const dialogRef = this.dialog.open(CookiesDialogComponent, { closeOnNavigation: false, disableClose: true });
      dialogRef.afterClosed().subscribe(() => {
        localStorage.setItem('cookie-dialog', 'true');
      });
    }
  }

  protected logout() {
    this.account.logout();
    location.reload();
  }
}
