import React, { useEffect, useState } from 'react';



import hero from '../res/images/hero.jpg';
import { Region } from "./ui/AppUI";
import { shallowEqual, useSelector } from "react-redux";
import { StateType } from "../redux/reducers/reducers";
import SwipeableViews from "react-swipeable-views";
import Typography from "@mui/material/Typography";
import { relativeDate } from "../util/date";

import classes from './HeroCarousel.module.scss';
import { setInterval } from "timers";

const HeroCarousel: React.FC<Props> = ({ eventId }) => {
  const albums = useSelector((state: StateType) => Object.keys(state.album)
    .filter(albumId => state.album[albumId].eventId === eventId)
    .map(albumId => state.album[albumId])
    .filter(album => album.coverPhoto)
    .filter(album => album.releaseTime === null || album.releaseTime.getTime() >= new Date().getTime())
    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    .filter((_, index) => index < 10), shallowEqual);

  const [index, setIndex] = useState<number>(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [carousel, setCarousel] = useState<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (albums.length === 0) return;

    // Set the new interval
    const interval = setInterval(() => setIndex(index => {
      return (index + 1) % albums.length;
    }), 5000);

    // Cancel the previous interval
    setCarousel(prev => {
      if (prev !== null) clearInterval(prev);
      return interval;
    });

    // Cancel the interval if this object is unloaded
    return () => clearInterval(interval);
  }, [albums.length]);

  return (
    <Region name="hero">
      <SwipeableViews className={classes.carousel} index={albums.length > 0 ? index + 1 : 0} disabled>
        <img src={hero} alt="Hero" />
        {albums.map((album, index) => (
          <React.Fragment key={index}>
            <img src={album.coverPhoto?.imgUrls.large} alt="" />
            <div>
              <Typography variant="h2">{album.name}</Typography>
              <Typography>
                {relativeDate(album.timestamp)} • {album.photosCount} photos
              </Typography>
            </div>
          </React.Fragment>
        ))}
      </SwipeableViews>
    </Region>
  );
}

interface Props {
  eventId: string | null;
}

export default HeroCarousel;
