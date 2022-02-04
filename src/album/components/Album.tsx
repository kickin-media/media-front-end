import React from 'react';
import slugify from 'slugify';
import { useHistory } from "react-router-dom";
import { relativeDate } from "../../util/date";

import { useSelector } from "react-redux";
import { AlbumType } from "../../redux/reducers/album";
import { StateType } from "../../redux/reducers/reducers";

import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from "@mui/material/Typography";

import classes from './Album.module.scss';

const Album: React.FC<Props> = ({ album }) => {
  const history = useHistory();

  const event = useSelector((state: StateType) => album !== null
    ? state.event[album.eventId]
    : null);

  return album ? (
    <Stack
      onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
        history.push(`/album/${album.id}/${slugify(album.name).toLowerCase()}`);
        e.preventDefault();
      }}
      component="a"
      href={`/album/${album.id}/${slugify(album.name).toLowerCase()}`}
      className={classes.album}
      spacing={1}
    >
      {album.coverPhoto
        ? (<img src={album.coverPhoto.imgUrls.small} alt="" />)
        : (<Skeleton variant="rectangular" width={240} height={160} />)}
      <Typography variant="body1"><strong>{album.name}</strong></Typography>
      <Typography variant="caption">{relativeDate(album.timestamp)} • {event?.name}</Typography>
    </Stack>
  ) : (
    <Stack spacing={1}>
      <Skeleton variant="rectangular" width={240} height={160} />
      <Typography variant="body1"><Skeleton /></Typography>
      <Typography variant="caption"><Skeleton /></Typography>
    </Stack>
  );
};

interface Props {
  album: AlbumType | null;
}

export default Album;
