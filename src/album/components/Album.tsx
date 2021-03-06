import React from 'react';
import clsx from 'clsx';
import slugify from 'slugify';
import { useHistory } from "react-router-dom";
import { relativeDate } from "../../util/date";

import { useSelector } from "react-redux";
import { AlbumType } from "../../redux/reducers/album";
import { StateType } from "../../redux/reducers/reducers";

import Badge from '@mui/material/Badge';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from "@mui/material/Typography";

import classes from './Album.module.scss';
import { NewReleases } from "@mui/icons-material";

const Album: React.FC<Props> = ({ album }) => {
  const history = useHistory();

  const event = useSelector((state: StateType) => album !== null
    ? state.event[album.eventId]
    : null);

  const storedLastSeen = album ? window.localStorage.getItem(`album-${album.id}`) : null;
  const isNew = album && storedLastSeen && parseInt(storedLastSeen.split(" ")[1]) < album.photosCount;

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
      <Badge
        className={clsx({ [classes.secret]: album.hiddenSecret !== null && album.hiddenSecret !== undefined })}
        invisible={!isNew}
        color="warning"
        variant="dot"
      >
        {album.coverPhoto
          ? (<img src={album.coverPhoto.imgUrls.small} alt="" />)
          : (<Skeleton variant="rectangular" width={240} height={160} />)}

        {isNew && <NewReleases />}
      </Badge>


      {/*{album.coverPhoto*/}
      {/*  ? (<img src={album.coverPhoto.imgUrls.small} alt="" />)*/}
      {/*  : (<Skeleton variant="rectangular" width={240} height={160} />)}*/}
      <Typography variant="body1"><strong>{album.name}</strong></Typography>
      <Typography variant="caption">{relativeDate(album.timestamp)} ??? {event?.name}</Typography>
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
