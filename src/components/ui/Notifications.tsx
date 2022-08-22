import React, { useState } from 'react';
import { useDispatch, useSelector } from "react-redux";

import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Snackbar from '@mui/material/Snackbar';

import CloseIcon from '@mui/icons-material/Close';

import * as actions from '../../redux/actions/ui';
import { StateType } from "../../redux/reducers/reducers";

const Notifications: React.FC = () => {
  const [open, setOpen] = useState<boolean>(true);

  const dispatch = useDispatch();
  const notifications = useSelector((state: StateType) => state.ui.notifications);
  if (notifications.length === 0) {
    if (!open) setOpen(true);
    return null;
  }

  const n = notifications[0];

  const handleClose = () => {
    setOpen(false);
    window.setTimeout(() => {
      dispatch(actions.deleteNotification(n.id));
      setOpen(true);
    }, 750);
  };

  console.log(n);

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      open={open}
      autoHideDuration={6000}
      message={n.text}
      action={
        <>
          {n.action && <Button color="error" size="small" onClick={n.action}>{n.actionText}</Button>}
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </>
      }
    />
  );
}

export default Notifications;
