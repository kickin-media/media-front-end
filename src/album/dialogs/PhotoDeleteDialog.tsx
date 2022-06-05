import React, { useEffect, useState } from 'react';
import { useDispatch } from "react-redux";

import * as actions from '../../redux/actions/photo';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import LoadingButton from '@mui/lab/LoadingButton';

const PhotoDeleteDialog: React.FC<Props> = ({ photos, open, onClose }) => {
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => setLoading(false), [open]);

  const dispatch = useDispatch();

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        Are you sure you want to permanently delete {photos.length} {photos.length === 1 ? 'photo' : 'photos'}?
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          If these pictures are also used in other albums, then they will be removed from there as well.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <LoadingButton
          onClick={() => {
            setLoading(true);
            Promise.all(photos.map(id => dispatch(actions.remove(id)))).then(onClose);
          }}
          loading={loading}
          loadingIndicator="Loading..."
          color="error"
        >
          Delete {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}

interface Props {
  photos: string[];
  open: boolean;

  onClose: () => void;
}

export default PhotoDeleteDialog;
