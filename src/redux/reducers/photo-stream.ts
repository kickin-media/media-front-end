import { createReducer, Reducer } from '@reduxjs/toolkit';

import * as actions from '../actions/photo-stream';

export interface PhotoStreamType {
  photos: string[];

  head?: string;
  tail?: string | null;
  upToDate?: Date;
}

const photoStream: Reducer<PhotoStreamType> = createReducer({ photos: [] } as PhotoStreamType, {
  [actions.getStream.success]: (state, action) => {
    const direction: "newer" | "older" = action.payload.direction;
    const response = action.response.entities.photoStream.stream;
    const photos: string[] = response.photos;

    // Add the  photo's
    if (direction === 'newer') {
      // Get the head of the current photo stream (ie. the newest local photos)
      const head = state.photos.slice(undefined, photos.length);

      // Filter out any retrieved photos that are already saved locally
      const filtered = photos.filter(id => head.indexOf(id) === -1);

      // Save the reversed filtered photos to the photo stream
      // We reverse this array as the photos come in oldest first, instead of newest first
      state.photos = [...filtered.reverse(), ...state.photos];
    } else {
      // Get the tail of the current photo stream (ie. the oldest local photos)
      const tail = state.photos.slice(state.photos.length - photos.length);

      // Filter out any retrieved photos that are already saved locally
      const filtered = photos.filter(id => tail.indexOf(id) === -1);

      // Save the filtered photos to the photo stream
      state.photos = [...state.photos, ...filtered];
    }

    // Update the pointers
    if (direction === 'newer') {
      if (response.nextPhotoId !== "") {
        state.head = response.nextPhotoId;
        state.upToDate = undefined;
      } else {
        state.head = state.photos[0];
        state.upToDate = new Date();
      }
    } else { // Searching older photos
      if (response.nextPhotoId !== "") state.tail = response.nextPhotoId;
      else state.tail = null;
    }

    // Set pointers if none are set
    if (state.head === undefined) state.head = state.photos[0];
    if (state.tail === undefined) state.tail = state.photos[state.photos.length - 1];
  }
});

export default photoStream;
