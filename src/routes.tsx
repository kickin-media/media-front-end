import React from 'react';
import {BrowserRouter, Redirect, Route, Switch} from 'react-router-dom';

import AppUI from './components/ui/AppUI';

// Import other routing files
import admin from './admin/routes';
import gallery from './gallery/routes';
import home from './home/routes';

// Route between (sub-)apps
const routes = () => {
  return (
    <BrowserRouter>
      <AppUI>
        <Switch>
          <Route path="/admin/" component={admin}/>
          <Route path="/gallery/" component={gallery}/>

          <Route component={home}/>
        </Switch>
      </AppUI>
    </BrowserRouter>
  );
};

export default routes;
