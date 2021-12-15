import React from 'react';

// import classes from './Album.module.scss';

import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from "@mui/material/Typography";

const Album: React.FC<Props> = ({ album }) => {
  return album ? (
    <Stack spacing={1}>
      <img src="https://picsum.photos/300/200" alt="" width={240} height={160} />
      <Typography variant="body1"><strong>Taste Cantus</strong></Typography>
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
  album: object | null;
}

export default Album;
