import { configureStore as configure } from '@reduxjs/toolkit';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';

import reducer from './reducers/reducers';
import { authMiddleware } from "./middlewares/auth";
import { apiMiddleware } from "./middlewares/api";

const API_HOST_PROD = 'https://api.kick-in.media';
const API_HOST_DEV = 'https://api.dev.kick-in.media';

const configureStore = (preloadedState: any) => configure({
  reducer,
  preloadedState,
  middleware: [
    authMiddleware,
    apiMiddleware(process.env.API_ENV === 'prod' ? API_HOST_PROD : API_HOST_DEV),
    ...(process.env.NODE_ENV === "production" ? [] : [createLogger({
      collapsed: true,
      diff: true,
    })]),
    thunk
  ]
});

export default configureStore;
