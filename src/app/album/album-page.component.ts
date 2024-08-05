import { Component } from '@angular/core';
import { AsyncPipe } from "@angular/common";
import { MatButton, MatIconButton } from "@angular/material/button";
import { MatIcon } from "@angular/material/icon";
import { MatMenu, MatMenuItem, MatMenuTrigger } from "@angular/material/menu";
import { SlugPipe } from "../../util/slug.pipe";
import { Breadcrumb, TitleSectionComponent } from "../components/title-section/title-section.component";
import { AlbumService } from "../../services/api/album.service";
import { filter, first, map, Observable, of, pairwise, startWith, switchMap } from "rxjs";
import { AlbumDialogComponent, AlbumDialogProps } from "./components/album-dialog/album-dialog.component";
import { AlbumDetailed, Photo } from "../../util/types";
import { MatDialog } from "@angular/material/dialog";
import { AlbumGalleryComponent } from "./components/album-gallery/album-gallery.component";
import slugify from "slugify";
import { LightboxComponent } from "../lightbox/lightbox.component";
import { Overlay } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import { ActivatedRoute, Router } from "@angular/router";

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
    AlbumGalleryComponent,
    LightboxComponent
  ],
  templateUrl: './album-page.component.html',
  styleUrl: './album-page.component.scss'
})
export class AlbumPageComponent {

  protected breadcrumb$: Observable<Breadcrumb[] | undefined>;
  protected photos$: Observable<Photo[] | null>;

  constructor(
    activatedRoute: ActivatedRoute,
    protected router: Router,
    protected dialog: MatDialog,
    protected overlay: Overlay,
    protected albumService: AlbumService,
  ) {
    this.breadcrumb$ = this.albumService.album.data$.pipe(
      map(album => {
        return [
          { title: 'Events', url: '/event' },
          {
            title: album?.event.name,
            url: album ? `/event/${album.event_id}/${slugify(album.event.name)}` : undefined
          },
          {
            title: album?.name,
            url: album ? `/album/${album.id}/${slugify(album.name)}` : undefined,
          },
        ];
      }),
    );

    this.photos$ = albumService.album.data$.pipe(
      map(album => album ? album.photos : null),
    );

    // Open lightbox whenever the `lightbox` query param appears in the URL
    activatedRoute.queryParamMap.pipe(
      map(params => params.get("lightbox")),
      startWith(null),
      pairwise(),
    ).subscribe(([prev, next]) => {
      if (next && !prev) this.openLightbox(next);
    });
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

  openLightbox(photoId: string): void {
    const overlayRef = this.overlay.create({
      hasBackdrop: true,
      scrollStrategy: this.overlay.scrollStrategies.block(),
      minHeight: "100%",
      minWidth: "100%",
    });
    const componentRef = overlayRef.attach(new ComponentPortal(LightboxComponent));
    const close = () => {
      // Navigate to the current URL to reset the lightbox query param
      this.router.navigate([]);

      // Cleanup the overlay
      overlayRef.detach();
      overlayRef.dispose();
      componentRef.destroy();
    };

    // Initialize the lightbox
    componentRef.instance.onOpen(close, photoId, this.photos$);
  }

}
