import { Component, inject, input, signal } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatDivider } from '@angular/material/divider';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { DownloadService } from '../../../../services/download.service';
import { AsyncPipe } from '@angular/common';
import { Album, AlbumDetailed, Photo, PhotoDetailed } from '../../../../util/types';
import slugify from 'slugify';
import { AccountService } from '../../../../services/account.service';
import { combineLatest, map, Observable, startWith } from 'rxjs';
import { User } from '@auth0/auth0-angular';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-lightbox-download-menu',
  imports: [MatIcon, MatIconButton, MatTooltip, MatDivider, MatMenu, MatMenuItem, MatMenuTrigger, AsyncPipe],
  templateUrl: './lightbox-download-menu.component.html',
  styleUrl: './lightbox-download-menu.component.scss',
})
export class LightboxDownloadMenuComponent {
  protected accountService = inject(AccountService);
  protected downloadService = inject(DownloadService);

  readonly photo = input.required<Photo | PhotoDetailed | null>();
  readonly album = input.required<Album | AlbumDetailed | null>();

  private photoAuthor$ = signal<NonNullable<User['sub']> | null>(null);
  protected canDownload$: Observable<boolean>;

  constructor() {
    const accountService = this.accountService;

    const isOwnPhoto$: Observable<boolean> = combineLatest([
      toObservable(this.photoAuthor$).pipe(startWith(null)),
      accountService.user$,
    ]).pipe(map(([author, user]) => (user ? user.sub === author : false)));

    this.canDownload$ = combineLatest([accountService.canDownloadOther$, isOwnPhoto$]).pipe(
      map(checks => checks.some((check: boolean) => check))
    );
  }

  get filename(): string {
    let res = '';
    const album = this.album();
    if (album) {
      res += slugify(album.name);
    }

    const photo = this.photo();
    if (photo) {
      if (res) res += '--';
      res += slugify(photo.id);
    }

    return res;
  }
}
