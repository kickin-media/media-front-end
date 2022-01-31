import React from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';

import EventOverviewPage from './EventOverviewPage';
import EventPage from "./EventPage";

const routes = () => (
  <Switch>
    <Route exact path="/event/" component={EventOverviewPage} />
    <Route exact path="/event/:eventId" component={EventPage} />

    <Route render={() => <Redirect to="/" />} />
  </Switch>
);

export default routes;