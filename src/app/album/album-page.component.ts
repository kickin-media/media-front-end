import { Component, signal, inject, effect } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Breadcrumb, TitleSectionComponent } from '../../components/title-section/title-section.component';
import { AlbumService } from '../../services/api/album.service';
import { combineLatest, filter, first, map, Observable, of, pairwise, shareReplay, startWith, switchMap } from 'rxjs';
import { AlbumDialogComponent, AlbumDialogProps } from './components/album-dialog/album-dialog.component';
import { Album, AlbumDetailed, Photo } from '../../util/types';
import { MatDialog } from '@angular/material/dialog';
import { AlbumGalleryComponent } from './components/album-gallery/album-gallery.component';
import slugify from 'slugify';
import { LightboxComponent } from '../lightbox/lightbox.component';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '../../services/account.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  ConfirmationDialogComponent,
  ConfirmationDialogProps,
} from '../../components/confirmation-dialog/confirmation-dialog.component';
import { ShareService } from '../../services/share.service';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ButtonGroupComponent } from '../../components/button-group/button-group.component';
import { PhotoService } from '../../services/api/photo.service';
import { AlbumSelectionDialogComponent } from './components/album-selection-dialog/album-selection-dialog.component';
import { UploadDialogComponent } from '../upload/upload.component';
import { toObservable } from '@angular/core/rxjs-interop';
import { MatDividerModule } from '@angular/material/divider';
import { SkeletonComponent } from '../../components/skeleton/skeleton.component';
import { AlbumStore } from '../../shared/stores/album.store';
import { SelectedPhotosStore } from './stores/selected-photos.store';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-album-page',
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatDividerModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    AlbumGalleryComponent,
    ButtonGroupComponent,
    TitleSectionComponent,
    SkeletonComponent,
  ],
  templateUrl: './album-page.component.html',
  styleUrl: './album-page.component.scss',
})
export class AlbumPageComponent {
  protected router = inject(Router);
  protected dialog = inject(MatDialog);
  protected overlay = inject(Overlay);
  protected accountService = inject(AccountService);
  protected albumService = inject(AlbumService);
  protected photoService = inject(PhotoService);
  protected shareService = inject(ShareService);

  protected albumStore = inject(AlbumStore);
  protected selectedPhotosStore = inject(SelectedPhotosStore);

  protected photoSortField = new FormControl<'taken' | 'upload'>('taken');
  protected isReprocessing = signal(false);

  protected breadcrumb$: Observable<Breadcrumb[] | undefined>;
  protected photos$: Observable<Photo[] | null>;

  constructor() {
    effect(() => {
      const album = this.albumStore.album();
      console.log(album);
    });

    const activatedRoute = inject(ActivatedRoute);
    const accountService = this.accountService;
    const albumService = this.albumService;

    this.breadcrumb$ = this.albumService.album.data$.pipe(
      map(album => {
        return [
          { title: 'Events', url: '/event' },
          {
            title: album?.event.name,
            url: album ? `/event/${album.event_id}/${slugify(album.event.name)}` : undefined,
          },
          {
            title: album?.name,
            url: album ? `/album/${album.id}/${slugify(album.name)}` : undefined,
          },
        ];
      })
    );

    // Extract photos from album
    let photos$ = albumService.album.data$.pipe(map(album => (album ? album.photos : null)));

    // Filter photo's by author ID if in select mode
    photos$ = combineLatest([
      photos$,
      toObservable(this.selectedPhotosStore.selectionMode).pipe(startWith(false)),
      toObservable(this.selectedPhotosStore.selected).pipe(startWith(null)),
      accountService.user$,
      accountService.canManageOther$,
    ]).pipe(
      map(([photos, selectMode, _, user, canManageOther]) => {
        if (photos === null) return null;
        if (!selectMode) return photos;

        // Check permissions to return the correct set of photos in selection mode
        if (!user) return photos;
        if (canManageOther) return photos;

        // Otherwise, only return the subset of photos created by the current user
        const userId = user.sub;
        return photos.filter(photo => photo.author.id === userId);
      })
    );

    // Sort the photos by the preferred sorting method...
    this.photos$ = combineLatest([photos$, this.photoSortField.valueChanges.pipe(startWith(null))]).pipe(
      map(([photos, sort]) => {
        if (photos === null) return null;

        const field = sort === 'upload' ? 'uploaded_at' : 'timestamp';
        return photos.sort((a, b) => {
          // Ensure the selected field is defined
          if (!a[field]) return -1;
          if (!b[field]) return 1;

          // Convert to date objects
          const aa = new Date(a[field]);
          const bb = new Date(b[field]);

          // Sort newest to oldest for "upload"-sort, but oldest to newest for "taken"-sort
          if (sort === 'upload') return bb.getTime() - aa.getTime();
          else return aa.getTime() - bb.getTime();
        });
      }),
      shareReplay(1)
    );

    // Open lightbox whenever the `lightbox` query param appears in the URL
    activatedRoute.queryParamMap
      .pipe(
        map(params => params.get('lightbox') ?? null),
        startWith(null),
        pairwise()
      )
      .subscribe(([prev, next]) => {
        if (next && !prev) this.openLightbox(next);
      });
  }

  editAlbum() {
    this.albumService.album.data$
      .pipe(
        filter(album => album !== null),
        first(),
        switchMap(album => {
          if (!album) return of(null);

          const dialogRef = this.dialog.open(AlbumDialogComponent, { data: { album } as AlbumDialogProps });
          return dialogRef.afterClosed() as Observable<AlbumDetailed | null>;
        })
      )
      .subscribe(album => {
        if (!album) return;
        this.albumService.album.refresh();
      });
  }

  deleteAlbum() {
    const album$ = this.albumService.album.data$.pipe(
      filter(album => album !== null),
      first(),
      shareReplay(1)
    );

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Are you sure you want to delete this album?',
        detail: 'This action is irreversible and the photos in this album may be deleted.',
        buttonClass: 'error-button',
        buttonNames: ['CANCEL', 'DELETE'],
      } as ConfirmationDialogProps,
    });

    (dialogRef.afterClosed() as Observable<boolean>)
      .pipe(
        filter(result => result),
        switchMap(() => album$),
        switchMap(album => this.albumService.empty(album.id)),
        switchMap(() => album$),
        switchMap(album => this.albumService.delete(album.id)),
        switchMap(() => album$)
      )
      .subscribe(album => {
        if (!album) return;
        this.router.navigate([`/event/${album.event_id}/${slugify(album.event.name)}`]);
      });
  }

  uploadPhotos() {
    const dialogRef = this.dialog.open(UploadDialogComponent);
    dialogRef.afterClosed().subscribe(() => {
      this.albumService.album.refresh();
    });
  }

  openLightbox(photoId: string): void {
    const overlayRef = this.overlay.create({
      hasBackdrop: true,
      scrollStrategy: this.overlay.scrollStrategies.block(),
      minHeight: '100%',
      minWidth: '100%',
    });
    const componentRef = overlayRef.attach(new ComponentPortal(LightboxComponent));
    const close = () => {
      // Navigate to the current URL to reset the lightbox query param
      this.router.navigate([], { queryParams: { lightbox: null }, queryParamsHandling: 'merge' });

      // Cleanup the overlay
      overlayRef.detach();
      overlayRef.dispose();
      componentRef.destroy();
    };

    // Initialize the lightbox
    componentRef.instance.onOpen(close, photoId, this.photos$);
  }

  selectAll() {
    this.photos$.pipe(first()).subscribe(photos => {
      if (photos === null) return;

      const photoIds = photos.map(photo => photo.id);
      this.selectedPhotosStore.selectAll(photoIds);
    });
  }

  addSelectedToOther() {
    if (!this.selectedPhotosStore.selectionMode()) return;

    const dialogRef = this.dialog.open(AlbumSelectionDialogComponent);
    const onClose = dialogRef.afterClosed() as Observable<Album | null>;
    onClose.subscribe(album => {
      if (!album) return;
      this.selectedPhotosStore.addToOtherAlbum(album);
    });
  }

  reprocessSelected() {
    if (!this.selectedPhotosStore.selectionMode()) return;

    const selectCount = this.selectedPhotosStore.selected().length;
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: `Are you sure you want to re-process ${selectCount} photos?`,
        detail: 'Re-processing photos will only update the watermarks and may take a long time.',
      } as ConfirmationDialogProps,
    });

    const onClose = dialogRef.afterClosed() as Observable<boolean>;
    onClose.subscribe(confirmed => {
      if (!confirmed) return;
      this.selectedPhotosStore.reprocess(null);
    });
  }

  removeSelected() {
    if (!this.selectedPhotosStore.selectionMode()) return;

    const selectCount = this.selectedPhotosStore.selected().length;
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: `Are you sure you want to REMOVE ${selectCount} photos FROM this album?`,
        detail:
          'These photos will only be removed from this album. They will stay in the other albums they are in. If any photos are left without albums, they are PERMANENTLY DELETED. This action is not reversible.',
      } as ConfirmationDialogProps,
    });

    const onClose = dialogRef.afterClosed() as Observable<boolean>;
    onClose.subscribe(confirmed => {
      if (!confirmed) return;

      const album = this.albumStore.album();
      if (!album) return;

      this.selectedPhotosStore.removeFromAlbum(album);
    });
  }

  deleteSelected() {
    if (!this.selectedPhotosStore.selectionMode()) return;

    const selectCount = this.selectedPhotosStore.selected().length;
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: `Are you sure you want to permanently delete ${selectCount} photos?`,
        detail: 'These photos will be deleted from ALL albums they are in. This action is not reversible.',
      } as ConfirmationDialogProps,
    });

    const onClose = dialogRef.afterClosed() as Observable<boolean>;
    onClose.subscribe(confirmed => {
      if (!confirmed) return;
      this.selectedPhotosStore.deletePermanently(null);
    });
  }
}
