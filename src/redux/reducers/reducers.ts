import {combineReducers, Reducer} from "@reduxjs/toolkit";

import album, { AlbumStateType } from './album';
import auth, { AuthStateType } from './auth';
import author, { AuthorStateType } from "./author";
import event, { EventStateType } from './event';
import photo, { PhotoStateType } from './photo';

export interface StateType {
  album: AlbumStateType;
  auth: AuthStateType;
  author: AuthorStateType;
  event: EventStateType;
  photo: PhotoStateType;
}

const reducer: Reducer<StateType> = combineReducers({
  album,
  auth,
  author,
  event,
  photo
});

const rootReducer: Reducer<StateType> = (state, action) => {
  return reducer(state, action);
}

export default rootReducer;
