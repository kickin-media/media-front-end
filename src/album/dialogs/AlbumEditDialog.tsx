import React, { useRef, useState } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import LoadingButton from '@mui/lab/LoadingButton';

import AlbumForm, { AlbumFormRef } from "../forms/AlbumForm";

import classes from './AlbumEditDialog.module.scss';

const AlbumEditDialog: React.FC<Props> = ({ albumId, open, onClose }) => {
  const formRef = useRef<AlbumFormRef>(null);

  const [loading, setLoading] = useState(false);

  return (
    <Dialog open={open ? open : false}>
      <DialogTitle>Create/Edit Album</DialogTitle>
      <DialogContent className={classes.form}>
        <AlbumForm albumId={albumId} reference={formRef} onSubmit={success => {
          setLoading(false);

          if (success) {
            if (formRef.current !== null) formRef.current.reset();
            if (onClose) onClose();
          }
        }} />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            if (formRef.current !== null) formRef.current.reset();
            if (onClose) onClose();
          }}
        >
          Cancel
        </Button>
        <LoadingButton
          onClick={() => {
            if (formRef.current === null) return;

            setLoading(true);
            formRef.current.submit();
          }}
          loading={loading}
          loadingIndicator="Loading..."
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

interface Props {
  albumId?: string;

  open?: boolean;
  onClose?: () => void;
}

export default AlbumEditDialog;
