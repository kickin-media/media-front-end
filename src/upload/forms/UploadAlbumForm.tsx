import React, { MutableRefObject, useEffect, useMemo, useState } from 'react';

import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { StateType } from "../../redux/reducers/reducers";

import * as actions from '../../redux/actions/album';
import * as eventActions from '../../redux/actions/event';
import FormControl from "@mui/material/FormControl";
import { InputLabel, ListSubheader } from "@mui/material";
import { AlbumType } from "../../redux/reducers/album";

const UploadAlbumForm: React.FC<Props> = ({ reference, onSubmit }) => {
  // Get and organize the data
  const dispatch = useDispatch();
  const albums = useSelector((state: StateType) => state.album, shallowEqual);
  const events = useSelector((state: StateType) => state.event, shallowEqual);

  useEffect(() => {
    dispatch(actions.list());
    dispatch(eventActions.list());
  }, [dispatch]);

  const categorizedAlbums = useMemo(() => Object.keys(albums)
    .sort((a, b) => albums[b].timestamp.getTime() - albums[a].timestamp.getTime())
    .map(id => albums[id])
    .filter(album => events[album.eventId])
    .reduce((prev, album) => Object.assign({}, prev, { [album.eventId]: prev[album.eventId]
        ? [ ...prev[album.eventId], album ]
        : [  album ]}), {}),
    [albums, events]);

  // Form functions
  const reset = () => ({ albumId: '' });

  const [values, setValues] = useState<FormValues>(reset());

  const canSubmit = (vals: FormValues = values) => vals.albumId !== '' && albums[vals.albumId] !== undefined;
  const submit = (vals?: FormValues) => {
    if (vals === undefined) vals = values;

    if (!canSubmit(vals)) {
      if (onSubmit) onSubmit(false, vals);
      return;
    }

    if (onSubmit) onSubmit(true, vals);
  }

  if (reference !== undefined) reference.current = {
    reset: () => setValues(reset()),
    submit,
    canSubmit
  };

  return (
    <>
      <FormControl>
        <InputLabel id="form-upload-album-label">Album</InputLabel>
        <Select
          labelId="form-upload-album-label"
          label="Album"
          value={values.albumId}
          onChange={e => {
            setValues(v => ({ ...v, albumId: e.target.value}));
            submit({ ...values, albumId: e.target.value });
          }}
          fullWidth
        >
          {Object.keys(categorizedAlbums).map(eventId => [
            <ListSubheader key={`event-${eventId}`}>{events[eventId].name}</ListSubheader>,
            categorizedAlbums[eventId].map((album: AlbumType) => (
              <MenuItem key={`album-${album.id}`} value={album.id}>{album.name}</MenuItem>
            ))
          ]).flat()}
        </Select>
      </FormControl>
    </>
  );
}

interface Props {
  reference?: MutableRefObject<UploadAlbumFormRef | null>;

  onSubmit?: (success: boolean, values: FormValues) => void;
}

export type UploadAlbumFormRef = {
  canSubmit: () => boolean;
  reset: () => void;
  submit: () => void;
}

interface FormValues {
  albumId: string;
}

export default UploadAlbumForm;
