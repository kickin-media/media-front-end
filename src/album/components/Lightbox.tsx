import React, { useEffect, useMemo, useState } from 'react';
import slugify from "slugify";
import { useDispatch, useSelector } from "react-redux";
import useWidth from "../../util/useWidth";

import * as actions from '../../redux/actions/photo';
import { AlbumType } from "../../redux/reducers/album";
import { PhotoType } from "../../redux/reducers/photo";

import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import LightboxDownloadMenu from "../menus/LightboxDownloadMenu";
import LightboxExifMenu from "../menus/LightboxExifMenu";
import LightboxShareMenu from "../menus/LightboxShareMenu";
import Modal from '@mui/material/Modal';
import SwipeableViews from "react-swipeable-views";

import Close from '@mui/icons-material/Close';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import LocationOffIcon from '@mui/icons-material/LocationOff';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import TrendIcon from '@mui/icons-material/TrendingUp';

import classes from './Lightbox.module.scss';
import { renderNumber } from "../../util/number";
import { StateType } from "../../redux/reducers/reducers";
import LightboxMap from "./LightboxMap";

const Lightbox: React.FC<Props> = ({ open, album, photos, startId, onChange, onClose }) => {
  const [index, setIndex] = useState(0);
  const [prevOpen, setOpen] = useState(open !== undefined ? open: false);

  const [loaded, setLoaded] = useState<{ [key: string]: boolean }>({});

  const [showGeo, setGeo] = useState<boolean>(window.localStorage.getItem('lightbox-geo') === 'true');

  const albumName = album ? slugify(album.name).toLowerCase() : 'stream';

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

  const dispatch = useDispatch();
  useEffect(() => {
    if (!open) return;

    for (let i = index - 1; i <= index + 1; i++) {
      if (i < 0) continue;
      if (i >= photos.length) continue;

      setLoaded(l => Object.assign({}, l, { [photos[i].id]: true }));
      if (!photos[i].exif) dispatch(actions.get(photos[i].id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, index, photos]);

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

  // Register photo views
  const curPhotoId = useMemo(() => index < photos.length ? photos[index].id : null, [index, photos]);
  useEffect(() => {
    if (!open) return;
    if (curPhotoId === null) return;

    dispatch(actions.increaseViewCount(curPhotoId));
  }, [dispatch, open, curPhotoId]);

  const canSeeViewCount = useSelector((state: StateType) =>
    state.auth.authenticated
    && state.auth.scopes.some(scope => scope === 'photos:read_view_count'));

  const mobile = useWidth() === 'xs';

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
          {(canSeeViewCount && !mobile && photos[index]) && (
            <Chip
              icon={<TrendIcon />}
              label={`${renderNumber(photos[index].views)} views`}
              size="small" variant="outlined"
            />
          )}

          <LightboxExifMenu photo={photos[index]} />
          {photos[index] && typeof photos[index].gpsThumb === "string" &&
            <IconButton onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setGeo(!showGeo);
              window.localStorage.setItem('lightbox-geo', String(!showGeo));
            }}>{showGeo ? <LocationOnIcon /> : <LocationOffIcon />}</IconButton>
          }
          <LightboxShareMenu photo={photos[index]} album={album} albumName={albumName} />
          <LightboxDownloadMenu photo={photos[index]} albumName={albumName} />

          <IconButton onClick={e => {
            if (onClose) onClose();
            e.stopPropagation();
          }}><Close /></IconButton>
        </div>

        {showGeo
          && photos[index] && typeof photos[index].gpsThumb === "string"
          && <LightboxMap photo={photos[index]} />}

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
  album?: AlbumType;
  photos: PhotoType[];

  open?: boolean;
  startId: string | null;

  onChange?: (photoId: string) => void;
  onClose?: () => void;
}

export default Lightbox;
