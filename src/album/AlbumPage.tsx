import React, { useEffect, useState } from 'react';

import { Region } from "../components/ui/AppUI";

import hero from "../res/images/hero.jpg";

import AlbumEditDialog from "./dialogs/AlbumEditDialog";
import { useParams } from "react-router-dom";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { StateType } from "../redux/reducers/reducers";

import * as actions from '../redux/actions/album';
import Lightbox from "./components/Lightbox";
import AlbumGallery from "./components/AlbumGallery";

const AlbumPage: React.FC = () => {
  const { albumId } = useParams<{ albumId: string }>();

  const [lightbox, setLightbox] = useState<null | number>(null);

  const dispatch = useDispatch();
  const album = useSelector((state: StateType) => state.album[albumId], shallowEqual);
  const photos = useSelector((state: StateType) => album && album.photos
    ? album.photos.map(photo => state.photo[photo])
    : [], shallowEqual);

  useEffect(() => {
    dispatch(actions.get(albumId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch])

  return (
    <>
      <Region name="hero">
        {/*<Typography variant="h2">Taste Cantus</Typography>*/}
        {/*<Typography variant="caption">12 uur geleden • Kick-In 2021</Typography>*/}

        <img src={hero} style={{ width: '100%' }} alt="Hero" />
      </Region>

      <AlbumEditDialog />

      {album !== undefined ? (<Lightbox
        open={lightbox !== null}
        album={album}
        photos={photos}
        start={lightbox !== null ? lightbox : 0}
        onClose={() => setLightbox(null)}
      />) : null}

      <AlbumGallery album={album} photos={photos} />
    </>
  );
}

export default AlbumPage;
