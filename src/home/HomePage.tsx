import React, { useEffect } from 'react';

import {Region} from '../components/ui/AppUI';

import hero from '../res/images/hero.jpg';
import AlbumCarousel from "../components/album/AlbumCarousel";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { StateType } from "../redux/reducers/reducers";

import * as eventActions from '../redux/actions/event';

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

  return (
    <>
      <Region name="hero">
        <img src={hero} style={{ width: '100%' }} alt="Hero" />
      </Region>

      {Object.keys(events).map(event => (
        <AlbumCarousel
          key={event}
          albums={Object.keys(albums).filter(album => albums[album].eventId === event).map(album => albums[album])}
          title={events[event].name}
        />
      ))}
      <AlbumCarousel albums={null} title="Recente albums" />
    </>
  );
}

export default HomePage;
