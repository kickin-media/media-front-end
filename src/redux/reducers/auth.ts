import { createReducer, Reducer } from "@reduxjs/toolkit";

import * as actions from '../actions/auth';

export type AuthStateType = AuthenticatedType | UnauthenticatedType;

export interface AuthenticatedType {
  authenticated: true;

  accessToken: string;
  idToken: string;
  refreshToken: string | null;
  expires: Date;
  scopes: string[];
  state: string;
  tokenType: 'Bearer' | string;

  user: UserType;
}

export interface UserType {
  name: string;
  nickname: string;
  picture: string;
  sub: string;
}

export interface UnauthenticatedType {
  authenticated: false;
}

const auth: Reducer<AuthStateType> = createReducer({
  authenticated: false,
} as AuthStateType, {
  [actions.authenticate.toString()]: (state, action) => {
    state.authenticated = true;
    if (!state.authenticated) return;

    state.accessToken = action.payload.accessToken;
    state.idToken = action.payload.idToken;
    state.refreshToken = action.payload.refreshToken;
    state.expires = new Date(new Date().getTime() + action.payload.expiresIn * 1000);
    state.scopes = action.payload.scope.split(' ');
    state.state = action.payload.state;
    state.tokenType = action.payload.tokenType;

    state.user = {
      name: action.payload.idTokenPayload.name,
      nickname: action.payload.idTokenPayload.nickname,
      picture: action.payload.idTokenPayload.picture,
      sub: action.payload.idTokenPayload.sub,
    };
  }
});

export default auth;
