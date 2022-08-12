import React, { useEffect, useMemo } from 'react';
import { shallowEqual, useDispatch, useSelector } from "react-redux";

import CircularProgress from '@mui/material/CircularProgress';
import EventPage from "../event/EventPage";
import { Region } from '../components/ui/AppUI';

import hero from '../res/images/hero.jpg';

import * as eventActions from '../redux/actions/event';
import { StateType } from "../redux/reducers/reducers";

const HomePage = () => {
  const dispatch = useDispatch();
  const events = useSelector((state: StateType) => state.event, shallowEqual);

  useEffect(() => {
    dispatch(eventActions.list());
  }, [dispatch]);

  const sortedEvents = useMemo(() => Object.keys(events)
      .sort((a, b) => events[b].timestamp.getTime() - events[a].timestamp.getTime()),
    [events]);

  const event = useMemo(() => events[sortedEvents[0]], [events, sortedEvents]);

  return (
    <>
      <Region name="hero">
        <img src={hero} alt="Hero" />
        <img src={hero} alt="Hero" />
      </Region>

      {event ? (
        <EventPage eventId={event.id} />
      ) : (
        <CircularProgress />
      )}
    </>
  );
}

export default HomePage;
