import { createReducer, Reducer } from "@reduxjs/toolkit";

import { PhotoType } from "./photo";

import * as actions from '../actions/album';
import * as eventActions from '../actions/event';
import * as photoActions from '../actions/photo';

export type AlbumStateType = { [key: string]: AlbumType };

export interface AlbumType {
  id: string;

  eventId: string;
  hiddenSecret: string | null;

  name: string;
  coverPhoto: PhotoType | null;

  photos?: string[];
  photosCount: number;

  releaseTime: Date | null;
  timestamp: Date;
}

const mergeAlbums = (old: AlbumType | undefined, current: AlbumType) => Object.assign({}, old, current);

const album: Reducer<AlbumStateType> = createReducer({} as AlbumStateType, {
  [eventActions.getAlbums.success]: (state, action) => {
    const albums = action.response.entities.album;
    if (!albums) return;

    Object.keys(albums).forEach(id => state[id] = mergeAlbums(state[id], albums[id]));
  },

  [photoActions.setAlbums.success]: (state: AlbumStateType, action) => {
    const photo: PhotoType = action.response.entities.photo[action.response.result];
    Object.keys(state)
      .map(albumId => state[albumId])
      .filter(album => album.photos !== undefined && album.photos.includes(photo.id))
      .filter(album => !photo.albums || photo.albums.includes(album.id))
      .forEach(album => {
        if (!album.photos) return;

        state[album.id] = Object.assign({}, album, { photos: album.photos.filter(photoId => photo.id !== photoId) });
      });
  },

  [photoActions.remove.success]: (state, action) => {
    const removed = action.payload['photo_id'];

    Object.keys(state).forEach(albumId => {
      if (!state[albumId].photos) return;
      state[albumId].photos = state[albumId].photos?.filter(other => removed !== other);
    })
  },

  [actions.create.success]: (state, action) => {
    const album = action.response.entities.album[action.response.result];
    state[album.id] = album;
  },

  [actions.update.success]: (state, action) => {
    const album = action.response.entities.album[action.response.result];
    state[album.id] = mergeAlbums(state[album.id], album)
  },

  [actions.updateHiddenStatus.success]: (state, action) => {
    const album = action.response.entities.album[action.response.result];
    state[album.id] = mergeAlbums(state[album.id], album);
  },

  [actions.updateAlbumCover.success]: (state, action) => {
    const album = action.response.entities.album[action.response.result];
    state[album.id] = mergeAlbums(state[album.id], album);
  },

  [actions.list.success]: (state, action) => {
    const albums = action.response.entities.album;
    Object.keys(albums).forEach(id => state[id] = mergeAlbums(state[id], albums[id]));
  },

  [actions.get.success]: (state, action) => {
    const album = action.response.entities.album[action.response.result];
    state[album.id] = mergeAlbums(state[album.id], album);
  },

  [actions.clear.success]: (state, action) => {
    state[action.payload['album_id']].photos = [];
    state[action.payload['album_id']].coverPhoto = null;
  },

  [actions.remove.success]: (state, action) => {
    delete state[action.payload['album_id']];
  }
});

export default album;
