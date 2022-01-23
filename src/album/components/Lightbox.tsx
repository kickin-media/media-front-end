import React, { useEffect, useState } from 'react';

import Backdrop from '@mui/material/Backdrop';
import IconButton from "@mui/material/IconButton";
import SwipeableViews from "react-swipeable-views";

import { Close, Info, KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";

import { PhotoType } from "../../redux/reducers/photo";
import { AlbumType } from "../../redux/reducers/album";

import classes from './Lightbox.module.scss';

const Lightbox: React.FC<Props> = ({ open, album, photos, start, onClose }) => {
  const [index, setIndex] = useState(start);
  const [prevOpen, setOpen] = useState(open !== undefined ? open: false);

  useEffect(() => {
    if (open === prevOpen) return;
    setOpen(open !== undefined ? open: false);
    setIndex(start);
  }, [prevOpen, open, start]);

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
          onClick={() => setIndex(index - 1)}
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
          onClick={() => setIndex(index + 1)}
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
  start: number;

  onClose?: () => void;
}

export default Lightbox;
