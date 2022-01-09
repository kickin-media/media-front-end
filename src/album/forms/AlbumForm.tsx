import React, { MutableRefObject, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

import fnsDateAdapter from '@mui/lab/AdapterDateFns';

import Checkbox from '@mui/material/Checkbox';
import DateTimePicker from '@mui/lab/DateTimePicker';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import InputLabel from '@mui/material/InputLabel';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';

import * as actions from '../../redux/actions/album';

const AlbumForm: React.FC<Props> = ({ albumId, reference, onSubmit }) => {
  const dispatch = useDispatch();
  const album = useSelector((state: any) => albumId ? state.album[albumId] : null, shallowEqual);

  const reset = () => {
    if (!albumId) return {
      name: '',
      eventId: '',

      timestamp: new Date(),
      release: null,

      secret: true
    } as FormValues;

    return {
      name: album.name,
      eventId: album.eventId,

      timestamp: album.timeStamp,
      release: album.releaseTime,

      secret: album.isSecret
    } as FormValues;
  };

  const [values, setValues] = useState<FormValues>(reset());

  const canSubmit = () => {
    if (!values.name) return false;
    if (values.eventId === '') return false;

    return !(values.release !== null && values.release.getTime() < values.timestamp.getTime());
  };

  const submit = () => {
    if (!canSubmit()) {
      if (onSubmit) onSubmit(false);
      return;
    }

    console.log(dispatch(albumId
      ? actions.update(albumId, values.name as string, values.timestamp, values.release, values.eventId)
      : actions.create(values.name, values.timestamp, values.release, values.eventId)));
  };

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

      <FormControl>
        <InputLabel id="form-album-event-label">Event</InputLabel>
        <Select
          labelId="form-album-event-label"
          label="Event"
          value={values.eventId}
          onChange={e => setValues({ ...values, eventId: e.target.value })}
        >
          <MenuItem value={0}>HUTS</MenuItem>
        </Select>
      </FormControl>

      <LocalizationProvider dateAdapter={fnsDateAdapter}>
        <DateTimePicker
          renderInput={(props) => <TextField {...props} />}
          label="Date"
          value={values.timestamp}
          onChange={date => setValues({ ...values, timestamp: date as Date })}
        />

        <FormControl component="fieldset" variant="standard">
          <FormLabel component="legend">Scheduled release</FormLabel>
          <FormControlLabel
            control={<Checkbox
              checked={values.release !== null}
              onChange={() => setValues({
                ...values,
                release: values.release === null
                  ? new Date(values.timestamp.getTime() + 1000 * 60 * 60 * 24)
                  : null
              })}
            />}
            label="Enable scheduled release"
          />
          <DateTimePicker
            renderInput={(props) => <TextField {...props} />}
            label="Release date"
            disabled={values.release === null}
            value={values.release === null ? values.timestamp : values.release}
            onChange={date => setValues({ ...values, release: date as Date })}
          />
        </FormControl>
      </LocalizationProvider>

      <FormControlLabel control={<Switch checked={values.secret} />} label="Is secret album" />
    </>
  );
};

interface Props {
  albumId?: string;

  reference?: MutableRefObject<AlbumFormRef | null>;

  onSubmit?: (success: boolean) => void;
}

export type AlbumFormRef = {
  canSubmit: () => boolean;
  reset: () => void;
  submit: () => void;
};

interface FormValues {
  name: string;
  eventId: string;

  timestamp: Date;
  release: Date | null;

  secret: boolean;
}

export default AlbumForm;
