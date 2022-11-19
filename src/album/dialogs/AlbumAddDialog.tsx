import React, { useEffect, useRef, useState } from 'react';
import { useDispatch } from "react-redux";

import * as actions from '../../redux/actions/photo';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import LoadingButton from '@mui/lab/LoadingButton';
import UploadAlbumForm, { UploadAlbumFormRef } from "../../upload/forms/UploadAlbumForm";

import classes from './AlbumAddDialog.module.scss';
import { AnyAction } from "@reduxjs/toolkit";

const AlbumAddDialog: React.FC<Props> = ({ photos, eventId, open, onClose }) => {
  const albumFormRef = useRef<UploadAlbumFormRef>(null);

  const [albums, setAlbums] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => setLoading(false), [open]);

  const dispatch = useDispatch();
  const onAddAlbum = () => {
    setLoading(true);
    photos.forEach((photo, index) => dispatch(actions.get(photo)).then((res: AnyAction) => {
      if (res.type === actions.get.request) return;
      if (res.type === actions.get.failure) return Promise.reject();

      const curAlbums = res.response.entities.photo[photo].albums;
      return dispatch(actions.setAlbums(photo, Array.from(new Set([...curAlbums, ...albums]))))
        .then((res: AnyAction) => {
          if (res.type !== actions.setAlbums.success) return;
          if (index !== photos.length - 1) return;
          onClose();
        });
    }));
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (loading) return;
        onClose();
      }}
    >
      <DialogTitle>Add photos to other albums</DialogTitle>
      <DialogContent className={classes.content}>
        <DialogContentText>
          Select additional albums to which the {photos.length} photo{photos.length === 1 ? '' : 's'} should be added:
        </DialogContentText>
        <UploadAlbumForm eventId={eventId} reference={albumFormRef} onSubmit={(success, values) => {
          if (!success) return;
          setAlbums(Object.keys(values.albums).filter(id => values.albums[id]));
        }} />
      </DialogContent>
      <DialogActions>
        <Button disabled={loading} onClick={onClose}>Cancel</Button>
        <LoadingButton
          onClick={onAddAlbum}
          loading={loading}
          loadingIndicator="Loading..."
          color="secondary"
        >
          Add
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

interface Props {
  eventId: string | null;
  photos: string[];

  open: boolean;
  onClose: () => void;
}

export default AlbumAddDialog;
