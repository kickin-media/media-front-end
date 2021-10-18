import { createAction } from '@reduxjs/toolkit';
import { Auth0DecodedHash } from "auth0-js";

export const authenticate = createAction('AUTH_AUTHENTICATE', (auth: Auth0DecodedHash) => ({
  payload: auth
}));

export const login = createAction('AUTH_LOGIN', (redirectUri?: string) => ({
  payload: { redirectUri }
}));

export const logout = createAction('AUTH_LOGOUT', (returnTo?: string) => ({
  payload: { returnTo }
}));

export const renew = createAction('AUTH_RENEW');
