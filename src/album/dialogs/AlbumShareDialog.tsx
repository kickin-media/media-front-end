import React from 'react';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';

import CopyIcon from '@mui/icons-material/ContentCopy';

import { AlbumType } from "../../redux/reducers/album";
import { useDispatch, useSelector } from "react-redux";
import { StateType } from "../../redux/reducers/reducers";
import slugify from "slugify";

import classes from './AlbumShareDialog.module.scss';

import * as actions from '../../redux/actions/album';
import { AnyAction } from "@reduxjs/toolkit";

const AlbumShareDialog: React.FC<Props> = ({ open, album, onShare, onClose }) => {
  const dispatch = useDispatch();
  const canCrud = useSelector((state: StateType) =>
    state.auth.authenticated && state.auth.scopes.includes('albums:manage'));

  const url = album.hiddenSecret
    ? `${window.location.origin}/album/${album.id}/${slugify(album.name)}?secret=${album.hiddenSecret}`
    : `${window.location.origin}/album/${album.id}/${slugify(album.name)}`;

  const onCopy = () => navigator.clipboard.writeText(url)
    .then(() => onClose())
    .catch(() => onClose());

  const onReset = () => dispatch(actions.updateHiddenStatus(album.id, true, true))
    .then((res: AnyAction) => {
      if (res.type !== actions.updateHiddenStatus.success) return;
      onClose();
    });

  return (
    <Dialog open={open}>
      <DialogTitle>Share album</DialogTitle>
      <DialogContent>
        {album.hiddenSecret && (
          <Alert className={classes.alert} severity="warning">
            Be cautious when sharing this album as it is a "hidden" album and anyone with the shared URL will be able to
            view the photos in this album.
          </Alert>
        )}

        {!('share' in navigator) && (
          <DialogContentText>
            Share this album by copying the link below:
          </DialogContentText>
        )}

        <div className={classes.copy}>
          <TextField value={url} />

          <Button color="primary" variant="contained" onClick={onCopy}>
            <CopyIcon />
          </Button>
        </div>
      </DialogContent>
      <DialogActions>
        {canCrud && <Button color="error" onClick={onReset}>Reset Secret</Button>}
        <Button color="secondary">Close</Button>
        {'share' in navigator && <Button onClick={onShare}>Share</Button>}
      </DialogActions>
    </Dialog>
  );
};

interface Props {
  open: boolean;
  album: AlbumType;

  onShare: () => void;
  onClose: () => void;
}

export default AlbumShareDialog;
