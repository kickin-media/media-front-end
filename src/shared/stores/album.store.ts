import { patchState, signalStore, withComputed, withHooks, withMethods } from '@ngrx/signals';
import { upsertEntity, withEntities } from '@ngrx/signals/entities';
import { AlbumReadSingle, AlbumsService } from '../back-end';
import { RouteService } from '../services/route.service';
import { computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';

type Album = AlbumReadSingle;
type AlbumItem = { id: string; album?: Album; loading: true } | { id: string; album: Album; loading: false };

export const AlbumStore = signalStore(
  { providedIn: 'root' },
  withEntities<AlbumItem>(),
  withComputed((store, routeService = inject(RouteService)) => ({
    id: toSignal(routeService.trackRouteParam('album_id')),
    secret: toSignal(routeService.trackRouteQuery('secret')),
  })),
  withMethods((store, albumsService = inject(AlbumsService)) => ({
    loadAlbum: rxMethod<{ id: string; secret: string | null }>(
      pipe(
        tap(() => console.log('YEEEEEET')),
        tap(({ id }) => patchState(store, upsertEntity({ id, loading: true } as AlbumItem))),
        switchMap(({ id, secret }) => albumsService.getAlbumAlbumAlbumIdGet(id, secret ?? undefined)),
        tap(album => patchState(store, upsertEntity({ id: album.id, album, loading: false } as AlbumItem)))
      )
    ),
  })),
  withHooks({
    onInit: store => {
      // Automatically load the album when the route changes
      effect(() => {
        const id = store.id();
        if (!id) return;

        const secret = store.secret() ?? null;
        store.loadAlbum({ id, secret });
      });
    },
  }),
  withComputed(({ entityMap, id }) => ({
    album: computed(() => {
      const albumId = id();
      if (!albumId) return null;

      const item = entityMap()[albumId];
      if (!item) return null;

      return item.album ?? null;
    }),
  }))
);
