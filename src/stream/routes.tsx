import React from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';

import StreamOverviewPage from "./StreamOverviewPage";

const routes = () => (
  <Switch>
    <Route exact path="/stream/" component={StreamOverviewPage} />
    <Route exact path="/stream/live" component={() => <h1>Yeet</h1>} />
    <Route exact path="/stream/:photoId" component={StreamOverviewPage} />

    <Route render={() => <Redirect to="/" />} />
  </Switch>
);

export default routes;