import React, { MutableRefObject, useEffect, useMemo, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { renderDate } from "../../util/date";

import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";

import * as actions from '../../redux/actions/event';
import { AlbumType } from "../../redux/reducers/album";
import { StateType } from "../../redux/reducers/reducers";

const UploadAlbumForm: React.FC<Props> = ({ eventId, reference, onSubmit }) => {
  // Get and organize the data
  const dispatch = useDispatch();
  const albums = useSelector((state: StateType) => state.album, shallowEqual);

  useEffect(() => {
    if (eventId === null) return;
    dispatch(actions.getAlbums(eventId));
  }, [eventId, dispatch]);

  const processedAlbums = useMemo(() => Object.keys(albums)
    .map(id => albums[id])
    .filter((album: AlbumType) => album.eventId === eventId)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
    [eventId, albums]);

  // Form functions
  const reset = () => ({ albums: {} });

  const [values, setValues] = useState<FormValues>(reset());

  const canSubmit = (vals: FormValues = values) => Object.keys(vals)
    .filter(id => vals[id] === true)
    .every(id => albums[id] !== undefined);
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
      <FormGroup>
        {processedAlbums.map(album => (
          <FormControlLabel
            control={<Checkbox
              onChange={e => {
                const vals = { albums: Object.assign({}, values.albums, { [album.id]: e.target.checked }) };
                setValues(vals);
                submit(vals);
              }}
            />}
            label={
              <>
                {album.name}
                <span>{renderDate(album.timestamp, false)}</span>
              </>
            }
          />
        ))}
      </FormGroup>
    </>
  );
}

interface Props {
  eventId: string | null;
  reference?: MutableRefObject<UploadAlbumFormRef | null>;

  onSubmit?: (success: boolean, values: FormValues) => void;
}

export type UploadAlbumFormRef = {
  canSubmit: () => boolean;
  reset: () => void;
  submit: () => void;
}

interface FormValues {
  albums: { [key: string]: boolean };
}

export default UploadAlbumForm;
