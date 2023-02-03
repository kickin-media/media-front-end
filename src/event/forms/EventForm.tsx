import React, { MutableRefObject, useEffect, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from "react-redux";

import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import TextField from "@mui/material/TextField";

import * as actions from '../../redux/actions/event';
import { AnyAction } from "@reduxjs/toolkit";
import { StateType } from "../../redux/reducers/reducers";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import PhotoUpload from "../../components/form/PhotoUpload";

const EventForm: React.FC<Props> = ({ eventId, reference, onSubmit }) => {
  const dispatch = useDispatch();
  const event = useSelector((state: StateType) => eventId ? state.event[eventId]: null, shallowEqual);
  useEffect(() => {
    if (!event) return;
    if (event.watermark) return;

    dispatch(actions.getWatermark(event.id)).then((res: AnyAction) => {
      if (res.type !== actions.getWatermark.success) return;
      setValues(v => ({...v, watermark: res.response.entities.eventWatermark.watermark}));
    });
  }, [dispatch, event]);

  const reset = () => {
    if (!eventId || event === null) return {
      eventId: '',
      name: '',
      timestamp: new Date(),
      locked: false,
      watermark: null
    } as FormValues;

    return {
      eventId: eventId,
      name: event.name,
      timestamp: event.timestamp,
      locked: event.locked,
      watermark: event.watermark ? event.watermark : null
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
      ? actions.update(eventId, values.name, values.timestamp, values.locked)
      : actions.create(values.name, values.timestamp, values.locked))
      .then((res: AnyAction) => {
        if (res.type === actions.update.request || res.type === actions.create.request) return;
        if (res.type === actions.update.failure || res.type === actions.create.failure) {
          if (onSubmit) onSubmit(false);
          return;
        }

        if (typeof values.watermark === 'string' && onSubmit)
          onSubmit(res.type === actions.update.success || res.type === actions.create.success);
        else {
          const id = eventId ? eventId : res.response.entities.event[res.response.result].id;
          if (values.watermark === null) dispatch(actions.deleteWatermark(id)).then((res: AnyAction) => {
            if (res.type === actions.deleteWatermark.request) return;
            if (onSubmit) onSubmit(
              res.type === actions.deleteWatermark.success
              || res.type === actions.deleteWatermark.success);
          });
          else dispatch(actions.createWatermark(id)).then((res: AnyAction) => {
            if (res.type === actions.createWatermark.request) return;
            if (res.type === actions.createWatermark.failure) {
              if (onSubmit) onSubmit(false);
              return;
            }

            const fields: { [key: string]: string } = res.response.fields;
            const formData = new FormData();
            Object.keys(fields).forEach(key => formData.append(key, fields[key]));

            const file = (values.watermark as File);
            file.arrayBuffer().then(data => {
              formData.append('file', new Blob([data], { type: 'image/png' }), file.name);
              return fetch(
                `${res.response.url}`, {
                  body: formData,
                  method: 'POST',
                }
              );
            }).then(res => {
              if (onSubmit) onSubmit(res.ok);
            })
          })
        }

      })
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
          ampm={false}
          ampmInClock={true}
          label="Date"
          value={values.timestamp}
          onChange={date => setValues({ ...values, timestamp: date as Date })}
        />
      </LocalizationProvider>

      <FormControlLabel
        control={
          <Switch
            checked={values.locked}
            onChange={() => setValues({ ...values, locked: !values.locked })}
          />
        }
        label="Is locked"
        title="A locked event cannot be edited"
      />

      <PhotoUpload
        label="Watermark"
        value={values.watermark}
        onChange={(v) => setValues({ ...values, watermark: v })}
      />
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

  locked: boolean;
  timestamp: Date;
  watermark: string | File | null;
}

export default EventForm;
