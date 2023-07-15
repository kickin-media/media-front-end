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

  if (!event) return <p>Placeholder</p>;

  return (
    <div className={classes.root}>
      <div className={classes.head}>
        <Typography variant="h5">{event.name}</Typography>
        <Typography variant="body2">{relativeDate(event.timestamp)} • {sortedAlbums.length} albums</Typography>
      </div>
      <div className={clsx(classes.gallery, {[classes.tiny]: width === 'xs'})}>
        {new Array(width === 'xs' || width === 'sm' ? 1 : 3)
          .fill(0)
          .map((_, index) => <Album key={index} album={index < sortedAlbums.length ? sortedAlbums[index] : null} />)}
        <Stack className={classes.more} spacing={1}>
          <div>
            <Skeleton variant="rectangular" width={240} height={160} animation={false} />
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
          </div>
          {/*<Typography variant="body1"><Skeleton /></Typography>*/}
          {/*<Typography variant="caption"><Skeleton /></Typography>*/}
        </Stack>
      </div>
    </div>
  );

  // return sortedAlbums.map(album => <p key={album.id}>{album.name}: {album.views}</p>);

  // return event ? (
  //   <Stack
  //     onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
  //       history.push(`/event/${event.id}/${slugify(event?.name)}`);
  //       e.preventDefault();
  //     }}
  //     component="a"
  //     href={`/event/${event.id}/${slugify(event?.name)}`}
  //     className={classes.event}
  //     direction="row"
  //     spacing={1}
  //   >
  //     {filteredAlbums.length > 0 && filteredAlbums[0].coverPhoto && filteredAlbums[0].coverPhoto.uploadProcessed
  //       ? (<img src={filteredAlbums[0].coverPhoto?.imgUrls.medium} alt="" />)
  //       : (<Skeleton variant="rectangular" width={120} height={80} />)}
  //     <Stack spacing={1}>
  //       <Typography variant="body1"><strong>{event.name}</strong></Typography>
  //       <Typography variant="caption">{relativeDate(event.timestamp)} • {albums.length} albums</Typography>
  //     </Stack>
  //   </Stack>
  // ) : (
  //   <Stack className={classes.event} direction="row" spacing={1}>
  //     <Skeleton variant="rectangular" width={120} height={80} />
  //     <Stack spacing={1}>
  //       <Typography variant="body1"><Skeleton /></Typography>
  //       <Typography variant="caption"><Skeleton /></Typography>
  //     </Stack>
  //   </Stack>
  // );
}

interface Props {
  event: EventType | null;
}

export default Event;
