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

const PhotoReprocessDialog: React.FC<Props> = ({ photos, open, onClose }) => {
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => setLoading(false), [open]);

  const dispatch = useDispatch();

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        Are you sure?
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Reprocessing photos is computationally expensive, only do this if the photos are corrupt, the watermarks need
          to be updated or if there is some other issue.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <LoadingButton
          onClick={() => {
            setLoading(true);
            Promise.all(photos.map(id => dispatch(actions.reprocess(id)))).then(onClose);
          }}
          loading={loading}
          loadingIndicator="Loading..."
          color="error"
        >
          Reprocess {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
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

export default PhotoReprocessDialog;
