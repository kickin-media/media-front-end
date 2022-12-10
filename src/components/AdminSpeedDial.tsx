import React, { useState } from 'react';
import { useSelector } from "react-redux";
import { StateType } from "../redux/reducers/reducers";

import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialAction from '@mui/material/SpeedDialAction'

import AlbumIcon from '@mui/icons-material/Collections';
import EventIcon from '@mui/icons-material/Event';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import UploadIcon from '@mui/icons-material/Upload';

import classes from './AdminSpeedDial.module.scss';
import { useHistory } from "react-router-dom";
import AlbumEditDialog from "../album/dialogs/AlbumEditDialog";
import EventEditDialog from "../event/dialogs/EventEditDialog";

const AdminSpeedDial: React.FC = () => {
  const history = useHistory();

  const [album, setAlbum] = useState(false);
  const [event, setEvent] = useState(false);

  const scopes = useSelector((state: StateType) => state.auth.authenticated ? state.auth.scopes : null);
  if (scopes === null) return null;
  const hasScope = (scope: string) => scopes.includes(scope);

  return (
    <>
      <SpeedDial
        ariaLabel="Admin actions"
        className={classes['speed-dial']}
        icon={<SpeedDialIcon />}
      >
        {hasScope('photos:upload') && (
          <SpeedDialAction
            icon={<UploadIcon />}
            tooltipTitle="Upload photos"
            onClick={() => history.push('/upload/')}
          />
        )}
        {hasScope('albums:manage') && (
          <SpeedDialAction
            icon={<AlbumIcon />}
            tooltipTitle="Create new album"
            onClick={() => setAlbum(true)}
          />
        )}
        {hasScope('events:manage') && (
          <SpeedDialAction
            icon={<EventIcon />}
            tooltipTitle="Create new event"
            onClick={() => setEvent(true)}
          />
        )}
      </SpeedDial>

      <AlbumEditDialog open={album} onClose={() => setAlbum(false)} />
      <EventEditDialog open={event} onClose={() => setEvent(false)} />
    </>
  );
};

export default AdminSpeedDial;
