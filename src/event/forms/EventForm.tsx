import React, { MutableRefObject, useState } from 'react';

import * as actions from '../../redux/actions/event';
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { StateType } from "../../redux/reducers/reducers";
import TextField from "@mui/material/TextField";
import fnsDateAdapter from "@mui/lab/AdapterDateFns";
import DateTimePicker from "@mui/lab/DateTimePicker";
import { LocalizationProvider } from "@mui/lab";

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
      : actions.create(values.name, values.timestamp));
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

      <LocalizationProvider dateAdapter={fnsDateAdapter}>
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
