import React, { useEffect, useMemo } from 'react';

import {Region} from '../components/ui/AppUI';

import hero from '../res/images/hero.jpg';
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { StateType } from "../redux/reducers/reducers";

import * as eventActions from '../redux/actions/event';
import EventPage from "../event/EventPage";

const HomePage = () => {
  const dispatch = useDispatch();
  const albums = useSelector((state: StateType) => state.album, shallowEqual);
  const events = useSelector((state: StateType) => state.event, shallowEqual);

  useEffect(() => {
    dispatch(eventActions.list());
  }, [dispatch]);

  useEffect(() => {
    Object.keys(events).forEach(id => dispatch(eventActions.getAlbums(id)))
  }, [dispatch, events]);

  const sortedEvents = useMemo(() => Object.keys(events)
    .sort((a, b) => events[b].timestamp.getTime() - events[a].timestamp.getTime()),
    [events]);

  const highlight = useMemo(() => sortedEvents
    .filter(eventId => Object.keys(albums).some(albumId => albums[albumId].eventId === eventId)),
    [sortedEvents, albums]);

  return (
    <>
      <Region name="hero">
        <img src={hero} alt="Hero" />
        <img src={hero} alt="Hero" />
      </Region>

      {highlight.length > 0 && <EventPage eventId={highlight[0]} />}
    </>
  );
}

export default HomePage;
