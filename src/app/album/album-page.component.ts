import { Component } from '@angular/core';
import { AsyncPipe, NgIf } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { Breadcrumb, TitleSectionComponent } from "../../components/title-section/title-section.component";
import { AlbumService } from "../../services/api/album.service";
import {
  combineLatest,
  concatAll,
  EMPTY,
  expand,
  filter,
  first,
  map,
  Observable,
  of,
  pairwise,
  shareReplay,
  startWith,
  switchMap
} from "rxjs";
import { AlbumDialogComponent, AlbumDialogProps } from "./components/album-dialog/album-dialog.component";
import { Album, AlbumDetailed, Photo } from "../../util/types";
import { MatDialog } from "@angular/material/dialog";
import { AlbumGalleryComponent } from "./components/album-gallery/album-gallery.component";
import slugify from "slugify";
import { LightboxComponent } from "../lightbox/lightbox.component";
import { Overlay } from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";
import { ActivatedRoute, Router } from "@angular/router";
import { AccountService } from "../../services/account.service";
import { MatTooltipModule } from "@angular/material/tooltip";
import {
  ConfirmationDialogComponent,
  ConfirmationDialogProps
} from "../../components/confirmation-dialog/confirmation-dialog.component";
import { ShareService } from "../../services/share.service";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { SelectionModel } from "@angular/cdk/collections";
import { ButtonGroupComponent } from "../../components/button-group/button-group.component";
import { PhotoService } from "../../services/api/photo.service";
import { AlbumSelectionDialogComponent } from "./components/album-selection-dialog/album-selection-dialog.component";
import { UploadDialog } from "../upload/upload.component";

@Component({
  selector: 'album-page',
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    ReactiveFormsModule,

    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,

    AlbumGalleryComponent,
    ButtonGroupComponent,
    TitleSectionComponent,
  ],
  templateUrl: './album-page.component.html',
  styleUrl: './album-page.component.scss'
})
export class AlbumPageComponent {

  protected photoSortField = new FormControl<"taken" | "upload">("taken");
  protected selected: null | SelectionModel<Photo["id"]> = null;

  protected breadcrumb$: Observable<Breadcrumb[] | undefined>;
  protected photos$: Observable<Photo[] | null>;

  constructor(
    activatedRoute: ActivatedRoute,
    protected router: Router,
    protected dialog: MatDialog,
    protected overlay: Overlay,
    protected accountService: AccountService,
    protected albumService: AlbumService,
    protected photoService: PhotoService,
    protected shareService: ShareService,
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

    // Extract photos from album
    let photos$ = albumService.album.data$.pipe(
      map(album => album ? album.photos : null),
    );

    // Filter photo's by author ID if in select mode
    photos$ = combineLatest([
      photos$,
      accountService.user$,
      accountService.canManageOther$,
    ]).pipe(
      map(([photos, user, canManageOther]) => {
        if (photos === null) return null;
        if (this.selected !== null) return photos;

        // Check permissions to return the correct set of photos in selection mode
        if (!user) return photos;
        if (canManageOther) return photos;

        // Otherwise, only return the subset of photos created by the current user
        const userId = user.sub;
        return photos.filter(photo => photo.author.id === userId);
      }),
    );

    // Sort the photos by the preferred sorting method...
    this.photos$ = combineLatest([
      photos$,
      this.photoSortField.valueChanges.pipe(startWith(null)),
    ]).pipe(
      map(([photos, sort]) => {
        if (photos === null) return null;

        const field = sort === "upload" ? "uploaded_at" : "timestamp";
        return photos.sort((a, b) => {
          // Ensure the selected field is defined
          if (!a[field]) return -1;
          if (!b[field]) return 1;

          // Convert to date objects
          const aa = new Date(a[field]);
          const bb = new Date(b[field]);

          // Sort newest to oldest for "upload"-sort, but oldest to newest for "taken"-sort
          if (sort === "upload") return bb.getTime() - aa.getTime();
          else return aa.getTime() - bb.getTime();
        });
      }),
      shareReplay(1),
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

  deleteAlbum() {
    const album$ = this.albumService.album.data$.pipe(
      filter(album => album !== null),
      first(),
      shareReplay(1),
    );

    const dialogRef = this.dialog.open(
      ConfirmationDialogComponent,
      {
        data: {
          title: "Are you sure you want to delete this album?",
          detail: "This action is irreversible and the photos in this album may be deleted.",
          buttonClass: "error-button",
          buttonNames: ["CANCEL", "DELETE"],
        } as ConfirmationDialogProps
      },
    );

    (dialogRef.afterClosed() as Observable<boolean>).pipe(
      filter(result => result),
      switchMap(() => album$),
      switchMap(album => this.albumService.empty(album.id)),
      switchMap(() => album$),
      switchMap(album => this.albumService.delete(album.id)),
      switchMap(() => album$),
    ).subscribe(album => {
      if (!album) return;
      this.router.navigate([`/event/${album.event_id}/${slugify(album.event.name)}`]);
    });
  }

  uploadPhotos() {
    const dialogRef = this.dialog.open(UploadDialog);
    dialogRef.afterClosed().subscribe(() => {
      this.albumService.album.refresh();
    });
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

  selectMode(start: boolean) {
    this.selected = start ? new SelectionModel(true) : null;
  }

  selectAll() {
    this.photos$.pipe(first()).subscribe(photos => {
      if (photos === null) return;
      if (this.selected === null) return;

      this.selected.setSelection(...photos.map(photo => photo.id));
    });
  }

  addSelectedToOther() {
    const selected = this.selected;
    if (selected === null) return;

    const dialogRef = this.dialog.open(AlbumSelectionDialogComponent);
    const onClose = dialogRef.afterClosed() as Observable<Album | null>;

    combineLatest([
      onClose,
      this.photos$,
    ]).pipe(
      // Filter invalid states
      filter(([album, photos]) => album !== null && photos !== null),
      map(input => input as [Album, Photo[]]),

      // Only listen for the first (valid) trigger
      first(),

      // Filter only the selected photos
      map(([album, photos]) => [album, photos.filter(photo => selected.isSelected(photo.id))] as [Album, Photo[]]),

      // Trigger an "event" per selected photo
      map(([album, photos]) => [null, album, photos] as [null, Album, Photo[]]),
      expand(([_, album, photos]) => {
        if (photos.length === 0) return EMPTY;
        return of([photos[0], album, photos.slice(1)] as [Photo, Album, Photo[]]);
      }),
      filter(([photo, _1, _2]) => photo !== null),
      map(([photo, album, _]) => [photo, album] as [Photo, Album]),

      // And trigger re-processing per photo
      map(([photo, album]) => {
        return this.photoService.fetchPhoto(photo.id).pipe(
          switchMap(photo => this.photoService.setPhotoAlbums(
            photo.id,
            [...photo.albums.map(album => album.id), album.id]
          )),
        );
      }),
      concatAll(),
    ).subscribe();
  }

  reprocessSelected() {
    const selected = this.selected;
    if (selected === null) return;

    const selectCount = selected.selected.length;
    const dialogRef = this.dialog.open(
      ConfirmationDialogComponent,
      {
        data: {
          title: `Are you sure you want to re-process ${selectCount} photos?`,
          detail: "Re-processing photos will only update the watermarks and may take a long time.",
        } as ConfirmationDialogProps
      },
    );

    const onClose = dialogRef.afterClosed() as Observable<boolean>;
    combineLatest([
      onClose,
      this.photos$,
    ]).pipe(
      // Filter invalid states
      filter(([confirmed, photos]) => confirmed && photos !== null),
      map(([_, photos]) => photos as Photo[]),

      // Only listen for the first (valid) trigger
      first(),

      // Filter only the selected photos
      map(photos => photos.filter(photo => selected.isSelected(photo.id))),

      // Trigger an "event" per selected photo
      map(photos => [null, photos] as [null, Photo[]]),
      expand(([_, photos]) => {
        if (photos.length === 0) return EMPTY;
        return of([photos[0], photos.slice(1)] as [Photo, Photo[]]);
      }),
      filter(([photo, _]) => photo !== null),
      map(([photo, _]) => photo),

      // And trigger re-processing per photo
      map(photo => this.photoService.reprocess(photo.id)),
      concatAll(),
    ).subscribe();
  }

}
