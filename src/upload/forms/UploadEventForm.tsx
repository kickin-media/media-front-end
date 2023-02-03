import React, { MutableRefObject, useEffect, useMemo, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";

import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';

import * as actions from '../../redux/actions/event';
import { StateType } from "../../redux/reducers/reducers";

const UploadEventForm: React.FC<Props> = ({ reference, onSubmit }) => {
  // Get and organize the data
  const dispatch = useDispatch();
  const events = useSelector((state: StateType) => state.event, shallowEqual);

  useEffect(() => {
    dispatch(actions.list());
  }, [dispatch]);

  const sortedEvents = useMemo(() => Object.keys(events)
    .map(id => events[id])
    .filter(event => !event.locked)
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
    [events]);

  // Form functions
  const reset = () => ({ eventId: '' });

  const [values, setValues] = useState<FormValues>(reset());

  const canSubmit = (vals: FormValues = values) => vals.eventId !== '' && events[vals.eventId] !== undefined;
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
    <FormControl>
      <RadioGroup
        onChange={e => {
          setValues(v => ({ ...v, eventId: e.target.value }));
          submit({ ...values, eventId: e.target.value });
        }}
        value={values.eventId}
      >
        {sortedEvents.map(event => (
          <FormControlLabel key={event.id} value={event.id} control={<Radio />} label={event.name} />
        ))}
      </RadioGroup>
    </FormControl>
  );
}

interface Props {
  reference?: MutableRefObject<UploadEventFormRef | null>;

  onSubmit?: (success: boolean, values: FormValues) => void;
}

export type UploadEventFormRef = {
  canSubmit: () => boolean;
  reset: () => void;
  submit: () => void;
}

interface FormValues {
  eventId: string;
}

export default UploadEventForm;
