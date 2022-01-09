import React from 'react';

import fnsDateAdapter from '@mui/lab/AdapterDateFns';

import Checkbox from '@mui/material/Checkbox';
import DateTimePicker from '@mui/lab/DateTimePicker';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import InputLabel from '@mui/material/InputLabel';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';

const AlbumForm: React.FC<Props> = ({ albumId }) => {

  return (
    <>
      <TextField label="Name" variant="outlined" />

      <FormControl fullWidth>
        <InputLabel id="form-album-event-label">Event</InputLabel>
        <Select
          labelId="form-album-event-label"
          label="Event"
        >
          <MenuItem value={0}>HUTS</MenuItem>
        </Select>
      </FormControl>

      <LocalizationProvider dateAdapter={fnsDateAdapter}>
        <DateTimePicker
          renderInput={(props) => <TextField {...props} />}
          label="Date"
          value={new Date()}
          onChange={() => {}}
        />
      </LocalizationProvider>

      <LocalizationProvider dateAdapter={fnsDateAdapter}>
        <DateTimePicker
          renderInput={(props) => <TextField {...props} />}
          label="Release date"
          value={new Date()}
          onChange={() => {}}
        />
      </LocalizationProvider>

      <FormGroup>
        <FormControlLabel control={<Checkbox />} label="Secret" />
        <FormControlLabel control={<Checkbox />} label="Refresh secret" />
      </FormGroup>
    </>
  );
};

interface Props {
  albumId?: number;
}

export default AlbumForm;
