import React, { useMemo } from 'react';
import clsx from "clsx";
import { useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import useWidth from "../../util/useWidth";
import { relativeDate } from "../../util/date";
import slugify from "slugify";

import { EventType } from "../../redux/reducers/event";
import { StateType } from "../../redux/reducers/reducers";

import Album from "../../album/components/Album";
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import classes from './Event.module.scss';

import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const Event: React.FC<Props> = ({ event }) => {
  const history = useHistory();

  const albums = useSelector((state: StateType) => event !== null
    ? Object.keys(state.album)
      .filter(key => state.album[key].eventId === event.id)
      .map(key => state.album[key])
    : []);

  const filteredAlbums = useMemo(() => albums.filter(album => album.photosCount > 0
    && !(album.releaseTime !== null && new Date(album.releaseTime).getTime() > new Date().getTime())),
    [albums]);

  const sortedAlbums = useMemo(
    () => filteredAlbums.sort((a, b) => b.views - a.views),
    [filteredAlbums]);

  const width = useWidth();

  return (
    <div className={clsx(classes.root, {[classes.placeholder]: !event})}>
      <div className={classes.head}>
        <Typography variant="h5">{event ? event.name : <Skeleton />}</Typography>
        <Typography variant="body2">{event ? `${relativeDate(event.timestamp)} • ${sortedAlbums.length} albums` : <Skeleton />}</Typography>
      </div>
      <div className={clsx(classes.gallery, {[classes.tiny]: width === 'xs'})}>
        {new Array(width === 'xs' || width === 'sm' ? 1 : 3)
          .fill(0)
          .map((_, index) => <Album key={index} album={index < sortedAlbums.length ? sortedAlbums[index] : null} />)}
        <Stack className={classes.more} spacing={1}>
          <div>
            <Skeleton variant="rectangular" width={240} height={160} animation={false} />
            {event && (
              <a
                href={`/event/${event.id}/${slugify(event?.name)}`}
                onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                  history.push(`/event/${event.id}/${slugify(event?.name)}`);
                  e.preventDefault();
                }}
              >
                <ChevronRightIcon />
                More...
              </a>
            )}
          </div>
        </Stack>
      </div>
    </div>
  );
}

interface Props {
  event: EventType | null;
}

export default Event;
