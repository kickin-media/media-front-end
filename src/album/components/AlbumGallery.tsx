import React, { useState } from 'react';

import CircularProgress from "@mui/material/CircularProgress";

import { PhotoType } from "../../redux/reducers/photo";

import classes from './AlbumGallery.module.scss';
import { AlbumType } from "../../redux/reducers/album";
import slugify from "slugify";
import { useHistory, useRouteMatch } from "react-router-dom";
import Lightbox from "./Lightbox";
import Skeleton from "@mui/material/Skeleton";

const AlbumGallery: React.FC<Props> = ({ album, photos } ) => {
  const history = useHistory();
  const routeMatch = useRouteMatch<RouteProps>();

  const [failed, setFailed] = useState<{ [key: string]: boolean }>({});

  if (!photos || !album) return <CircularProgress />;

  return (
    <div className={classes.gallery}>
      {photos.map(photo => (
        <a
          key={photo.id}
          className={classes.photo}
          href={`/album/${album.id}/${slugify(album.name).toLowerCase()}/${photo.id}`}
          style={{ '--w': 100, '--h': 100 } as React.CSSProperties}
          onClick={e => {
            history.push(`/album/${album.id}/${slugify(album.name).toLowerCase()}/${photo.id}`);
            e.preventDefault();
          }}
        >
          {!failed[photo.id] ? (
            <img
              src={photo.imgUrls.small}
              alt=""
              onLoad={e => {
                // @ts-ignore
                e.target.parentNode.style.setProperty('--w', e.target.naturalWidth);
                // @ts-ignore
                e.target.parentNode.style.setProperty('--h', e.target.naturalHeight);
              }}
              onError={() => setFailed(f => Object.assign({}, f, { [photo.id]: true }))}
            />
          ) : (
            <Skeleton variant="rectangular" />
          )}
        </a>
      ))}

      <Lightbox
        album={album}
        photos={photos}
        open={routeMatch.params.photoId !== undefined}
        startId={routeMatch.params.photoId ? routeMatch.params.photoId : null}
        onChange={photoId => history.replace(`/album/${album.id}/${slugify(album.name).toLowerCase()}/${photoId}`)}
        onClose={history.goBack}
      />
    </div>
  );
};

interface Props {
  album?: AlbumType;
  photos?: PhotoType[];
}

interface RouteProps {
  photoId?: string;
}

export default AlbumGallery;
