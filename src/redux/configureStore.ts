import { configureStore as configure } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';

import reducer from './reducers/reducers';
import { authMiddleware } from "./middlewares/auth";
import { apiMiddleware } from "./middlewares/api";

const configureStore = (preloadedState: any) => configure({
  reducer,
  preloadedState,
  middleware: [
    authMiddleware,
    apiMiddleware('https://dev.api.kick-in.media'),
    ...(process.env.NODE_ENV === "production" ? [] : [createLogger({
      collapsed: true,
      diff: true,
    })]),
    thunk
  ]
});

export default configureStore;
