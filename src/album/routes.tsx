import React from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';

import AlbumPage from './AlbumPage';

const routes = () => (
  <Switch>
    <Route exact path="/album/:albumId/:name" component={AlbumPage} />

    <Route render={() => <Redirect to="/" />} />
  </Switch>
);

export default routes;