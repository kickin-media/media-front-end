import React, { useEffect, useState } from 'react';
import { useHistory, useRouteMatch } from "react-router-dom";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { StateType } from "../redux/reducers/reducers";

import * as actions from '../redux/actions/event';
import { AnyAction } from "@reduxjs/toolkit";
import Typography from "@mui/material/Typography";
import Album from "../album/components/Album";
import { ButtonGroup, CircularProgress } from "@mui/material";

import classes from './EventPage.module.scss';
import Button from "@mui/material/Button";
import EventEditDialog from "./dialogs/EventEditDialog";
import DeleteDialog from "../components/dialogs/DeleteDialog";

const EventPage: React.FC<Props> = ({ eventId }) => {
  const [edit, setEdit] = useState<boolean>(false);
  const [deleteOpen, setDelete] = useState<boolean>(false);

  const history = useHistory();
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

      <div className={classes.actions}>
        <ButtonGroup variant="outlined">
          <Button onClick={() => setEdit(true)}>Edit</Button>
          <Button onClick={() => setDelete(true)}>Delete</Button>
        </ButtonGroup>
      </div>

      <div className={classes['album-grid']}>
        {albums !== null
          ? albums
            .filter(album => canViewHidden
              || (album.photosCount > 0
                && !(album.releaseTime !== null && new Date(album.releaseTime).getTime() > new Date().getTime())))
            .map(album => <Album key={album.id} album={album} />)
          : <CircularProgress />}
      </div>

      <EventEditDialog eventId={event ? event.id : undefined} open={edit} onClose={() => setEdit(false)} />
      <DeleteDialog
        open={deleteOpen}
        onFail={() => setDelete(false)}
        onSuccess={() => dispatch(actions.remove(event.id)).then((res: AnyAction) => {
          setDelete(false);
          history.push('/event/');
        })}
      />
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
