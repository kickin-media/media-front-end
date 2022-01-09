import React from 'react';

import classes from './Album.module.scss';

import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from "@mui/material/Typography";
import { AlbumType } from "../../redux/reducers/album";
import { useHistory } from "react-router-dom";

const Album: React.FC<Props> = ({ album }) => {
  const history = useHistory();

  return album ? (
    <Stack
      onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
        history.push(`/album/${album.id}/${album.name}`);
        e.preventDefault();
      }}
      component="a"
      href={`/album/${album.id}/${album.name}`}
      className={classes.album}
      spacing={1}
    >
      <img src="https://picsum.photos/300/200" alt="" width={240} height={160} />
      <Typography variant="body1"><strong>{album.name}</strong></Typography>
      <Typography variant="caption">12 uur geleden • Kick-In 2021</Typography>
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
