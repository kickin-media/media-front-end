import { createReducer, Reducer } from '@reduxjs/toolkit';

import * as actions from '../actions/photo-stream';

export type PhotoStreamType = StreamPageType[];

export interface StreamPageType {
  page: number;
  photos: string[];
}

const photoStream: Reducer<PhotoStreamType> = createReducer([] as PhotoStreamType, {
  [actions.getPage.success]: (state, action) => {
    const nr = action.payload.page;

    if (state.length <= nr) state.push(action.response.entities.photoStream[nr]);
    else state[nr] = action.response.entities.photoStream[nr];
  }
});

export default photoStream;
