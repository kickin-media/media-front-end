import React, { useRef } from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

import UploadAlbumForm, { UploadAlbumFormRef } from "../forms/UploadAlbumForm";

const UploadAlbumDialog: React.FC<Props> = ({ open, onClose, onSubmit }) => {
  const formRef = useRef<UploadAlbumFormRef>(null);

  return (
    <Dialog open={open ? open : false}>
      <DialogTitle>Add album to batch</DialogTitle>
      <DialogContent>
        <UploadAlbumForm reference={formRef} onSubmit={(success, values) => {
          if (!success) return;
          if (onSubmit) onSubmit(values.albumId);
          if (onClose) onClose();
          if (formRef.current !== null) formRef.current.reset();
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
        <Button
          onClick={() => {
            if (formRef.current === null) return;
            formRef.current.submit();
          }}
        >
          Select
        </Button>
      </DialogActions>
    </Dialog>
  );
};

interface Props {
  onSubmit?: (albumId: string) => void;

  open?: boolean;
  onClose?: () => void;
}

export default UploadAlbumDialog;
