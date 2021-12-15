import React from 'react';

import { Region } from "../components/ui/AppUI";

import hero from "../res/images/hero.jpg";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";

const images = new Array(40).fill(null).map(() => Math.random() >= 0.5 ? 'h' : 'v');

const AlbumPage: React.FC = () => (
  <>
    <Region name="hero">
      {/*<Typography variant="h2">Taste Cantus</Typography>*/}
      {/*<Typography variant="caption">12 uur geleden • Kick-In 2021</Typography>*/}

      <img src={hero} style={{ width: '100%' }} alt="Hero" />
    </Region>
    <ImageList cols={12} rowHeight={100}>
      {images.map((orientation, index) => orientation === 'h' ? (
        <ImageListItem key={index} cols={6} rows={4}>
          <img src={`https://picsum.photos/600/400?index=${index}`} alt="" />
        </ImageListItem>
      ) : (
        <ImageListItem key={index} cols={4} rows={6}>
          <img src={`https://picsum.photos/400/600?index=${index}`} alt="" />
        </ImageListItem>
      ))}
    </ImageList>
  </>
);

export default AlbumPage;
