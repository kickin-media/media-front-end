import React, { useContext, useEffect, useMemo, useState } from 'react';
import { relativeDate } from "../util/date";
import slugify from "slugify";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import useQuery from "../util/useQuery";

import * as actions from '../redux/actions/album';
import { AnyAction } from "@reduxjs/toolkit";
import { StateType } from "../redux/reducers/reducers";

import Alert from '@mui/material/Alert';
import AlbumAddDialog from './dialogs/AlbumAddDialog';
import AlbumClearDialog from "./dialogs/AlbumClearDialog";
import AlbumEditDialog from "./dialogs/AlbumEditDialog";
import AlbumGallery from "./components/AlbumGallery";
import AlbumShareDialog from "./dialogs/AlbumShareDialog";
import Badge from '@mui/material/Badge';
import Button from "@mui/material/Button";
import ButtonGroup from '@mui/material/ButtonGroup';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Container from "@mui/material/Container";
import Divider from '@mui/material/Divider';
import DeleteDialog from "../components/dialogs/DeleteDialog";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import PhotoDeleteDialog from "./dialogs/PhotoDeleteDialog";
import PhotoRemoveDialog from "./dialogs/PhotoRemoveDialog";
import PhotoReprocessDialog from "./dialogs/PhotoReprocessDialog";
import Popover from '@mui/material/Popover';
import { Region } from "../components/ui/AppUI";
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from "@mui/material/Typography";

import CalendarIcon from '@mui/icons-material/CalendarToday';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PanoramaWideAngleIcon from '@mui/icons-material/PanoramaWideAngle';
import PlaylistRemoveIcon from '@mui/icons-material/PlaylistRemove';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ShareIcon from '@mui/icons-material/Share';
import TrendIcon from '@mui/icons-material/TrendingUp';

import classes from './AlbumPage.module.scss';
import AuthorFilterForm from "./forms/AuthorFilterForm";
import { renderNumber } from "../util/number";
import { BreadcrumbContext } from "../components/ui/Breadcrumb";

const AlbumPage: React.FC = () => {
  const [editMenu, setEditMenu] = useState<HTMLButtonElement | null>(null);
  const [clear, setClear] = useState<boolean>(false);
  const [edit, setEdit] = useState<boolean>(false);
  const [deleteOpen, setDelete] = useState<boolean>(false);

  const [selected, setSelected] = useState<{ [key: string]: boolean } | undefined>(undefined);
  const [selectMenu, setSelectMenu] = useState<HTMLButtonElement | null>(null);
  const [addAlbums, setAddAlbums] = useState<boolean>(false);
  const [deleteSelected, setDeleteSelected] = useState<boolean>(false);
  const [removeSelected, setRemoveSelected] = useState<boolean>(false);
  const [reprocessSelected, setReprocessSelected] = useState<boolean>(false);

  const [authorFilter, setAuthorFilter] = useState<string[] | null>(null);
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

  // Retrieve a potential secret key from the url
  const query = useQuery();
  const secret = query['secret'];

  // Load the album
  useEffect(() => {
    dispatch(actions.get(albumId, secret));
  }, [dispatch, albumId, secret]);

  const processedPhotos = useMemo(() => photos.filter(photo => photo.uploadProcessed), [photos]);
  const visiblePhotos = useMemo(() => canUpload ? photos : processedPhotos, [canUpload, photos, processedPhotos]);
  const authorPhotos = useMemo(() => authorFilter === null
    ? visiblePhotos
    : visiblePhotos.filter(photo => authorFilter.indexOf(photo.author.id) > -1),
    [visiblePhotos, authorFilter])
  const sortedPhotos = useMemo(() => authorPhotos
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
  }), [authorPhotos, uid, sortMethod]);
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

  // Update the album view count
  const effectiveId = useMemo(() => album ? album.id : null, [album]);
  useEffect(() => {
    if (effectiveId === null) return;
    dispatch(actions.increaseViewCount(effectiveId));
  }, [dispatch, effectiveId]);

  const [shareDialog, setShareDialog] = useState<boolean>(false);

  const setBreadcrumb = useContext(BreadcrumbContext).setPath;
  useEffect(() => {
    if (!event || !album) return;
    setBreadcrumb(
      { name: event.name, href: `/event/${event.id}/${slugify(event?.name)}`},
      { name: album.name, href: `/album/${album.id}/${slugify(album.name).toLowerCase()}`});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [album, event]);

  if (!album || !event) return <CircularProgress />;

  const selectCount = selected === undefined
    ? 0
    : Object.keys(selected).filter(id => selected[id]).length;

  const onShare = () => {
    if (album.hiddenSecret || !('share' in navigator)) setShareDialog(true);
    else doShare();
  };

  const doShare = () => {
    if (!('share' in navigator)) {
      console.warn('Web Share API not supported in this browser');
      return;
    }

    setShareDialog(false);
    navigator.share({
      title: 'Kick-In Media - ' + album.name,
      text: `Check out this photo album from the Kick-In: "${album.name}"`,
      url: album.hiddenSecret
        ? `${window.location.origin}/album/${album.id}/${slugify(album.name)}?secret=${album.hiddenSecret}`
        : `${window.location.origin}/album/${album.id}/${slugify(album.name)}`
    });
  };

  return (
    <>
      {album.coverPhoto && album.coverPhoto.uploadProcessed && (
        <Region name="hero">
          <Container maxWidth="lg" className={classes.hero}>
            <Typography variant="h2">{album.name}</Typography>
            <Chip label={event.name} color="primary" size="small" />
            <Chip icon={<CalendarIcon />} label={relativeDate(album.timestamp)} color="primary" size="small" />
            <Chip icon={<TrendIcon />} label={`${renderNumber(album.views)} views`} color="primary" size="small" />
          </Container>

          {/*<img src={album.coverPhoto.imgUrls.large} alt="" />*/}
          <img src={album.coverPhoto.imgUrls.large} alt="" />
        </Region>
      )}

      <div className={classes.alerts}>
        {album.hiddenSecret && (
          <Alert severity="warning">
            This is a <em>private</em> / <em>hidden</em> album, please be careful when sharing the URL or the secret.
          </Alert>
        )}

        {canCrud && album.releaseTime !== null && album.releaseTime.getTime() >= new Date().getTime() && (
          <Alert severity="warning">
            This album is not released yet, it will be released on {album.releaseTime.toLocaleDateString()} at{' '}
            {album.releaseTime.toLocaleTimeString()}.
          </Alert>
        )}

        {(photos.length !== processedPhotos.length && canUpload) && (
          <Alert severity="info">
            {photos.length - processedPhotos.length} photos are still being processed.
          </Alert>
        )}
      </div>

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
                if (selectCount === 0) setSelected(filteredPhotos
                    .map(photo => ({ [photo.id]: true }))
                    .reduce((a, b) => Object.assign({}, a, b), {})
                  );
                else setSelected({});
              }}
              startIcon={<ClearAllIcon />}
            >
              {selectCount === 0 ? 'All' : 'Clear'}
            </Button>
          )}
        </ButtonGroup>

        {selected === undefined && canCrud ? (
          <>
            <ButtonGroup color="secondary" variant="outlined">
              <Button onClick={() => setEdit(true)}>Edit</Button>
              <Button
                onClick={(e) => setEditMenu(e.currentTarget)}
              >
                <MoreVertIcon />
              </Button>
            </ButtonGroup>
            <Popover
              open={editMenu !== null}
              onClose={() => setEditMenu(null)}
              anchorEl={editMenu}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuList>
                <MenuItem onClick={() => {
                  setEditMenu(null);
                  setClear(true);
                }}>
                  <ListItemIcon><PlaylistRemoveIcon /></ListItemIcon>
                  <ListItemText primary="Empty" secondary="Remove all photos from this album" />
                </MenuItem>
                <MenuItem onClick={() => {
                  setEditMenu(null);
                  setDelete(true);
                }}>
                  <ListItemIcon><DeleteIcon /></ListItemIcon>
                  <ListItemText primary="Delete" secondary="Delete the album" />
                </MenuItem>
              </MenuList>
            </Popover>
          </>
        ) : (
          <>
            <ButtonGroup color="secondary" variant="outlined">
              <Button
                onClick={() => setAddAlbums(true)}
                startIcon={<LibraryAddIcon />}
                disabled={selectCount === 0}
              >
                Add to Albums
              </Button>
              <Button
                onClick={(e) => setSelectMenu(e.currentTarget)}
                disabled={selectCount === 0}
              >
                <MoreVertIcon />
              </Button>
            </ButtonGroup>
            <Popover
              open={selectMenu !== null}
              onClose={() => setSelectMenu(null)}
              anchorEl={selectMenu}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuList>
                <MenuItem disabled={selectCount !== 1} onClick={() => {
                  setSelectMenu(null);
                  if (selected === undefined) return;
                  dispatch(actions.updateAlbumCover(
                    albumId,
                    Object.keys(selected).filter(key => selected[key])[0]
                  ));
                }}>
                  <ListItemIcon><PanoramaWideAngleIcon /></ListItemIcon>
                  <ListItemText primary="Set album cover" />
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => {
                  setSelectMenu(null);
                  setReprocessSelected(true);
                }}>
                  <ListItemIcon><RestartAltIcon /></ListItemIcon>
                  <ListItemText primary="Re-process" secondary="Re-generates photos and watermarks" />
                </MenuItem>
                <MenuItem onClick={() => {
                  setSelectMenu(null);
                  setRemoveSelected(true);
                }}>
                  <ListItemIcon><DeleteIcon /></ListItemIcon>
                  <ListItemText primary="Remove" secondary="Remove photos from just this album" />
                </MenuItem>
                <MenuItem onClick={() => {
                  setSelectMenu(null);
                  setDeleteSelected(true);
                }}>
                  <ListItemIcon><DeleteForeverIcon /></ListItemIcon>
                  <ListItemText color="error" primary="Delete" secondary="Permanently delete photos from all albums" />
                </MenuItem>
              </MenuList>
            </Popover>
          </>
        )}
      </div>)}

      <div className={classes.actions}>
        <IconButton style={{ marginRight: 8 }} onClick={onShare}><ShareIcon /></IconButton>

        <AuthorFilterForm photos={processedPhotos} onChange={authors => setAuthorFilter(authors)} />

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
          <ToggleButton value="chronological">Original</ToggleButton>
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
              <ToggleButton value="new">New First</ToggleButton>
            </Badge>
          ) : (
            <ToggleButton value="new">New First</ToggleButton>
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

      <AlbumShareDialog open={shareDialog} album={album} onShare={doShare} onClose={() => setShareDialog(false)} />

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

      <AlbumAddDialog
        eventId={event.id}
        photos={selected ? Object.keys(selected).filter(id => selected[id]) : []}
        open={addAlbums}
        onClose={() => setAddAlbums(false)}
      />
      <PhotoRemoveDialog
        album={albumId}
        photos={selected === undefined ? [] : Object.keys(selected).filter(id => selected[id])}
        open={removeSelected}
        onClose={() => {
          setRemoveSelected(false);
          setSelected(undefined);
        }}
      />
      <PhotoDeleteDialog
        photos={selected === undefined ? [] : Object.keys(selected).filter(id => selected[id])}
        open={deleteSelected}
        onClose={() => {
          setDeleteSelected(false);
          setSelected(undefined);
        }}
      />
      <PhotoReprocessDialog
        photos={selected === undefined ? [] : Object.keys(selected).filter(id => selected[id])}
        open={reprocessSelected}
        onClose={() => {
          setReprocessSelected(false);
          setSelected(undefined);
        }}
      />
    </>
  );
}

export default AlbumPage;
