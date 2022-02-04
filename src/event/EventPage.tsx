import React, { useEffect } from 'react';
import { useRouteMatch } from "react-router-dom";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { StateType } from "../redux/reducers/reducers";

import * as actions from '../redux/actions/event';
import { AnyAction } from "@reduxjs/toolkit";
import Typography from "@mui/material/Typography";
import Album from "../album/components/Album";
import { CircularProgress } from "@mui/material";

import classes from './EventPage.module.scss';

const EventPage: React.FC<Props> = ({ eventId }) => {
  const routeMatch = useRouteMatch<RouteProps>();

  const dispatch = useDispatch();
  const event = useSelector((state: StateType) => {
    if (eventId) return state.event[eventId];
    if (routeMatch.params.eventId) return state.event[routeMatch.params.eventId];

    return null;
  }, shallowEqual);
  const albums = useSelector((state: StateType) => event
    ? Object.keys(state.album)
      .filter(albumId => state.album[albumId].eventId === event.id)
      .map(albumId  => state.album[albumId])
    : null, shallowEqual);
  const canViewHidden = useSelector((state: StateType) => state.auth.authenticated
    && (state.auth.scopes.includes('albums:manage')
      || state.auth.scopes.includes('photos:upload')
      || state.auth.scopes.includes('events:manage')));

  // Load event on mount
  useEffect(() => {
    dispatch(actions.get((() => {
      if (eventId) return eventId;
      if (routeMatch.params.eventId) return routeMatch.params.eventId;
      return '';
    })())).then((res: AnyAction) => {
      if (res.type !== actions.get.success) return;

      dispatch(actions.getAlbums(res.response.result));
    });
  }, [dispatch, eventId, routeMatch.params.eventId])

  if (!event) return null;

  return (
    <>
      <Typography variant="h3">{event.name}</Typography>

      <div className={classes['album-grid']}>
        {albums !== null
          ? albums
            .filter(album => canViewHidden
              || (album.photosCount > 0
                && !(album.releaseTime !== null && new Date(album.releaseTime).getTime() > new Date().getTime())))
            .map(album => <Album key={album.id} album={album} />)
          : <CircularProgress />}
      </div>
    </>
  );
};

interface Props {
  eventId?: string;
}

interface RouteProps {
  eventId?: string;
}

export default EventPage;
