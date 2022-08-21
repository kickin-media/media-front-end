import React from 'react';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const CookieDialog: React.FC<Props> = ({ open, onClose }) => (
  <Dialog open={open}>
    <DialogTitle>We make use of cookies 🍪</DialogTitle>
    <DialogContent>
      <DialogContentText>
        They are purely functional and do not collect any data.
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Sounds good!</Button>
    </DialogActions>
  </Dialog>
);

interface Props {
  open: boolean;
  onClose: () => void;
}

export default CookieDialog;
