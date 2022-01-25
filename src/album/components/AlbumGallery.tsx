import React from 'react';

import CircularProgress from "@mui/material/CircularProgress";

import { PhotoType } from "../../redux/reducers/photo";

import classes from './AlbumGallery.module.scss';
import { AlbumType } from "../../redux/reducers/album";
import slugify from "slugify";

const AlbumGallery: React.FC<Props> = ({ album, photos } ) => {
  if (!photos || !album) return <CircularProgress />;

  return (
    <div className={classes.gallery} style={{ '--row-height': 120 } as React.CSSProperties}>
      {photos.map(photo => (
        <a
          key={photo.id}
          href={`/album/${album.id}/${slugify(album.name).toLowerCase()}/${photo.id}`}
          style={{ '--w': 100, '--h': 100 } as React.CSSProperties}
        >
          <img
            src={photo.imgUrls.large}
            alt=""
            onLoad={e => {
              console.log(e);
              // @ts-ignore
              e.target.parentNode.style.setProperty('--w', e.target.naturalWidth);
              // @ts-ignore
              e.target.parentNode.style.setProperty('--h', e.target.naturalHeight);
            }}
          />
        </a>
      ))}
    </div>
  );
};

interface Props {
  album?: AlbumType;
  photos?: PhotoType[];
}

export default AlbumGallery;
