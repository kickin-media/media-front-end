import React, { useEffect, useRef, useState } from 'react';
import EventForm, { EventFormRef } from "../forms/EventForm";
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";

import classes from './EventEditDialog.module.scss';
import Button from "@mui/material/Button";
import LoadingButton from "@mui/lab/LoadingButton";

const EventEditDialog: React.FC<Props> = ({ eventId, open, onClose }) => {
  const formRef = useRef<EventFormRef>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (formRef.current === null) return;
    if (open === false) return;

    formRef.current.reset();
  }, [open]);

  return (
    <Dialog open={open ? open : false}>
      <DialogTitle>Create/Edit Event</DialogTitle>
      <DialogContent className={classes.form}>
        <EventForm eventId={eventId} reference={formRef} />
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
}

interface Props {
  eventId?: string;

  open?: boolean;
  onClose?: () => void;
}

export default EventEditDialog;
