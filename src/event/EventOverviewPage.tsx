import React, { useEffect, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { StateType } from "../redux/reducers/reducers";

import * as actions from '../redux/actions/event';
import { AnyAction } from "@reduxjs/toolkit";
import AlbumCarousel from "../album/components/AlbumCarousel";

import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import AlbumIcon from '@mui/icons-material/Collections';
import EventIcon from '@mui/icons-material/Event';

import { SpeedDial, SpeedDialAction } from "@mui/material";
import EventEditDialog from "./dialogs/EventEditDialog";
import AlbumEditDialog from "../album/dialogs/AlbumEditDialog";

const EventOverviewPage: React.FC = () => {
  const dispatch = useDispatch();
  const events = useSelector((state: StateType) => state.event, shallowEqual);
  const albums = useSelector((state: StateType) => state.album, shallowEqual);

  const [editAlbum, setEditAlbum] = useState<null | string>(null);
  const [editEvent, setEditEvent] = useState<null | string>(null);

  // Load all data on mount
  useEffect(() => {
    dispatch(actions.list())
      .then((eventResult: AnyAction) => {
        if (eventResult.type !== actions.list.success) return;

        eventResult.response.result
          .forEach((eventId: string) => dispatch(actions.getAlbums(eventId)));
      });
  }, [dispatch])

  return (
    <>
      {Object.keys(events)
        .filter(eventId => Object.keys(albums).some(albumId => albums[albumId].eventId === eventId))
        .map(eventId => (
          <AlbumCarousel
            key={eventId}
            title={events[eventId].name}
            albums={Object.keys(albums)
              .filter(albumId => albums[albumId].eventId === eventId)
              .map(albumId => albums[albumId])}
          />
      ))}

      <AlbumEditDialog
        albumId={editAlbum === null ? '' : editAlbum}
        open={editAlbum !== null}
        onClose={() => setEditAlbum(null)}
      />

      <EventEditDialog
        eventId={editEvent === null ? '' : editEvent}
        open={editEvent !== null}
        onClose={() => setEditEvent(null)}
      />

      <SpeedDial
        ariaLabel="Add Events/Albums"
        icon={<SpeedDialIcon />}
        color="secondary"
      >
        <SpeedDialAction
          icon={<AlbumIcon />}
          tooltipTitle="Add Album"
          onClick={() => setEditAlbum('')}
        />
        <SpeedDialAction
          icon={<EventIcon />}
          tooltipTitle="Add Event"
          onClick={() => setEditEvent('')}
        />
      </SpeedDial>
    </>
  );
};

export default EventOverviewPage;
