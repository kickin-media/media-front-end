import React, { useEffect, useMemo, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { AnyAction } from "@reduxjs/toolkit";

import { StateType } from "../redux/reducers/reducers";
import * as eventActions from '../redux/actions/event';

import CircularProgress from '@mui/material/CircularProgress';
import EventOverviewPage from "../event/EventOverviewPage";
import EventPage from "../event/EventPage";
import NotFound from "../components/NotFound";

const HomePage = () => {
  const dispatch = useDispatch();
  const events = useSelector((state: StateType) => state.event, shallowEqual);
  const [loading, setLoading] = useState<boolean>(Object.keys(events).length === 0);

  // Load all events on page load
  useEffect(() => {
    dispatch(eventActions.list()).then((res: AnyAction) => {
      if (res.type === eventActions.list.request) return;
      setLoading(false);
    });
  }, [dispatch]);

  // Sort events by date (newest first)
  const sortedEvents = useMemo(() => Object.keys(events)
      .sort((a, b) => events[b].timestamp.getTime() - events[a].timestamp.getTime()),
    [events]);

  // Get the most recent event
  const event = useMemo(() => sortedEvents.length > 0 ? events[sortedEvents[0]] : null, [events, sortedEvents]);

  if (loading) return <CircularProgress />; // TODO: replace with skeletons
  if (!event) return <NotFound />;

  const dt = new Date().getTime() - event.timestamp.getTime();
  if (sortedEvents.length === 1 || (dt >= 0 && dt < 6 * 7 * 24 * 60 * 60 * 1000))
    return <EventPage eventId={event.id} />;

  return <EventOverviewPage />;
}

export default HomePage;
