import { createReducer, Reducer } from "@reduxjs/toolkit";

import * as actions from '../actions/album';
import * as eventActions from '../actions/event';

export type AlbumStateType = { [key: string]: AlbumType };

export interface AlbumType {
  id: string;

  eventId: string;

  name: string;

  photos?: string[];
  photosCount: number;

  release: Date | null;
  timestamp: Date;
}

const mergeAlbums = (old: AlbumType | undefined, current: AlbumType) => {
  // TODO: Merge
  return current;
};

const album: Reducer<AlbumStateType> = createReducer({} as AlbumStateType, {
  [eventActions.getAlbums.success]: (state, action) => {
    const albums = action.response.entities.album;
    Object.keys(albums).forEach(id => state[id] = mergeAlbums(state[id], albums[id]));
  },

  [actions.get.success]: (state, action) => {
    const album = action.response.entities.album[action.response.result];
    state[album.id] = mergeAlbums(state[album.id], album);
  }
});

export default album;
