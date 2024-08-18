import { Component, Input, OnChanges, signal, SimpleChanges } from '@angular/core';
import { MatIcon } from "@angular/material/icon";
import { MatIconButton } from "@angular/material/button";
import { MatTooltip } from "@angular/material/tooltip";
import { MatDivider } from "@angular/material/divider";
import { MatMenu, MatMenuItem, MatMenuTrigger } from "@angular/material/menu";
import { MatListItemLine } from "@angular/material/list";
import { DownloadService } from "../../../../services/download.service";
import { AsyncPipe, NgIf } from "@angular/common";
import { Album, AlbumDetailed, Photo, PhotoDetailed } from "../../../../util/types";
import slugify from "slugify";
import { AccountService } from "../../../../services/account.service";
import { combineLatest, map, Observable, startWith } from "rxjs";
import { User } from "@auth0/auth0-angular";
import { toObservable } from "@angular/core/rxjs-interop";

@Component({
  selector: 'lightbox-download-menu',
  standalone: true,
  imports: [
    MatIcon,
    MatIconButton,
    MatTooltip,
    MatDivider,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatListItemLine,
    AsyncPipe,
    NgIf
  ],
  templateUrl: './lightbox-download-menu.component.html',
  styleUrl: './lightbox-download-menu.component.scss'
})
export class LightboxDownloadMenuComponent implements OnChanges {

  @Input() photo!: Photo | PhotoDetailed | null;
  @Input() album!: Album | AlbumDetailed | null;

  private photoAuthor$ = signal<NonNullable<User["sub"]> | null>(null);
  protected canDownload$: Observable<boolean>;

  constructor(
    protected accountService: AccountService,
    protected downloadService: DownloadService,
  ) {
    const isOwnPhoto$: Observable<boolean> = combineLatest([
      toObservable(this.photoAuthor$).pipe(startWith(null)),
      accountService.user$,
    ]).pipe(
      map(([author, user]) => user ? user.sub === author : false),
    );

    this.canDownload$ = combineLatest([
      accountService.canDownloadOther$,
      isOwnPhoto$,
    ]).pipe(
      map(checks => checks.some((check: boolean) => check)),
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["photo"]) {
      const photo: typeof this.photo = changes["photo"].currentValue;
      if (photo) this.photoAuthor$.set(photo.author.id ?? null);
      else this.photoAuthor$.set(null);
    }
  }

  get filename(): string {
    let res = "";
    if (this.album) {
      res += slugify(this.album.name);
    }

    if (this.photo) {
      if (res) res += "--";
      res += slugify(this.photo.id);
    }

    return res;
  }
}
