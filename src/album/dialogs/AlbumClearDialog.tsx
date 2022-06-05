import React, { useEffect, useState } from 'react';
import { useDispatch } from "react-redux";

import * as actions from '../../redux/actions/album';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import LoadingButton from '@mui/lab/LoadingButton';

const AlbumClearDialog: React.FC<Props> = ({ albumId, open, onClose }) => {
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => setLoading(false), [open]);

  const dispatch = useDispatch();

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Are you sure you want to remove all photos from this album?</DialogTitle>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <LoadingButton
          onClick={() => {
            setLoading(true);
            dispatch(actions.clear(albumId)).then(onClose);
          }}
          loading={loading}
          loadingIndicator="Loading..."
          color="error"
        >
          Remove all
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}

interface Props {
  albumId: string;
  open: boolean;

  onClose: () => void;
}

export default AlbumClearDialog;
