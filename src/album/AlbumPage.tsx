import React, { useEffect, useMemo, useState } from 'react';

import { Region } from "../components/ui/AppUI";

import AlbumEditDialog from "./dialogs/AlbumEditDialog";
import { useHistory, useParams } from "react-router-dom";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { StateType } from "../redux/reducers/reducers";

import * as actions from '../redux/actions/album';
import AlbumGallery from "./components/AlbumGallery";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { Alert, ButtonGroup, CircularProgress } from "@mui/material";
import { relativeDate } from "../util/date";

import classes from './AlbumPage.module.scss';
import Button from "@mui/material/Button";
import DeleteDialog from "../components/dialogs/DeleteDialog";
import { AnyAction } from "@reduxjs/toolkit";
import slugify from "slugify";
import AlbumClearDialog from "./dialogs/AlbumClearDialog";

const AlbumPage: React.FC = () => {
  const [clear, setClear] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);
  const [deleteOpen, setDelete] = useState<boolean>(false);

  const { albumId } = useParams<{ albumId: string }>();
  const history = useHistory();

  const dispatch = useDispatch();
  const album = useSelector((state: StateType) => state.album[albumId], shallowEqual);
  const event = useSelector((state: StateType) => state.album[albumId]
    ? state.event[state.album[albumId].eventId]
    : null, shallowEqual);
  const photos = useSelector((state: StateType) => album && album.photos
    ? album.photos.map(photo => state.photo[photo])
    : [], shallowEqual);

  const canUpload = useSelector((state: StateType) =>
    state.auth.authenticated && state.auth.scopes.includes('photos:upload'));

  const canCrud = useSelector((state: StateType) =>
    state.auth.authenticated && state.auth.scopes.includes('album:manage'));

  useEffect(() => {
    dispatch(actions.get(albumId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const sortedPhotos = useMemo(() => photos
    .filter(photo => photo.uploadProcessed)
    .sort((a, b) => {
      if (a.timestamp === null) return 1;
      if (b.timestamp === null) return -1;
      return a.timestamp.getTime() - b.timestamp.getTime();
  }), [photos]);

  if (!album || !event) return <CircularProgress />;

  return (
    <>
      {album.coverPhoto && (
        <Region name="hero">
          <Container maxWidth="lg">
            <Typography variant="h2">{album.name}</Typography>
            <Typography>{relativeDate(album.timestamp)} • {event.name}</Typography>
          </Container>

          <img src={album.coverPhoto.imgUrls.large} alt="" />
          <img src={album.coverPhoto.imgUrls.large} alt="" />
        </Region>
      )}

      {(photos.length !== sortedPhotos.length && canUpload) && (
        <Alert severity="info">
          {photos.length - sortedPhotos.length} photos are still being processed.
        </Alert>
      )}

      {canCrud && (<div className={classes.actions}>
        <ButtonGroup variant="outlined">
          <Button onClick={() => setEdit(true)}>Edit</Button>
          <Button onClick={() => setClear(true)}>Clear</Button>
          <Button onClick={() => setDelete(true)}>Delete</Button>
        </ButtonGroup>
      </div>)}

      <AlbumGallery album={album} photos={sortedPhotos} />

      <AlbumEditDialog albumId={albumId} open={edit} onClose={() => setEdit(false)} />
      <AlbumClearDialog albumId={albumId} open={clear} onClose={() => setClear(false)} />
      <DeleteDialog
        open={deleteOpen}
        onFail={() => setDelete(false)}
        onSuccess={() => dispatch(actions.remove(album.id)).then((res: AnyAction) => {
          setDelete(false);
          if (res.type.endsWith('_FAILURE')) return;
          history.push(`/event/${event.id}/${slugify(event.name)}`);
        })}
      />
    </>
  );
}

export default AlbumPage;
