import {patchState, signalStore, withComputed, withHooks, withLinkedState, withMethods, withState} from "@ngrx/signals";
import {computed, effect, inject} from "@angular/core";
import {AlbumStore} from "../../../shared/stores/album.store";
import {SelectedPhotosStore} from "./selected-photos.store";
import {PhotoReadSingle, PhotoReadSingleStub} from "../../../shared/back-end";
import {AccountService} from "../../../services/account.service";
import {toSignal} from "@angular/core/rxjs-interop";

export enum PhotoSortMode {
  TAKEN = "taken",
  UPLOADED = "uploaded",
}

interface PhotoGalleryState {
  filterAuthorIds: string[] | null;
  sortBy: PhotoSortMode;
}

const DEFAULT_STATE: PhotoGalleryState = {
  filterAuthorIds: null,
  sortBy: PhotoSortMode.TAKEN,
}

export const PhotoGalleryStore = signalStore(
  { providedIn: 'root' },
  // State & methods to alter the state
  withState<PhotoGalleryState>(DEFAULT_STATE),
  withMethods((store) => ({
    reset(): void {
      patchState(store, DEFAULT_STATE);
    },

    setAuthorFilter(authorIds: string[]): void {
      patchState(store, { filterAuthorIds: authorIds });
    },

    setSort(sortBy: PhotoSortMode): void {
      patchState(store, { sortBy });
    },
  })),

  // Get photos from the album store
  withComputed((
    store,
    albumStore = inject(AlbumStore),
    accountService = inject(AccountService),
  ) => ({
    _photos: computed(() => {
      const album = albumStore.album();
      if (!album) return [];
      return album.photos;
    }),

    _user: toSignal(accountService.user$),
    _canManageOther: toSignal(accountService.canManageOther$),
  })),

  // Filter & sort photos
  withLinkedState((store, selectedPhotosStore = inject(SelectedPhotosStore)) => ({
    _filtered: () => {
      let photos = store._photos();

      // Filter by authors
      let authors = store.filterAuthorIds();
      if (selectedPhotosStore.selectionMode() && !store._canManageOther()) {
        // In select-mode for unprivileged users, only show photos that the current
        // user has uploaded...
        const user = store._user();
        authors = user && user.sub ? [user.sub] : [];
      }
      if (authors) photos = photos.filter((photo) => photo.author.id && authors.includes(photo.author.id));

      return photos;
    },
  })),
  withLinkedState((store) => ({
    _sorted: () => {
      const photos = store._filtered();

      // Define the fiels of the photo object to sort by
      const fields: Record<PhotoSortMode, keyof PhotoReadSingleStub> = {
        [PhotoSortMode.TAKEN]: "timestamp",
        [PhotoSortMode.UPLOADED]: "uploaded_at",
      };
      const field = fields[store.sortBy()];

      // Define the direction to sort by
      const directions: Record<PhotoSortMode, -1 | 1> = {
        [PhotoSortMode.TAKEN]: 1,
        [PhotoSortMode.UPLOADED]: -1,
      };
      const direction = directions[store.sortBy()];

      return photos.sort((a, b) => {
        // Ensure the selected field is defined
        if (!a[field]) return -1;
        if (!b[field]) return 1;

        // Convert to date objects
        // @ts-expect-error TS2769; selected fields are string date representations
        const aa = new Date(a[field]);
        // @ts-expect-error TS2769; selected fields are string date representations
        const bb = new Date(b[field]);

        return direction * (aa.getTime() - bb.getTime());
      });
    },
  })),

  withLinkedState((store) => ({
    photos: () => store._sorted(),
  })),

  // Some automatic triggers...
  withHooks({
    onInit(store, albumStore = inject(AlbumStore)) {
      // Reset filters / sort whenever we navigate to another album
      effect(() => {
        // Listen for changes in selected album ID
        albumStore.id();
        // Then trigger the reset
        store.reset();
      });
    },
  })
)
