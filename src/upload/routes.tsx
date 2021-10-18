import React from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';

import UploadPage from './UploadPage';

const routes = () => (
  <Switch>
    <Route exact path="/upload/" component={UploadPage} />

    <Route render={() => <Redirect to="/upload/" />} />
  </Switch>
);

export default routes;