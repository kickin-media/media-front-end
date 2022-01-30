import React, { useEffect, useState } from 'react';

import Backdrop from '@mui/material/Backdrop';
import IconButton from "@mui/material/IconButton";
import SwipeableViews from "react-swipeable-views";

import { Close, Info, KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";

import { PhotoType } from "../../redux/reducers/photo";
import { AlbumType } from "../../redux/reducers/album";

import classes from './Lightbox.module.scss';

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

  const update = (delta: number) => () => setIndex(prev => {
    const nextIndex = prev + delta;
    if (onChange) onChange(photos[nextIndex].id);

    return nextIndex;
  });

  return (
    <Backdrop
      open={prevOpen}
      className={classes.backdrop}
    >
      <div className={classes.actions}>
        <IconButton><Info /></IconButton>
        <IconButton onClick={onClose}><Close /></IconButton>
      </div>

      <div className={classes.carousel}>
        <IconButton
          onClick={update(-1)}
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
            />
          ))}
        </SwipeableViews>
        <IconButton
          onClick={update(1)}
          disabled={index === photos.length - 1}
        >
          <KeyboardArrowRight />
        </IconButton>
      </div>
    </Backdrop>
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
