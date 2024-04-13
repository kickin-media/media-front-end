import React, { useContext, useEffect, useMemo } from 'react';
import { shallowEqual, useDispatch, useSelector } from "react-redux";

import { AnyAction } from "@reduxjs/toolkit";
import { StateType } from "../redux/reducers/reducers";
import * as actions from '../redux/actions/event';

import Event from './components/Event';

import classes from './EventOverviewPage.module.scss';
import { BreadcrumbContext } from "../components/ui/Breadcrumb";

const EventOverviewPage: React.FC = () => {
  const dispatch = useDispatch();
  const events = useSelector((state: StateType) => state.event, shallowEqual);

  const setBreadcrumb = useContext(BreadcrumbContext).setPath;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setBreadcrumb({ name: 'Events', href: '/event/' }), []);

  // Load all data on mount
  useEffect(() => {
    dispatch(actions.list())
      .then((eventResult: AnyAction) => {
        if (eventResult.type !== actions.list.success) return;

        eventResult.response.result
          .forEach((eventId: string) => dispatch(actions.getAlbums(eventId)));
      });
  }, [dispatch]);

  const sortedEvents = useMemo(() => Object.keys(events)
    .map(id => events[id])
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    ), [events]);

  return (
    <div className={classes.list}>
      {sortedEvents.map(event => (
        <Event key={event.id} event={event}/>
      ))}
    </div>
  );
};

export default EventOverviewPage;
