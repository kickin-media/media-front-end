import React, { useState } from 'react';
import clsx from "clsx";
import slugify from "slugify";

import { useHistory, useRouteMatch } from "react-router-dom";
import useWidth from "../../util/useWidth";

import { PhotoType } from "../../redux/reducers/photo";
import { AlbumType } from "../../redux/reducers/album";

import CircularProgress from "@mui/material/CircularProgress";
import Lightbox from "./Lightbox";
import Skeleton from "@mui/material/Skeleton";

import classes from './AlbumGallery.module.scss';

const AlbumGallery: React.FC<Props> = ({ album, photos, selected, onSelect, onDeselect } ) => {
  const width = useWidth();

  const history = useHistory();
  const routeMatch = useRouteMatch<RouteProps>();

  const [failed, setFailed] = useState<{ [key: string]: boolean }>({});

  if (!photos || !album) return <CircularProgress />;

  const selectMode = selected !== undefined;

  return (
    <div className={clsx(classes.gallery, {
      [classes['select-mode']]: selectMode,
      [classes.small]: width === 'xs'
    })}>
      {photos.map(photo => (
        <a
          key={photo.id}
          className={clsx(classes.photo, {
            [classes.selected]: selected && selected[photo.id],
            [classes.processing]: !photo.uploadProcessed
          })}
          href={`/album/${album.id}/${slugify(album.name).toLowerCase()}/${photo.id}`}
          style={{ '--w': 100, '--h': 100 } as React.CSSProperties}
          onClick={e => {
            e.preventDefault();
            if (selectMode) {
              if (selected[photo.id] && onDeselect) onDeselect(photo.id);
              else if (onSelect) onSelect(photo.id);
              return;
            }

            history.push(`/album/${album.id}/${slugify(album.name).toLowerCase()}/${photo.id}`);
          }}
        >
          {!failed[photo.id] ? (
            <img
              src={photo.imgUrls.small}
              alt=""
              loading="lazy"
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
        onChange={photoId => {
          history.replace(`/album/${album.id}/${slugify(album.name).toLowerCase()}/${photoId}`, { noTrack: true });
        }}
        onClose={history.goBack}
      />
    </div>
  );
};

interface Props {
  album?: AlbumType;
  photos?: PhotoType[];

  selected?: { [key: string]: boolean };
  onSelect?: (albumId: string) => void;
  onDeselect?: (albumId: string) => void;
}

interface RouteProps {
  photoId?: string;
}

export default AlbumGallery;
