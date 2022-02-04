import React, { useRef, useState } from 'react';
import AuthorForm, { AuthorFormRef } from "../forms/AuthorForm";
import { Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";

const AuthorDialog: React.FC<Props> = ({ open, onClose }) => {
  const formRef = useRef<AuthorFormRef>(null);

  const [loading, setLoading] = useState(false);

  return (
    <Dialog open={open ? open : false}>
      <DialogTitle>Update Author</DialogTitle>
      <DialogContent>
        <AuthorForm reference={formRef} onSubmit={success => {
          setLoading(false);

          if (success) {
            if (formRef.current !== null) formRef.current.reset();
            if (onClose) onClose();
          }
        }} />
      </DialogContent>
      <DialogActions>
        <LoadingButton
          onClick={() => {
            if (formRef.current === null) return;
            setLoading(true);
            formRef.current.submit();
          }}
          loading={loading}
          loadingIndicator="Loading..."
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
};

interface Props {
  open?: boolean;

  onClose?: () => void;
}

export default AuthorDialog;
