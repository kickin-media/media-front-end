import React from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';

import EventOverviewPage from './EventOverviewPage';

const routes = () => (
  <Switch>
    <Route exact path="/event/" component={EventOverviewPage} />

    <Route render={() => <Redirect to="/" />} />
  </Switch>
);

export default routes;