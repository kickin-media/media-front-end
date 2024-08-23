import { Component, Input, OnChanges, signal, SimpleChanges } from '@angular/core';
import { MatIcon } from "@angular/material/icon";
import { MatIconButton } from "@angular/material/button";
import { MatTooltip } from "@angular/material/tooltip";
import { MatMenu, MatMenuItem, MatMenuTrigger } from "@angular/material/menu";
import { MatDivider } from "@angular/material/divider";
import { Album, AlbumDetailed, Photo, PhotoDetailed } from "../../../../util/types";
import { AsyncPipe, NgIf } from "@angular/common";
import { User } from "@auth0/auth0-angular";
import { combineLatest, filter, map, Observable, startWith, switchMap } from "rxjs";
import { AccountService } from "../../../../services/account.service";
import { toObservable } from "@angular/core/rxjs-interop";
import { PhotoService } from "../../../../services/api/photo.service";
import { AlbumService } from "../../../../services/api/album.service";
import {
  ConfirmationDialogComponent,
  ConfirmationDialogProps
} from "../../../components/confirmation-dialog/confirmation-dialog.component";
import { MatDialog } from "@angular/material/dialog";

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
    protected dialog: MatDialog,
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

    const photo = this.photo;
    if (!photo || !(photo as any).albums) return;

    const currentAlbum = this.album;
    if (!currentAlbum) return;

    let albums: Album[] = (photo as any).albums;
    albums = albums.filter(album => album.id !== currentAlbum.id);

    const dialogRef = this.dialog.open(
      ConfirmationDialogComponent,
      {
        data: {
          title: "Are you sure you want to remove this photo from the album?",
          buttonClass: "error-button",
          buttonNames: ["CANCEL", "DELETE"],
        } as ConfirmationDialogProps
      },
    );

    (dialogRef.afterClosed() as Observable<boolean>).pipe(
      filter(result => result),
      switchMap(() => {
        return this.photoService.setPhotoAlbums(
          photo.id,
          albums.map(album => album.id)
        );
      }),
    ).subscribe(() => {
      this.albumService.album.refresh();
      this.closeViewer();
    });
  }

  deletePhoto() {
    if (!this.closeViewer) return;

    const photo = this.photo;
    if (!photo) return;

    const dialogRef = this.dialog.open(
      ConfirmationDialogComponent,
      {
        data: {
          title: "Are you sure you want to permanently delete this photo?",
          detail: "This will also remove this photo from any other albums it is in.",
          buttonClass: "error-button",
          buttonNames: ["CANCEL", "DELETE"],
        } as ConfirmationDialogProps
      },
    );

    (dialogRef.afterClosed() as Observable<boolean>).pipe(
      filter(result => result),
      switchMap(() => this.photoService.delete(photo.id)),
    ).subscribe(() => {
      this.albumService.album.refresh();
      this.closeViewer();
    });
  }

  get isInMultipleAlbums(): boolean | null {
    if (!this.album) return null;
    if (!this.photo) return null;
    if (!("albums" in this.photo)) return null;

    const albums: Album[] = (this.photo as any).albums;
    return albums.length > 0;
  }

}
