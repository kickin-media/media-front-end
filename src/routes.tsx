import React from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';

import AppUI from './components/ui/AppUI';

// Import other routing files
import admin from './admin/routes';
import album from './album/routes';
import event from './event/routes';
import home from './home/routes';
import upload from './upload/routes';

// Route between (sub-)apps
const routes = () => {
  return (
    <BrowserRouter>
      <AppUI>
        <Switch>
          <Route path="/admin/" component={admin} />
          <Route path="/album/" component={album} />
          <Route path="/event/" component={event} />
          <Route path="/upload/" component={upload} />

          <Route component={home}/>
        </Switch>
      </AppUI>
    </BrowserRouter>
  );
};

export default routes;
