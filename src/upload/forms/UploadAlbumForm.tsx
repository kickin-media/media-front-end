import React, { MutableRefObject, useEffect, useState } from 'react';

import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { useDispatch, useSelector } from "react-redux";
import { StateType } from "../../redux/reducers/reducers";

import * as actions from '../../redux/actions/album';
import FormControl from "@mui/material/FormControl";
import { InputLabel } from "@mui/material";

const UploadAlbumForm: React.FC<Props> = ({ reference, onSubmit }) => {
  const dispatch = useDispatch();
  const albums = useSelector((state: StateType) => state.album);

  useEffect(() => {
    dispatch(actions.list())
  }, [dispatch]);

  const reset = () => ({ albumId: '' });

  const [values, setValues] = useState<FormValues>(reset());

  const canSubmit = () => values.albumId !== '' && albums[values.albumId] !== undefined;
  const submit = () => {
    if (!canSubmit()) {
      if (onSubmit) onSubmit(false, values);
      return;
    }

    if (onSubmit) onSubmit(true, values);
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
          onChange={e => setValues(v => ({ ...v, albumId: e.target.value}))}
          fullWidth
        >
          {Object.keys(albums).map(id => (
            <MenuItem key={id} value={id}>{albums[id].name}</MenuItem>
          ))}
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
