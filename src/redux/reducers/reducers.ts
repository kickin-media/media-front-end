import {combineReducers, Reducer} from "@reduxjs/toolkit";

import auth, { AuthStateType } from './auth';

export interface StateType {
  auth: AuthStateType;
}

const reducer: Reducer<StateType> = combineReducers({
  auth
});

const rootReducer: Reducer<StateType> = (state, action) => {
  return reducer(state, action);
}

export default rootReducer;
