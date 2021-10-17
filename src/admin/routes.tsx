import React from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import { compose } from 'redux';

import DashboardPage from "./DashboardPage";

const routes: React.FC<ReduxProps> = ({ auth }) => auth ? (
  <Switch>
    <Route exact path="/admin/" component={DashboardPage} />

    {/* Redirect non-existing paths to admin root */}
    <Route render={() => <Redirect to="/admin/" />} />
  </Switch>
) : <Redirect to="/auth/login" />;

interface ReduxProps {
  auth: string | null;
}

const mapStateToProps = (state: any) => ({
  auth: state.auth.auth,
});

export default compose(
  connect(mapStateToProps)
)(routes) as React.FC;
