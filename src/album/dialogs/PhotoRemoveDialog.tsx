import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

import * as actions from '../../redux/actions/photo';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import LoadingButton from '@mui/lab/LoadingButton';
import { AnyAction } from "@reduxjs/toolkit";
import { PhotoType } from "../../redux/reducers/photo";

const PhotoRemoveDialog: React.FC<Props> = ({ album, photos, open, onClose }) => {
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => setLoading(false), [open]);

  const dispatch = useDispatch();

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        Are you sure you want to remove the selected photos from the album?
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Note: These pictures are only removed from this albums and does not permanently delete them from other
          albums as well.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <LoadingButton
          onClick={() => {
            setLoading(true);
            Promise.all(photos.map(id => dispatch(actions.get(id))
              .then((res: AnyAction) => {
                const photo: PhotoType = res.response.entities.photo[id];
                if (!photo.albums) return [];
                return photo.albums.filter(albumId => albumId !== album);
              })
              .then(albums => dispatch(actions.setAlbums(id, albums)))
            )).then(onClose);
          }}
          loading={loading}
          loadingIndicator="Loading..."
          color="error"
        >
          Remove from album
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

interface Props {
  album: string;
  photos: string[];

  open: boolean;
  onClose: () => void;
}

export default PhotoRemoveDialog;
