import { createReducer, Reducer } from "@reduxjs/toolkit";

import * as actions from '../actions/photo';
import * as albumActions from '../actions/album';
import { AuthorType } from "./author";

export type PhotoStateType = { [key: string]: PhotoType };

export interface PhotoType {
  id: string;
  author: AuthorType;

  imgUrls: {
    original: string;
    large: string; // 2048
    medium: string; // 800
    small: string; // 400
  }

  timestamp: Date | null;
  uploadedAt: Date | null;

  uploadProcessed: boolean;
}

const mergePhotos = (old: PhotoType | undefined, current: PhotoType) => {
  // TODO: Merge
  return current;
};

const photo: Reducer<PhotoStateType> = createReducer({} as PhotoStateType, {
  [albumActions.get.success]: (state, action) => {
    if (!action.response.entities || !action.response.entities.photo) return;

    const photos = action.response.entities.photo;
    Object.keys(photos).forEach(id => state[id] = mergePhotos(state[id], photos[id]));
  },

  [actions.remove.success]: (state, action) => {
    delete state[action.payload['photo_id']];
  }
});

export default photo;
