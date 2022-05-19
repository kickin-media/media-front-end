import React from 'react';
import { useHistory } from "react-router-dom";

import { EventType } from "../../redux/reducers/event";

import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import classes from './Event.module.scss';
import { relativeDate } from "../../util/date";
import { useSelector } from "react-redux";
import { StateType } from "../../redux/reducers/reducers";
import slugify from "slugify";

const Event: React.FC<Props> = ({ event }) => {
  const history = useHistory();

  const albums = useSelector((state: StateType) => event !== null
    ? Object.keys(state.album)
      .filter(key => state.album[key].eventId === event.id)
      .map(key => state.album[key])
    : [])

  return event ? (
    <Stack
      onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
        history.push(`/event/${event.id}/${slugify(event?.name)}`);
        e.preventDefault();
      }}
      component="a"
      href={`/event/${event.id}/${slugify(event?.name)}`}
      className={classes.event}
      direction="row"
      spacing={1}
    >
      {albums.length > 0 && albums[0].coverPhoto
        ? (<img src={albums[0].coverPhoto?.imgUrls.small} alt="" />)
        : (<Skeleton variant="rectangular" width={120} height={80} />)}
      <Stack spacing={1}>
        <Typography variant="body1"><strong>{event.name}</strong></Typography>
        <Typography variant="caption">{relativeDate(event.timestamp)} • {albums.length} albums</Typography>
      </Stack>
    </Stack>
  ) : (
    <Stack className={classes.event} direction="row" spacing={1}>
      <Skeleton variant="rectangular" width={120} height={80} />
      <Stack spacing={1}>
        <Typography variant="body1"><Skeleton /></Typography>
        <Typography variant="caption"><Skeleton /></Typography>
      </Stack>
    </Stack>
  );
}

interface Props {
  event: EventType | null;
}

export default Event;
