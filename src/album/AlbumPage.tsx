import React, { useEffect, useMemo, useState } from 'react';
import { relativeDate } from "../util/date";
import slugify from "slugify";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";

import * as actions from '../redux/actions/album';
import { AnyAction } from "@reduxjs/toolkit";
import { StateType } from "../redux/reducers/reducers";

import Alert from '@mui/material/Alert';
import AlbumClearDialog from "./dialogs/AlbumClearDialog";
import AlbumEditDialog from "./dialogs/AlbumEditDialog";
import AlbumGallery from "./components/AlbumGallery";
import Badge from '@mui/material/Badge';
import Button from "@mui/material/Button";
import ButtonGroup from '@mui/material/ButtonGroup';
import CircularProgress from '@mui/material/CircularProgress';
import Container from "@mui/material/Container";
import DeleteDialog from "../components/dialogs/DeleteDialog";
import PhotoDeleteDialog from "./dialogs/PhotoDeleteDialog";
import { Region } from "../components/ui/AppUI";
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from "@mui/material/Typography";

import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import DeleteIcon from '@mui/icons-material/Delete';

import classes from './AlbumPage.module.scss';
import { trackEvent } from "../util/analytics";

const AlbumPage: React.FC = () => {
  const [clear, setClear] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);
  const [deleteOpen, setDelete] = useState<boolean>(false);

  const [selected, setSelected] = useState<{ [key: string]: boolean } | undefined>(undefined);
  const [removeSelected, setRemoveSelected] = useState<boolean>(false);

  const [sortMethod, setSortMethod] = useState<'chronological' | 'new' | 'mine'>('chronological');

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

  const uid = useSelector((state: StateType) => state.auth.authenticated ? state.auth.user.sub : 'nonexisting');

  const canUpload = useSelector((state: StateType) =>
    state.auth.authenticated && state.auth.scopes.includes('photos:upload'));

  const canCrud = useSelector((state: StateType) =>
    state.auth.authenticated && state.auth.scopes.includes('albums:manage'));

  useEffect(() => {
    dispatch(actions.get(albumId));
  }, [dispatch, albumId]);

  useEffect(() => {
    trackEvent('view_album', albumId);
  }, [albumId]);

  const processedPhotos = useMemo(() => photos.filter(photo => photo.uploadProcessed), [photos]);
  const sortedPhotos = useMemo(() => processedPhotos
    .filter(photo => sortMethod !== 'mine' || photo.author.id === uid)
    .sort((a, b) => {
      if (sortMethod === 'new') {
        if (a.uploadedAt === null) return -1;
        if (b.uploadedAt === null) return 1;

        const diff = b.uploadedAt.getTime() - a.uploadedAt.getTime();
        if (diff !== 0) return diff;

        if (a.timestamp === null) return -1;
        if (b.timestamp === null) return 1;

        return b.timestamp.getTime() - a.timestamp.getTime();
      } else {
        if (a.timestamp === null) return 1;
        if (b.timestamp === null) return -1;
        return a.timestamp.getTime() - b.timestamp.getTime();
      }
  }), [processedPhotos, uid, sortMethod]);
  const filteredPhotos = useMemo(() => selected === undefined || canCrud
    ? sortedPhotos
    : sortedPhotos.filter(photo => photo.author.id === uid),
    [selected, canCrud, sortedPhotos, uid]);

  const storedLastSeen = window.localStorage.getItem(`album-${albumId}`)
  const [lastSeen, setLastSeen] = useState<Date | null>(storedLastSeen === null
    ? null
    : new Date(storedLastSeen.split(" ")[0]));
  const newestPhoto = useMemo(() => new Date(Math.max(...photos
    .filter(photo => photo.uploadProcessed)
    .filter(photo => photo.uploadedAt !== null)
    // @ts-ignore
    .map(photo => photo.uploadedAt.getTime()))), [photos]);
  useEffect(() => {
    if (!newestPhoto) return;
    try {
      window.localStorage.setItem(`album-${albumId}`, newestPhoto.toISOString() + " " + (album ? album.photosCount : 0));
    } catch (RangeError) { }
  }, [albumId, album, newestPhoto]);
  const amountNew = useMemo(() => {
    if (lastSeen === null) return 0;
    return sortedPhotos.filter(photo => photo.uploadedAt !== null && photo.uploadedAt.getTime() > lastSeen.getTime()).length;
  }, [lastSeen, sortedPhotos]);

  if (!album || !event) return <CircularProgress />;

  const selectCount = selected === undefined
    ? 0
    : Object.keys(selected).filter(id => selected[id]).length;

  return (
    <>
      {album.coverPhoto && (
        <Region name="hero">
          <Container maxWidth="lg">
            <Typography variant="h2">{album.name}</Typography>
            <Typography>{relativeDate(album.timestamp)} ??? {event.name}</Typography>
          </Container>

          <img src={album.coverPhoto.imgUrls.large} alt="" />
          <img src={album.coverPhoto.imgUrls.large} alt="" />
        </Region>
      )}

      {album.hiddenSecret && (
        <Alert severity="warning">
          This is a <em>private</em> / <em>hidden</em> album, please be careful when sharing the URL or the secret.
        </Alert>
      )}

      {(photos.length !== processedPhotos.length && canUpload) && (
        <Alert severity="info">
          {photos.length - processedPhotos.length} photos are still being processed.
        </Alert>
      )}

      {(canCrud || canUpload) && (<div className={classes.actions}>
        <ButtonGroup variant="outlined">
          <Button
            onClick={() => setSelected(selected !== undefined ? undefined : {})}
            startIcon={selected !== undefined ? <CheckBoxIcon /> : <CheckBoxOutlinedIcon />}
          >
            Select
          </Button>
          {selected !== undefined && (
            <Button
              onClick={() => {
                if (selectCount === 0) setSelected(photos.map(photo => ({ [photo.id]: true }))
                  .reduce((a, b) => Object.assign({}, a, b), {}));
                else setSelected({});
              }}
              startIcon={<ClearAllIcon />}
            >
              {selectCount === 0 ? 'All' : 'Clear'}
            </Button>
          )}
        </ButtonGroup>

        {selected === undefined && canCrud ? (
          <ButtonGroup variant="outlined">
            <Button onClick={() => setEdit(true)}>Edit</Button>
            <Button onClick={() => setClear(true)} color="error">Clear</Button>
            <Button onClick={() => setDelete(true)} color="error">Delete</Button>
          </ButtonGroup>
        ) : (
          <Button
            onClick={() => setRemoveSelected(true)}
            startIcon={<DeleteIcon />}
            color="error"
            disabled={selectCount === 0}
            variant="contained"
          >
            Delete
          </Button>
        )}
      </div>)}

      <div className={classes.actions}>
        <ToggleButtonGroup
          onChange={(e, selected) =>
            setSortMethod((current ) => selected === null
              ? current
              : selected)}
          value={sortMethod}
          color="primary"
          exclusive
          size="small"
          className={classes['sort-menu']}
        >
          {canUpload && <ToggleButton value="mine">My Photos</ToggleButton>}
          <ToggleButton value="chronological">Chronological</ToggleButton>
          {amountNew > 0 ? (
            // @ts-ignore
            <Badge
              badgeContent={amountNew}
              color="primary"
              onClick={e => {
                setSortMethod('new');
                setLastSeen(newestPhoto);
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              <ToggleButton value="new">New first</ToggleButton>
            </Badge>
          ) : (
            <ToggleButton value="new">New first</ToggleButton>
          )}
        </ToggleButtonGroup>
      </div>

      <AlbumGallery
        album={album}
        photos={filteredPhotos}
        selected={selected}
        onSelect={(id) => setSelected(prev => Object.assign({}, prev, { [id]: true }))}
        onDeselect={(id) => setSelected(prev => Object.assign({}, prev, { [id]: false }))}
      />

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

      <PhotoDeleteDialog
        photos={selected === undefined ? [] : Object.keys(selected).filter(id => selected[id])}
        open={removeSelected}
        onClose={() => setRemoveSelected(false)}
      />
    </>
  );
}

export default AlbumPage;
