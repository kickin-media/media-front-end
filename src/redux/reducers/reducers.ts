import {combineReducers, Reducer} from "@reduxjs/toolkit";

import album, { AlbumStateType } from './album';
import auth, { AuthStateType } from './auth';
import event, { EventStateType } from './event';
import photo, { PhotoStateType } from './photo';

export interface StateType {
  album: AlbumStateType;
  auth: AuthStateType;
  event: EventStateType;
  photo: PhotoStateType;
}

const reducer: Reducer<StateType> = combineReducers({
  album,
  auth,
  event,
  photo
});

const rootReducer: Reducer<StateType> = (state, action) => {
  return reducer(state, action);
}

export default rootReducer;
