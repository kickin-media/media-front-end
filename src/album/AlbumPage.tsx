import React, { useEffect, useMemo } from 'react';

import { Region } from "../components/ui/AppUI";

import AlbumEditDialog from "./dialogs/AlbumEditDialog";
import { useParams } from "react-router-dom";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { StateType } from "../redux/reducers/reducers";

import * as actions from '../redux/actions/album';
import AlbumGallery from "./components/AlbumGallery";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { CircularProgress } from "@mui/material";
import { relativeDate } from "../util/date";

const AlbumPage: React.FC = () => {
  const { albumId } = useParams<{ albumId: string }>();

  const dispatch = useDispatch();
  const album = useSelector((state: StateType) => state.album[albumId], shallowEqual);
  const event = useSelector((state: StateType) => state.album[albumId]
    ? state.event[state.album[albumId].eventId]
    : null, shallowEqual);
  const photos = useSelector((state: StateType) => album && album.photos
    ? album.photos.map(photo => state.photo[photo])
    : [], shallowEqual);

  useEffect(() => {
    dispatch(actions.get(albumId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const sortedPhotos = useMemo(() => photos.sort((a, b) => {
    if (a.timestamp === null) return 1;
    if (b.timestamp === null) return -1;
    return a.timestamp.getTime() - b.timestamp.getTime();
  }), [photos]);

  if (!album || !event) return <CircularProgress />;

  return (
    <>
      {album.coverPhoto !== null && (
        <Region name="hero">
          <Container maxWidth="lg">
            <Typography variant="h2">{album.name}</Typography>
            <Typography>{relativeDate(album.timestamp)} • {event.name}</Typography>
          </Container>

          <img src={album.coverPhoto.imgUrls.large} alt="" />
          <img src={album.coverPhoto.imgUrls.large} alt="" />
        </Region>
      )}

      <AlbumEditDialog />

      <AlbumGallery album={album} photos={sortedPhotos} />
    </>
  );
}

export default AlbumPage;
