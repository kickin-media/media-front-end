import React, { useEffect, useState } from 'react';
import clsx from "clsx";

import { useHistory, useRouteMatch } from "react-router-dom";
import useWidth from "../../util/useWidth";

import { PhotoType } from "../../redux/reducers/photo";

import CircularProgress from "@mui/material/CircularProgress";
import Lightbox from "../../album/components/Lightbox";
import Skeleton from "@mui/material/Skeleton";

import classes from '../../album/components/AlbumGallery.module.scss';

const StreamGallery: React.FC<Props> = ({ photos, onRequireNew, onRequireOld } ) => {
  const width = useWidth();

  const history = useHistory();
  const routeMatch = useRouteMatch<RouteProps>();

  const [failed, setFailed] = useState<{ [key: string]: boolean }>({});


  // Add onscroll behaviour
  const [top, setTop] = useState<boolean>(true);
  const [bottom, setBottom] = useState<boolean>(false);

  useEffect(() => {
    if (top && onRequireNew) onRequireNew();
    if (bottom && onRequireOld) onRequireOld();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [top, bottom]);

  const onScroll = () => {
    setTop(window.scrollY === 0);

    const gallery = document.getElementById("stream-gallery-root") as HTMLElement;
    setBottom(gallery.offsetTop + gallery.offsetHeight < window.scrollY + window.innerHeight);
  };

  useEffect(() => {
    document.addEventListener('scroll', onScroll);
    return () => document.removeEventListener('scroll', onScroll);
  }, [])

  if (!photos) return <CircularProgress />;

  return (
    <div id="stream-gallery-root" className={clsx(classes.gallery, {
      [classes.small]: width === 'xs'
    })}>
      {photos.map(photo => (
        <a
          key={photo.id}
          className={classes.photo}
          href={`/stream/${photo.id}`}
          style={{ '--w': 100, '--h': 100 } as React.CSSProperties}
          onClick={e => {
            e.preventDefault();
            history.push(`/stream/${photo.id}`);
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
        photos={photos}
        open={routeMatch.params.photoId !== undefined}
        startId={routeMatch.params.photoId ? routeMatch.params.photoId : null}
        onChange={photoId => {
          history.replace(`/stream/${photoId}`, { noTrack: true });
        }}
        onClose={history.goBack}
      />
    </div>
  );
};

interface Props {
  photos?: PhotoType[];

  onRequireNew?: () => void;
  onRequireOld?: () => void;
}

interface RouteProps {
  photoId?: string;
}

export default StreamGallery;
