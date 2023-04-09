import { WebAuth } from 'auth0-js';
import { Middleware } from "@reduxjs/toolkit";

import * as auth from '../actions/auth';
import * as ui from '../actions/ui';

export const authMiddleware: Middleware = api => next => {
  const webAuth = new WebAuth({
    domain: 'kickin-media.eu.auth0.com',
    clientID: 'JVlKeh2uzBJSw1cwOF34V1Ro57vj5uoh',
    audience: 'https://api.kick-in.media',
    scope: [
      'openid',
      'profile',
      'email',
      'events:manage',
      'albums:read_hidden',
      'albums:manage',
      'photos:upload',
      'photos:download_other',
      'photos:delete_other',
      'photos:read_view_count'
    ].join(' ')
  });

  webAuth.parseHash({ hash: window.location.hash }, (error, result) => {
    // If the hash was parsed successfully, then dispatch a corresponding action and fix the browser's URL
    if (result) {
      api.dispatch(auth.authenticate(result));
      return;
    }

    // Otherwise, handle the error
    if (!error) return;
    switch (error.error) {

      // Don't do anything with these errors
      case 'invalid_token':
        break;

      // Always log unknown errors
      default:
        console.error(error);
    }
  });

  return action => {
    // Catch any undefined actions and cancel their processing as it might result in problems further down the line
    if (!action) return action;

    switch (action.type) {
      case auth.login.toString():
        webAuth.authorize({
          connection: 'kick-in-idb',
          responseType: 'token id_token',
          ...action.payload
        });
        break;
      case auth.logout.toString():
        api.dispatch(ui.createNotification("User session expired"));
        window.localStorage.removeItem('auth');
        webAuth.logout({ returnTo: action.payload.returnTo });
        break;
      case auth.renew.toString():
        const authState = api.getState().auth;
        if (!authState.authenticated) return;

        webAuth.checkSession({
          responseType: 'token id_token',
          redirectUri: document.location.origin,
          state: authState.state
        }, (error, res) => {
          if (res) api.dispatch(auth.authenticate(res))

          // Otherwise, handle the error
          if (!error) return;
          switch (error.error) {

            // Don't do anything with these errors
            case 'login_required':
              break;

            // Always log unknown errors
            default:
              console.error(error);
          }

          api.dispatch(auth.logout(window.location.origin));
        });
        break;
    }

    return next(action);
  };
};
