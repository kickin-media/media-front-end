import {combineReducers, Reducer} from "@reduxjs/toolkit";

import album, { AlbumStateType } from './album';
import auth, { AuthStateType } from './auth';
import author, { AuthorStateType } from "./author";
import event, { EventStateType } from './event';
import photo, { PhotoStateType } from './photo';
import photoStream, { PhotoStreamType} from "./photo-stream";
import ui, { UIStateType } from "./ui";

export interface StateType {
  album: AlbumStateType;
  auth: AuthStateType;
  author: AuthorStateType;
  event: EventStateType;
  photo: PhotoStateType;
  photoStream: PhotoStreamType;
  ui: UIStateType;
}

const reducer: Reducer<StateType> = combineReducers({
  album,
  auth,
  author,
  event,
  photo,
  photoStream,
  ui
});

const rootReducer: Reducer<StateType> = (state, action) => {
  return reducer(state, action);
}

export default rootReducer;
