import React, { useEffect } from 'react';

import { Region } from "../components/ui/AppUI";

import hero from "../res/images/hero.jpg";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";

import AlbumEditDialog from "./dialogs/AlbumEditDialog";
import { useParams } from "react-router-dom";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { StateType } from "../redux/reducers/reducers";

import * as actions from '../redux/actions/album';

const AlbumPage: React.FC = () => {
  const { albumId } = useParams<{ albumId: string }>();

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

      <ImageList cols={12} rowHeight={100}>
        {photos.map(photo => (
          <ImageListItem key={photo.id} cols={3} rows={3}>
            <img src={photo.imgUrls.large} alt="" />
          </ImageListItem>
        ))}
        {/*{images.map((orientation, index) => orientation === 'h' ? (*/}
        {/*  <ImageListItem key={index} cols={6} rows={4}>*/}
        {/*    <img src={`https://picsum.photos/600/400?index=${index}`} alt="" />*/}
        {/*  </ImageListItem>*/}
        {/*) : (*/}
        {/*  <ImageListItem key={index} cols={4} rows={6}>*/}
        {/*    <img src={`https://picsum.photos/400/600?index=${index}`} alt="" />*/}
        {/*  </ImageListItem>*/}
        {/*))}*/}
      </ImageList>
    </>
  );
}

export default AlbumPage;
