import React, { useEffect, useMemo, useState } from 'react';
import { useHistory, useRouteMatch } from "react-router-dom";
import { shallowEqual, useDispatch, useSelector } from "react-redux";

import Album from "../album/components/Album";
import Button from "@mui/material/Button";
import ButtonGroup from '@mui/material/ButtonGroup';
import CircularProgress from '@mui/material/CircularProgress';
import DeleteDialog from "../components/dialogs/DeleteDialog";
import EventEditDialog from "./dialogs/EventEditDialog";
import Grid from '@mui/material/Unstable_Grid2';
import Typography from "@mui/material/Typography";

import CollectionsIcon from '@mui/icons-material/Collections';

import * as actions from '../redux/actions/event';
import { AnyAction } from "@reduxjs/toolkit";
import { StateType } from "../redux/reducers/reducers";

import classes from './EventPage.module.scss';
import HeroCarousel from "../components/HeroCarousel";
import { renderDate } from "../util/date";

const EventPage: React.FC<Props> = ({ eventId }) => {
  const [edit, setEdit] = useState<boolean>(false);
  const [deleteOpen, setDelete] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

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

  const canCrud = useSelector((state: StateType) => state.auth.authenticated
    && state.auth.scopes.includes('events:manage'));

  // Load event on mount
  useEffect(() => {
    dispatch(actions.get((() => {
      if (eventId) return eventId;
      if (routeMatch.params.eventId) return routeMatch.params.eventId;
      return '';
    })())).then((res: AnyAction) => {
      if (res.type !== actions.get.success) return;

      dispatch(actions.getAlbums(res.response.result)).then((res: AnyAction) => {
        if (res.type === actions.getAlbums.success) setLoading(false);
      });
    });
  }, [dispatch, eventId, routeMatch.params.eventId]);

  const filtered = useMemo(() => albums === null
    ? null
    : albums
      .filter(album => canViewHidden
        || (album.photosCount > 0
          && !(album.releaseTime !== null && new Date(album.releaseTime).getTime() > new Date().getTime()))),
    [albums, canViewHidden]);

  const sorted = useMemo(() => filtered === null
    ? null
    : filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
    [filtered]);

  const categorized = useMemo(() => sorted === null
    ? null
    : sorted.reduce((prev, album) => {
      const rendered = renderDate(album.timestamp);
      const res = Object.assign({}, prev);

      if (res[rendered] === undefined) res[rendered] = [];
      res[rendered] = [...res[rendered], album];

      return res;
    }, {}),
    [sorted]);

  const avgSize = categorized === null
    ? 0
    : Object.keys(categorized).reduce((prev, cat) => prev + categorized[cat].length, 0) / Object.keys(categorized).length;

  if (!event) return null;

  return (
    <>
      <HeroCarousel eventId={event ? event.id : null} />
      <Typography variant="h3">{event.name}</Typography>

      {canCrud && (<div className={classes.actions}>
        <ButtonGroup variant="outlined">
          <Button onClick={() => setEdit(true)}>Edit</Button>
          <Button onClick={() => setDelete(true)}>Delete</Button>
        </ButtonGroup>
      </div>)}

      <Grid container spacing={2}>
        {sorted === null || categorized === null
          ? <CircularProgress />
          : (sorted.length > 10 && avgSize > 4
            ? Object.keys(categorized).map(cat => (
              <React.Fragment key={cat}>
                <Grid className={classes['grid-title']} xs={12}><Typography variant="overline">{cat}</Typography></Grid>
                {categorized[cat].map(album => (
                  <Grid key={album.id} xs={12} sm={6} md={3}><Album album={album} /></Grid>
                ))}
              </React.Fragment>
              ))
            : sorted.map(album => <Grid key={album.id} xs={12} sm={6} md={3}><Album album={album} /></Grid>)
          )}
      </Grid>

      {loading && (albums === null || albums.length === 0) && <CircularProgress />}
      {!loading && albums !== null && albums.length === 0 && (
        <div className={classes.empty}>
          <CollectionsIcon />
          <Typography>
            It looks like there aren't any albums here yet, take a look at the{" "}
            <a href="/event/" onClick={(e) => {
              e.preventDefault();
              history.push('/event/');
            }}>
              Events
            </a>{" "}
            page for older events or come back in a few days.
          </Typography>
        </div>
      )}

      <EventEditDialog eventId={event ? event.id : undefined} open={edit} onClose={() => setEdit(false)} />
      <DeleteDialog
        open={deleteOpen}
        onFail={() => setDelete(false)}
        onSuccess={() => dispatch(actions.remove(event.id)).then((res: AnyAction) => {
          setDelete(false);
          if (res.type.endsWith('_FAILURE')) return;
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
