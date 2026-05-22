import { patchState, signalStore, withComputed, withHooks, withMethods, withProps, withState } from '@ngrx/signals';
import { PhotoGalleryStore } from '../../album/stores/photo-gallery.store';
import { computed, effect, inject } from '@angular/core';
import { PhotoReadSingle, PhotoService } from '../../../shared/back-end';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';

interface LightboxState {
  index: number;
  _detail: PhotoReadSingle | null;
}

export const LightboxPhotoStore = signalStore(
  { providedIn: 'root' },
  withState<LightboxState>({ index: 0, _detail: null }),
  withProps((store, photoGallery = inject(PhotoGalleryStore)) => ({
    _gallery: photoGallery,
  })),
  withComputed(store => ({
    photos: store._gallery.photos,
  })),

  withMethods((store, photoService = inject(PhotoService)) => ({
    setIndex(index: number): void {
      patchState(store, { index });
    },

    setCurrentPhoto(photoId: string): void {
      const photoIndex = store.photos().findIndex(photo => photo.id === photoId);
      if (photoIndex === -1) return;
      patchState(store, { index: photoIndex });
    },

    next(): void {
      const currentIndex = store.index();
      const newIndex = currentIndex + 1;

      const albumLength = store.photos().length;
      if (newIndex >= albumLength) return;

      patchState(store, { index: newIndex });
    },

    back(): void {
      const currentIndex = store.index();
      const newIndex = currentIndex - 1;

      if (newIndex < 0) return;

      patchState(store, { index: newIndex });
    },

    _loadDetailedPhoto: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { _detail: null })),
        switchMap(photoId => photoService.getPhotoPhotoPhotoIdGet(photoId)),
        tap(detailedPhoto => patchState(store, { _detail: detailedPhoto }))
      )
    ),
  })),

  withHooks(store => ({
    onInit() {
      effect(() => {
        const index = store.index();
        const photo = store.photos()[index];

        // Trigger automatic fetch of detailed information
        store._loadDetailedPhoto(photo.id);
      });
    },
  })),

  withComputed(store => ({
    photo: computed(() => {
      const detailedPhoto = store._detail();

      if (detailedPhoto !== null) return detailedPhoto;
      else return store.photos()[store.index()];
    }),

    canGoBack: computed(() => store.index() > 0),
    canGoForward: computed(() => store.index() + 1 < store.photos().length),
  }))
);
