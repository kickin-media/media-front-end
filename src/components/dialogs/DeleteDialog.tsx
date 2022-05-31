import React, { useEffect, useState } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogTitle from '@mui/material/DialogTitle';
import LoadingButton from "@mui/lab/LoadingButton";

const DeleteDialog: React.FC<Props> = ({ open, onSuccess, onFail }) => {
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => setLoading(false), [open]);

  return (
    <Dialog open={open} onClose={onFail}>
      <DialogTitle>Are you sure you want to delete this object?</DialogTitle>
      <DialogActions>
        <Button onClick={onFail}>Cancel</Button>
        <LoadingButton
          onClick={() => {
            setLoading(true);
            onSuccess();
          }}
          loading={loading}
          loadingIndicator="Loading..."
          color="error"
        >
          Delete
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

interface Props {
  open: boolean;

  onSuccess: () => void;
  onFail: () => void;
}

export default DeleteDialog;
