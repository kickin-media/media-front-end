import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { trackEvent } from "../../util/analytics";
import slugify from "slugify";

import Divider from '@mui/material/Divider';
import IconButton from "@mui/material/IconButton";
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from "@mui/material/MenuItem";
import Modal from '@mui/material/Modal';
import SwipeableViews from "react-swipeable-views";

import Close from '@mui/icons-material/Close';
import Download from '@mui/icons-material/Download';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import PanoramaWideAngle from '@mui/icons-material/Panorama';
import PhotoSizeSelectSmall from '@mui/icons-material/PhotoSizeSelectSmall';
import PhotoSizeSelectLarge from '@mui/icons-material/PhotoSizeSelectLarge';
import PhotoSizeSelectActual from '@mui/icons-material/PhotoSizeSelectActual';
import RawOn from '@mui/icons-material/RawOn';
import Settings from '@mui/icons-material/Settings';
import ShareIcon from '@mui/icons-material/Share';

import classes from './Lightbox.module.scss';
import { PhotoType } from "../../redux/reducers/photo";
import { AlbumType } from "../../redux/reducers/album";
import { StateType } from "../../redux/reducers/reducers";

import * as photoActions from '../../redux/actions/photo';
import * as albumActions from '../../redux/actions/album';
import { AnyAction } from "@reduxjs/toolkit";

const Lightbox: React.FC<Props> = ({ open, album, photos, startId, onChange, onClose }) => {
  const [index, setIndex] = useState(0);
  const [prevOpen, setOpen] = useState(open !== undefined ? open: false);

  const [loaded, setLoaded] = useState<{ [key: string]: boolean }>({});

  const [downloadMenu, setDownloadMenu] = useState<null | HTMLElement>(null);
  const [settingsMenu, setSettingsMenu] = useState<null | HTMLElement>(null);

  useEffect(() => {
    if (open === prevOpen) return;
    if (open && startId === null) return;
    setOpen(open !== undefined ? open: false);

    if (open && startId !== null) setIndex(photos.map(photo => photo.id).indexOf(startId));
    else setIndex(0);
  }, [prevOpen, open, startId, photos]);

  useEffect(() => {
    if (!open) return;
    if (startId === null) return;
    if (photos.length === 0) return;

    setIndex(photos.map(photo => photo.id).indexOf(startId));
  }, [open, startId, photos]);

  useEffect(() => {
    if (!open) return;

    for (let i = index - 1; i <= index + 1; i++) {
      if (i < 0) continue;
      if (i >= photos.length) continue;

      setLoaded(l => Object.assign({}, l, { [photos[i].id]: true }));
    }
  }, [open, index, photos]);

  const dispatch = useDispatch();
  const canCrud = useSelector((state: StateType) =>
    state.auth.authenticated && state.auth.scopes.includes('albums:manage'));
  const canDownload = useSelector((state: StateType) =>
    state.auth.authenticated && state.auth.scopes.includes('photos:download_other'));

  // Download
  const onDownload = (photoId: string, url: string) => (e) => {
    trackEvent('download', photoId);
    downloadPhoto(photoId, url);
    setDownloadMenu(null);
    e.stopPropagation();
    e.preventDefault();
  };
  const onDownloadOriginal = (photoId: string) => (e) => {
    e.stopPropagation();
    e.preventDefault();
    setDownloadMenu(null);
    trackEvent('download', photoId);
    // noinspection DuplicatedCode
    dispatch(photoActions.getOriginal(photoId))
      .then((res: AnyAction) => {
        if (res.type !== photoActions.getOriginal.success) return Promise.reject();
        return downloadPhoto(photoId, res.response.downloadUrl);
      });
  };
  const downloadPhoto = (photoId: string, url: string) => fetch(url)
    .then((res: Response) => res.blob())
    .then((blob: Blob) => URL.createObjectURL(blob))
    .then((url: string) => {
      const root = document.getElementsByClassName(classes.root)[0];
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${slugify(album.name).toLowerCase()}-${photoId}.jpg`;
      anchor.className = classes.download;

      root.appendChild(anchor);
      anchor.click();
      root.removeChild(anchor);
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    });

  // Share
  const onShare = (photoId: string, url: string) => fetch(url)
    .then((res: Response) => res.blob())
    .then(blob => new File(
      [blob],
      `${slugify(album.name).toLowerCase()}-${photoId}.jpg`,
      {
        type: "image/jpeg",
        lastModified: new Date().getTime()
      }))
    .then(file => navigator.share({
      title: 'Kick-In Media - ' + album.name,
      files: [file]
    }));

  const moveTo = (index: number) => setIndex(() => {
    if (onChange) onChange(photos[index].id);
    return index;
  });

  const update = (delta: number) => setIndex(prev => {
    let nextIndex = prev + delta;
    if (nextIndex < 0) nextIndex = 0;
    if (nextIndex >= photos.length) nextIndex = photos.length - 1;

    if (onChange) onChange(photos[nextIndex].id);

    return nextIndex;
  });

  return (
    <Modal
      open={prevOpen}
      onClose={onClose}
      onKeyDown={e => {
        if (e.key === 'ArrowLeft') update(-1);
        if (e.key === 'ArrowRight') update(1);
        else return;

        e.stopPropagation();
      }}
    >
      <div className={classes.root} onClick={() => {
        if (onClose) onClose();
      }}>
        <div className={classes.actions}>
          {/*<IconButton><Info /></IconButton>*/}

          {'share' in navigator && (
            <IconButton onClick={(e) => {
              onShare(photos[index].id, photos[index].imgUrls.large);
              e.stopPropagation();
              e.preventDefault();
            }}>
              <ShareIcon />
            </IconButton>
          )}

          <IconButton onClick={(e) => {
            setDownloadMenu(e.currentTarget);
            e.stopPropagation();
            e.preventDefault();
          }}>
            <Download />
          </IconButton>
          <Menu
            open={downloadMenu !== null}
            onClose={(e: React.MouseEvent) => {
              setDownloadMenu(null);
              e.stopPropagation();
            }}
            anchorEl={downloadMenu}
          >
            {photos[index] ? (
              <>
                <MenuItem onClick={onDownload(photos[index].id, photos[index].imgUrls.small)}>
                  <ListItemIcon><PhotoSizeSelectSmall /></ListItemIcon>
                  <ListItemText primary="Small" secondary="400px" />
                </MenuItem>
                <MenuItem onClick={onDownload(photos[index].id, photos[index].imgUrls.medium)}>
                  <ListItemIcon><PhotoSizeSelectLarge /></ListItemIcon>
                  <ListItemText primary="Medium" secondary="800px" />
                </MenuItem>
                <MenuItem onClick={onDownload(photos[index].id, photos[index].imgUrls.large)}>
                  <ListItemIcon><PhotoSizeSelectActual /></ListItemIcon>
                  <ListItemText primary="Large" secondary="2048px" />
                </MenuItem>

                {canDownload && (
                  <>
                    <Divider />
                    <MenuItem onClick={onDownloadOriginal(photos[index].id)}>
                      <ListItemIcon><RawOn /></ListItemIcon>
                      <ListItemText primary="Original" secondary="Without watermark" />
                    </MenuItem>
                  </>
                )}
              </>
            ) : null}
          </Menu>

          {canCrud && (
            <IconButton onClick={(e) => {
              setSettingsMenu(e.currentTarget);
              e.stopPropagation();
              e.preventDefault();
            }}>
              <Settings />
            </IconButton>
          )}
          <Menu
            open={settingsMenu !== null}
            onClose={(e: React.MouseEvent) => {
              setSettingsMenu(null);
              e.stopPropagation();
            }}
            anchorEl={settingsMenu}
          >
            <MenuItem onClick={e => {
              dispatch(albumActions.updateAlbumCover(album.id, photos[index].id));
              setSettingsMenu(null);
              e.stopPropagation();
              if (onClose) onClose();
            }}>
              <ListItemIcon><PanoramaWideAngle /></ListItemIcon>
              <ListItemText primary="Set album hero" />
            </MenuItem>
          </Menu>

          <IconButton onClick={e => {
            if (onClose) onClose();
            e.stopPropagation();
          }}><Close /></IconButton>
        </div>

        <div className={classes.carousel}>
          <IconButton
            onClick={e => {
              update(-1);
              e.stopPropagation();
            }}
            disabled={index === 0}
          >
            <KeyboardArrowLeft />
          </IconButton>
          <SwipeableViews
            index={index}
            onChangeIndex={index => moveTo(index)}
            enableMouseEvents
          >
            {photos.map(photo => loaded[photo.id] ? (
              <img
                key={photo.id}
                src={photo.imgUrls.large}
                alt=""
                onClick={e => e.stopPropagation()}
              />
            ) : <div key={photo.id} />)}
          </SwipeableViews>
          <IconButton
            onClick={e => {
              update(1);
              e.stopPropagation();
            }}
            disabled={index === photos.length - 1}
          >
            <KeyboardArrowRight />
          </IconButton>
        </div>
      </div>
    </Modal>
  );
};

interface Props {
  album: AlbumType;
  photos: PhotoType[];

  open?: boolean;
  startId: string | null;

  onChange?: (photoId: string) => void;
  onClose?: () => void;
}

export default Lightbox;
