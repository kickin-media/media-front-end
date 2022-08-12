import React, { MutableRefObject, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from "react-redux";

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import TextField from "@mui/material/TextField";

import * as actions from '../../redux/actions/event';
import { AnyAction } from "@reduxjs/toolkit";
import { StateType } from "../../redux/reducers/reducers";

const EventForm: React.FC<Props> = ({ eventId, reference, onSubmit }) => {
  const dispatch = useDispatch();
  const event = useSelector((state: StateType) => eventId ? state.event[eventId]: null, shallowEqual);

  const reset = () => {
    if (!eventId || event === null) return {
      eventId: '',
      name: '',
      timestamp: new Date(),
    } as FormValues;

    return {
      eventId: eventId,
      name: event.name,
      timestamp: event.timestamp,
    };
  };

  const [values, setValues] = useState<FormValues>(reset());

  const canSubmit = () => values.name !== '';
  const submit = () => {
    if (!canSubmit()) {
      if (onSubmit) onSubmit(false);
      return;
    }

    dispatch(eventId
      ? actions.update(eventId, values.name, values.timestamp)
      : actions.create(values.name, values.timestamp))
      .then((res: AnyAction) => {
        if (onSubmit) onSubmit(res.type === actions.update.success || res.type === actions.create.success);
      });
  }

  if (reference !== undefined) reference.current = {
    reset: () => setValues(reset()),
    submit,
    canSubmit
  };

  return (
    <>
      <TextField
        onChange={e => setValues({ ...values, name: e.target.value })}
        value={values.name}
        label="Name"
        variant="outlined"
      />

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DateTimePicker
          renderInput={(props) => <TextField {...props} />}
          label="Date"
          value={values.timestamp}
          onChange={date => setValues({ ...values, timestamp: date as Date })}
        />
      </LocalizationProvider>
    </>
  );
}

interface Props {
  eventId?: string;

  reference?: MutableRefObject<EventFormRef | null>;

  onSubmit?: (success: boolean) => void;
}

export type EventFormRef = {
  canSubmit: () => boolean;
  reset: () => void;
  submit: () => void;
};

interface FormValues {
  name: string;
  eventId: string;

  timestamp: Date;
}

export default EventForm;
