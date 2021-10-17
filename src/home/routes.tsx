import React from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';

import HomePage from "./HomePage";

const routes = () => (
  <Switch>
    <Route exact path="/" component={HomePage} />

    <Route render={() => <Redirect to="/" />} />
  </Switch>
);

export default routes;