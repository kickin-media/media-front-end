import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { removeAllEntities, upsertEntities, upsertEntity, withEntities } from '@ngrx/signals/entities';
import { AlbumStore } from '../../../shared/stores/album.store';
import { computed, effect, inject } from '@angular/core';
import { concatAll, EMPTY, expand, filter, map, of, pipe, switchMap } from 'rxjs';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { AlbumReadList } from '../../../shared/back-end';
import { PhotoService } from '../../../services/api/photo.service';

interface Item {
  id: string;
  selected: boolean;
}

interface SelectedPhotosState {
  selectionMode: boolean;
}

export const SelectedPhotosStore = signalStore(
  { providedIn: 'root' },
  // State consists of a set of selected photo IDs and whether selection mode is active
  withState<SelectedPhotosState>({ selectionMode: false }),
  withEntities<Item>(),
  // Shorthand to get the set of currently selected photos
  withComputed(store => ({
    selected: computed(() =>
      store
        .entities()
        .filter(item => item.selected)
        .map(item => item.id)
    ),
  })),
  withComputed(store => ({
    isSingle: computed(() => store.selected().length === 1),
    hasSelected: computed(() => store.selected().length > 0),
  })),
  // Selection management
  withMethods(store => ({
    clear(): void {
      patchState(store, removeAllEntities());
    },

    selectAll(photoIds: string[]): void {
      patchState(store, upsertEntities(photoIds.map(photoId => ({ id: photoId, selected: true }) as Item)));
    },

    set(id: string, selected: boolean): void {
      patchState(store, upsertEntity({ id, selected }));
    },

    setMode(state: boolean): void {
      patchState(store, { selectionMode: state });
      if (!state) patchState(store, removeAllEntities());
    },

    toggle(id: string): void {
      const currentState: Item | undefined = store.entityMap()[id];
      patchState(store, upsertEntity({ id, selected: currentState ? !currentState.selected : true }));
    },
  })),
  // Operations on selection
  withMethods((store, photoService = inject(PhotoService)) => ({
    addToOtherAlbum: rxMethod<AlbumReadList>(
      pipe(
        // Trigger an "event" per selected photo
        map(album => [null, album, store.selected()] as [null, AlbumReadList, string[]]),
        expand(([_, album, photos]) => {
          if (photos.length === 0) return EMPTY;
          return of([photos[0], album, photos.slice(1)] as [string, AlbumReadList, string[]]);
        }),
        filter(([photo, _1, _2]) => photo !== null),
        map(([photo, album, _]) => [photo, album] as [string, AlbumReadList]),

        // Then fetch and update the photo's albums
        map(([photoId, album]) => {
          return photoService
            .fetchPhoto(photoId)
            .pipe(
              switchMap(photo =>
                photoService.setPhotoAlbums(photo.id, [...photo.albums.map(album => album.id), album.id])
              )
            );
        }),
        concatAll()
      )
    ),

    reprocess: rxMethod<null>(
      pipe(
        // Trigger an "event" per selected photo
        map(() => [null, store.selected()] as [string | null, string[]]),
        expand(([_, photos]) => {
          if (photos.length === 0) return EMPTY;
          return of([photos[0], photos.slice(1)] as [string, string[]]);
        }),
        filter(([photo, _]) => photo !== null),
        map(([photo, _]) => photo as string),

        // And trigger re-processing per photo
        map(photoId => photoService.reprocess(photoId)),
        concatAll()
      )
    ),

    removeFromAlbum: rxMethod<AlbumReadList>(
      pipe(
        // Trigger an "event" per selected photo
        map(album => [null, album, store.selected()] as [null, AlbumReadList, string[]]),
        expand(([_, album, photos]) => {
          if (photos.length === 0) return EMPTY;
          return of([photos[0], album, photos.slice(1)] as [string, AlbumReadList, string[]]);
        }),
        filter(([photo, _1, _2]) => photo !== null),
        map(([photo, album, _]) => [photo, album] as [string, AlbumReadList]),

        // Then fetch and update the photo's albums
        map(([photoId, album]) => {
          const albumId = album.id;

          return photoService.fetchPhoto(photoId).pipe(
            switchMap(photo => {
              const newAlbumIds = photo.albums.filter(album => album.id != albumId).map(album => album.id);
              return photoService.setPhotoAlbums(photo.id, newAlbumIds);
            })
          );
        }),
        concatAll()
      )
    ),

    deletePermanently: rxMethod<null>(
      pipe(
        // Trigger an "event" per selected photo
        map(() => [null, store.selected()] as [null, string[]]),
        expand(([_, photos]) => {
          if (photos.length === 0) return EMPTY;
          return of([photos[0], photos.slice(1)] as [string, string[]]);
        }),
        filter(([photo, _]) => photo !== null),
        map(([photo, _]) => photo),

        // And call DELETE per photo
        map(photoId => photoService.delete(photoId)),
        concatAll()
      )
    ),
  })),
  // Some automatic triggers...
  withHooks({
    onInit(store, albumStore = inject(AlbumStore)) {
      // Exit selection mode whenever we navigate to another album
      effect(() => {
        // Listen for changes in selected album ID
        albumStore.id();
        // Then trigger the selection mode exit
        store.setMode(false);
      });
    },
  })
);
