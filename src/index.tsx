import React from 'react';

import { Provider } from 'react-redux';

import App from './App';

import configureStore from './redux/configureStore';
import reportWebVitals from './reportWebVitals';
import { StateType } from "./redux/reducers/reducers";
import * as authActions from './redux/actions/auth';
import { createRoot } from "react-dom/client";

const store = configureStore({});

// Renew authentication (if needed)
const renewAuth = () => {
  const auth = (store.getState() as StateType).auth;
  if (!auth.authenticated) return;

  // Check if the auth token expires within the next 5 minutes
  if (auth.expires.getTime() - new Date().getTime() > 6 * 60 * 1000) return;

  if (process.env.NODE_ENV === 'production') store.dispatch(authActions.renew());
  else store.dispatch(authActions.logout(window.location.origin));
};
setInterval(renewAuth, 5 * 60 * 1000);
renewAuth();

const root = createRoot(document.getElementById('root')!);
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
