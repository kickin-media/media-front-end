import { Component, Input, OnChanges, signal, SimpleChanges } from '@angular/core';
import { MatIcon } from "@angular/material/icon";
import { MatIconButton } from "@angular/material/button";
import { MatTooltip } from "@angular/material/tooltip";
import { MatMenu, MatMenuItem, MatMenuTrigger } from "@angular/material/menu";
import { MatDivider } from "@angular/material/divider";
import { Album, AlbumDetailed, Photo, PhotoDetailed } from "../../../../util/types";
import { AsyncPipe, NgIf } from "@angular/common";
import { User } from "@auth0/auth0-angular";
import { combineLatest, map, Observable, startWith } from "rxjs";
import { AccountService } from "../../../../services/account.service";
import { toObservable } from "@angular/core/rxjs-interop";
import { PhotoService } from "../../../../services/api/photo.service";
import { AlbumService } from "../../../../services/api/album.service";

@Component({
  selector: 'lightbox-photo-options',
  standalone: true,
  imports: [
    MatIcon,
    MatIconButton,
    MatTooltip,
    MatMenu,
    MatMenuItem,
    MatDivider,
    MatMenuTrigger,
    NgIf,
    AsyncPipe
  ],
  templateUrl: './lightbox-photo-options.component.html',
  styleUrl: './lightbox-photo-options.component.scss'
})
export class LightboxPhotoOptionsComponent implements OnChanges {

  @Input() photo!: Photo | PhotoDetailed | null;
  @Input() album!: Album | AlbumDetailed | null;
  @Input() closeViewer!: () => void | null;

  private photoAuthor$ = signal<NonNullable<User["sub"]> | null>(null);
  protected canDelete$: Observable<boolean>;

  constructor(
    protected accountService: AccountService,
    protected albumService: AlbumService,
    protected photoService: PhotoService,
  ) {
    const isOwnPhoto$: Observable<boolean> = combineLatest([
      toObservable(this.photoAuthor$).pipe(startWith(null)),
      accountService.user$,
    ]).pipe(
      map(([author, user]) => user ? user.sub === author : false),
    );

    this.canDelete$ = combineLatest([
      accountService.canManageOther$,
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

  removeFromAlbum() {
    if (!this.closeViewer) return;
    if (!this.photo || !(this.photo as any).albums) return;

    const currentAlbum = this.album;
    if (!currentAlbum) return;

    let albums: Album[] = (this.photo as any).albums;
    albums = albums.filter(album => album.id !== currentAlbum.id);
    this.photoService.setPhotoAlbums(this.photo.id, albums.map(album => album.id));
  }

  deletePhoto() {
    if (!this.closeViewer) return;
    if (!this.photo) return;

    this.photoService.delete(this.photo.id).subscribe(() => {
      this.albumService.album.refresh();
      this.closeViewer();
    });
  }

  get isInMultipleAlbums(): boolean | null {
    if (!this.album) return null;
    if (!("albums" in this.album)) return null;

    const albums: Album[] = (this.album as any).albums;
    return albums.length > 0;
  }

}
