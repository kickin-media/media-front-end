import { Component } from '@angular/core';
import { AsyncPipe } from "@angular/common";
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { MatMenu, MatMenuItem, MatMenuTrigger } from "@angular/material/menu";
import { SlugPipe } from "../../util/slug.pipe";
import { TitleSectionComponent } from "../components/title-section/title-section.component";
import { AlbumService } from "../../services/api/album.service";
import { filter, first, map, Observable, of, switchMap } from "rxjs";
import { AlbumDialogComponent, AlbumDialogProps } from "./components/album-dialog/album-dialog.component";
import { AlbumDetailed, Photo } from "../../util/types";
import { MatDialog } from "@angular/material/dialog";
import { AlbumGalleryComponent } from "./components/album-gallery/album-gallery.component";

@Component({
  selector: 'album-page',
  standalone: true,
  imports: [
    AsyncPipe,
    MatButton,
    MatIcon,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    SlugPipe,
    TitleSectionComponent,
    MatMenuTrigger,
    AlbumGalleryComponent
  ],
  templateUrl: './album-page.component.html',
  styleUrl: './album-page.component.scss'
})
export class AlbumPageComponent {

  protected photos$: Observable<Photo[] | null>;

  constructor(
    protected dialog: MatDialog,
    protected albumService: AlbumService,
  ) {
    this.photos$ = albumService.album.data$.pipe(
      map(album => album ? album.photos : null),
    );
  }

  editAlbum() {
    this.albumService.album.data$.pipe(
      filter(album => album !== null),
      first(),
      switchMap(album => {
        if (!album) return of(null);

        const dialogRef = this.dialog.open(
          AlbumDialogComponent,
          { data: { album } as AlbumDialogProps }
        );
        return dialogRef.afterClosed() as Observable<AlbumDetailed | null>;
      }),
    ).subscribe(album => {
      if (!album) return;
      this.albumService.album.refresh();
    });
  }

  emptyAlbum() {

  }

  deleteAlbum() {

  }

}
