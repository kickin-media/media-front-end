import React, { MutableRefObject, useState } from 'react';
import { useDispatch } from "react-redux";

import * as actions from '../../redux/actions/author';
import { AnyAction } from "@reduxjs/toolkit";
import { TextField } from "@mui/material";

const AuthorForm: React.FC<Props> = ({ reference, onSubmit }) => {
  const dispatch = useDispatch();

  const reset = () => {
    return { name: '' } as FormValues;
  };

  const [values, setValues] = useState<FormValues>(reset());
  const canSubmit = () => {
    return values.name !== '';
  };

  const submit = () => {
    if (!canSubmit()) {
      if (onSubmit) onSubmit(false);
      return;
    }

    dispatch(actions.update(values.name))
      .then((res: AnyAction) => {
        if (onSubmit) onSubmit(res.type === actions.update.success);
      });
  };

  if (reference !== undefined) reference.current = {
    reset: () => setValues(reset()),
    submit, canSubmit
  };

  return (
    <>
      <TextField
        onChange={e => setValues(v => Object.assign({}, v, { name: e.target.value }))}
        value={values.name}
        label="Name"
        variant="outlined"
      />
    </>
  )
};

interface Props {
  reference?: MutableRefObject<AuthorFormRef | null>;

  onSubmit?: (success: boolean) => void;
}

export type AuthorFormRef = {
  canSubmit: () => boolean;
  reset: () => void;
  submit: () => void;
}

interface FormValues {
  name: string;
}

export default AuthorForm;
