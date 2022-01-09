import { createReducer, Reducer } from "@reduxjs/toolkit";

// import * as actions from '../actions/photo';
import * as albumActions from '../actions/album';

export type PhotoStateType = { [key: string]: PhotoType };

export interface PhotoType {
  id: string;

  imgUrls: {
    original: string;
    large: string; // 2048
    medium: string; // 800
    small: string; // 400
  }

  timestamp: Date | null;
}

const mergePhotos = (old: PhotoType | undefined, current: PhotoType) => {
  // TODO: Merge
  return current;
};

const photo: Reducer<PhotoStateType> = createReducer({} as PhotoStateType, {
  [albumActions.get.success]: (state, action) => {
    const photos = action.response.entities.photo;
    Object.keys(photos).forEach(id => state[id] = mergePhotos(state[id], photos[id]));
  }
});

export default photo;
