import { Tag } from '../../util/types';
import { patchState, signalStore, withHooks, withMethods, withState } from '@ngrx/signals';
import { TagReadList, TagsService } from '../back-end';
import { inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';

export interface TagsState {
  isLoading: boolean;
  tags: TagReadList[] | null;
}

const initialState: TagsState = { isLoading: false, tags: null };

export const TagsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store, tagsService = inject(TagsService)) => ({
    // Refresh the available tags from the back-end
    refresh: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() => tagsService.listTagsTagGet()),
        tap(tags => patchState(store, { isLoading: false, tags: tags as Tag[] }))
      )
    ),
  })),
  withHooks(store => ({
    // Refresh the available tags on init
    onInit() {
      store.refresh();
    },
  }))
);
