import { createReducer, Reducer } from '@reduxjs/toolkit';

import * as actions from '../actions/photo-stream';

export interface PhotoStreamType {
  upToDate?: Date;
  photos: string[];
}

const photoStream: Reducer<PhotoStreamType> = createReducer({ photos: [] } as PhotoStreamType, {
  [actions.getPage.success]: (state, action) => {
    const photos: string[] = action.response.entities.photoStream.stream.photos

    if (action.payload.timestamp === undefined) {
      state.photos = photos;
    } else if (action.payload.direction === 'newer') {
      // Get the head of the current photo stream (ie. the newest local photos)
      const head = state.photos.slice(undefined, photos.length);

      // Filter out any retrieved photos that are already saved locally
      const filtered = photos.filter(id => head.indexOf(id) === -1);

      // Save the reversed filtered photos to the photo stream
      // We reverse this array as the photos come in oldest first, instead of newest first
      state.photos = [...filtered.reverse(), ...state.photos];

      if (photos.length < 50) state.upToDate = new Date();
    } else if (action.payload.direction === 'older') {
      // Get the tail of the current photo stream (ie. the oldest local photos)
      const tail = state.photos.slice(state.photos.length - photos.length);

      // Filter out any retrieved photos that are already saved locally
      const filtered = photos.filter(id => tail.indexOf(id) === -1);

      // Save the filtered photos to the photo stream
      state.photos = [...state.photos, ...filtered];
    }
  }
});

export default photoStream;
