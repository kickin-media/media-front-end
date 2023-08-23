import React from 'react';
import clsx from 'clsx';
import slugify from 'slugify';
import { useHistory } from "react-router-dom";
import { relativeDate } from "../../util/date";

import { AlbumType } from "../../redux/reducers/album";

import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from "@mui/material/Typography";

import classes from './Album.module.scss';
import { NewReleases } from "@mui/icons-material";

const Album: React.FC<Props> = ({ album }) => {
  const history = useHistory();

  const storedLastSeen = album ? window.localStorage.getItem(`album-${album.id}`) : null;
  const isNew = album && storedLastSeen && parseInt(storedLastSeen.split(" ")[1]) < album.photosCount;

  const timeDiff = album && album.releaseTime
    ? album.releaseTime.getTime() - new Date().getTime()
    : null;

  return album ? (
    <Stack
      onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
        history.push(`/album/${album.id}/${slugify(album.name).toLowerCase()}`);
        e.preventDefault();
      }}
      component="a"
      href={`/album/${album.id}/${slugify(album.name).toLowerCase()}`}
      className={clsx(classes.album, {[classes.timer]: timeDiff && timeDiff > 0 && timeDiff < 24 * 60 * 60 * 1000})}
      spacing={1}
    >
      <div className={clsx(classes.cover, {
        [classes.future]: timeDiff && timeDiff >= 24 * 60 * 60 * 1000,
        [classes.secret]: album.hiddenSecret !== null && album.hiddenSecret !== undefined
      })}>
        {album.coverPhoto && album.coverPhoto.uploadProcessed
          ? (<img src={album.coverPhoto.imgUrls.medium} alt="" />)
          : (<Skeleton variant="rectangular" width={240} height={160} />)}

        {timeDiff && timeDiff > 0 && timeDiff < 24 * 60 * 60 * 1000 && (
          <span className={classes.timer}>
            {(album.releaseTime as Date).getDate() === new Date().getDate() ? "Today" : "Tomorrow"}<br />
            {`${(album.releaseTime as Date).getHours().toString().padStart(2, '0')}:${(album.releaseTime as Date).getMinutes().toString().padStart(2, '0')}`}
          </span>
        )}

        {isNew && <NewReleases />}
      </div>

      <Typography variant="body1"><strong>{album.name}</strong></Typography>
      <Typography variant="caption">{relativeDate(album.timestamp)} • {album.photosCount} photos</Typography>
    </Stack>
  ) : (
    <Stack spacing={1} className={classes.placeholder}>
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
