import React, { useEffect, useState } from 'react';

import IconButton from "@mui/material/IconButton";
import SwipeableViews from "react-swipeable-views";

import { Close, Info, KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";

import { PhotoType } from "../../redux/reducers/photo";
import { AlbumType } from "../../redux/reducers/album";

import classes from './Lightbox.module.scss';
import { Modal } from "@mui/material";

const Lightbox: React.FC<Props> = ({ open, album, photos, startId, onChange, onClose }) => {
  const [index, setIndex] = useState(0);
  const [prevOpen, setOpen] = useState(open !== undefined ? open: false);

  useEffect(() => {
    if (open === prevOpen) return;
    if (open && startId === null) return;
    setOpen(open !== undefined ? open: false);

    if (open && startId !== null) setIndex(photos.map(photo => photo.id).indexOf(startId));
    else setIndex(0);
  }, [prevOpen, open, startId, photos]);

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
    >
      <div className={classes.root} onClick={() => {
        if (onClose) onClose();
      }}>
        <div className={classes.actions} onClick={e => e.stopPropagation()}>
          <IconButton><Info /></IconButton>
          <IconButton onClick={onClose}><Close /></IconButton>
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
            onChangeIndex={index => setIndex(index)}
            enableMouseEvents
          >
            {photos.map(photo => (
              <img
                key={photo.id}
                src={photo.imgUrls.large}
                alt=""
                onClick={e => e.stopPropagation()}
              />
            ))}
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
