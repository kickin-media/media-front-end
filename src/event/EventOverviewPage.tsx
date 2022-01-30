import React, { useEffect } from 'react';

import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { StateType } from "../redux/reducers/reducers";
import * as actions from '../redux/actions/event';
import { AnyAction } from "@reduxjs/toolkit";

import AlbumCarousel from "../album/components/AlbumCarousel";

const EventOverviewPage: React.FC = () => {
  const dispatch = useDispatch();
  const events = useSelector((state: StateType) => state.event, shallowEqual);
  const albums = useSelector((state: StateType) => state.album, shallowEqual);

  // Load all data on mount
  useEffect(() => {
    dispatch(actions.list())
      .then((eventResult: AnyAction) => {
        if (eventResult.type !== actions.list.success) return;

        eventResult.response.result
          .forEach((eventId: string) => dispatch(actions.getAlbums(eventId)));
      });
  }, [dispatch])

  return (
    <>
      {Object.keys(events)
        .filter(eventId => Object.keys(albums).some(albumId => albums[albumId].eventId === eventId))
        .map(eventId => (
          <AlbumCarousel
            key={eventId}
            title={events[eventId].name}
            albums={Object.keys(albums)
              .filter(albumId => albums[albumId].eventId === eventId)
              .map(albumId => albums[albumId])}
          />
      ))}
    </>
  );
};

export default EventOverviewPage;
