import React, { useEffect, useMemo, useState } from 'react';
import Modal from "@mui/material/Modal";

import classes from './LiveFeed.module.scss';
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import Skeleton from "@mui/material/Skeleton";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import * as actions from '../redux/actions/photo-stream';
import { PhotoType } from "../redux/reducers/photo";
import { useFeed } from "./util/feed-grid";
import * as eventActions from '../redux/actions/event';
import * as albumActions from '../redux/actions/album';
import { AnyAction } from "@reduxjs/toolkit";
import { StateType } from "../redux/reducers/reducers";
import { shuffleArray } from "../util/shuffle";

const LiveFeed: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [recent, setRecent] = useState<Date>();

  const dispatch = useDispatch();
  const albums = useSelector((state: StateType) => Object.keys(state.album)
    .map(key => state.album[key]),
    shallowEqual);
  const sortedAlbums = useMemo(() => albums.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()), [albums]);

  // Get a list of all albums
  useEffect(() => {
    dispatch(eventActions.list())
      .then((eventResult: AnyAction) => {
        if (eventResult.type !== eventActions.list.success) return;

        eventResult.response.result
          .forEach((eventId: string) => dispatch(eventActions.getAlbums(eventId)));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Compute grid size
  const [cols, rows, rowHeight] = useMemo(() => {
    let cols = Math.floor((window.innerWidth - 8) / 240);
    let rowHeight = (window.innerHeight - 8) / cols - 4;
    let rows = Math.floor((window.innerHeight - 8) / rowHeight);
    rowHeight = (window.innerHeight - 8) / rows - (rows - 1) * 4 / rows;
    return [cols, rows, rowHeight];
  }, []);

  // Use the grid reducer
  const [gridList, gridPhotos, queueSize, addToQueue] = useFeed(rows, cols);

  // Load most recent photo uploads
  const loadRecentUploads = () => {
    setLoading(true);
    return dispatch(actions.getStream(recent, recent ? "newer" : "older", "uploaded", undefined)).then((res: AnyAction) => {
      if (res.type === actions.getStream.request) return;
      if (res.type === actions.getStream.failure) return false;
      if (!res.response || !res.response.entities || !res.response.entities.photo) return false;

      // @ts-ignore
      Object.keys(res.response.entities.photo).forEach(id => addToQueue(res.response.entities.photo[id]));
      setLoading(false);

      let latest = Object.keys(res.response.entities.photo)
        .map(id => (res.response.entities.photo[id] as PhotoType).uploadedAt)
        .reduce((prev, cur) => cur.getTime() > prev.getTime() ? cur : prev);
      setRecent(latest);
      return true;
    });
  };

  const loadRandomPhotos = () => {
    setLoading(true);
    // Inverse of exponential distribution
    const lambda = 1 / Math.min(15, Math.floor(albums.length / 2));
    let idx = Math.floor(-Math.log(Math.random())/lambda);
    idx = Math.min(sortedAlbums.length - 1);

    if (idx < 0) {
      setLoading(false);
      return;
    }

    const album = sortedAlbums[idx];
    return dispatch(albumActions.get(album.id)).then((res: AnyAction) => {
      if (res.type !== albumActions.get.success) return;

      const photos: PhotoType[] = Object.keys(res.response.entities.photo)
        .map(key => res.response.entities.photo[key]);
      shuffleArray(photos);

      // @ts-ignore
      photos.slice(0, Math.min(10, photos.length)).forEach(photo => addToQueue(photo));

      setLoading(false);
    });
  }

  // Initialize on start
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadRecentUploads().then(success => {
      if (success === undefined) return;
      if (!success) return loadRandomPhotos();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add new items to the queue every so often
  useEffect(() => {
    if (loading) return;
    if (queueSize > 3) return;
    loadRecentUploads().then(success => {
      if (success === undefined) return;
      if (!success) return loadRandomPhotos();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, queueSize]);

  return (
    <Modal open>
      <div className={classes.root}>
        <ImageList
          variant="quilted"
          cols={cols}
          rowHeight={rowHeight}
          sx={{margin: 0, padding: '4px', height: '100%', width: '100%', overflow: 'hidden'}}
        >
          {(gridList as any).map((photoId, index) => (
            <ImageListItem
              key={photoId ? photoId : index}
              rows={photoId ? gridPhotos[photoId].height : 1}
              cols={photoId ? gridPhotos[photoId].width : 1}
            >
              {photoId ? (
                <img src={gridPhotos[photoId].photo.imgUrls.medium} alt="" />
                ) : (
                <Skeleton variant="rectangular" sx={{width: '100%', height: '100%', backgroundColor: 'rgba(255, 255, 255, 0.11)'}} />
              )}
            </ImageListItem>
          ))}
        </ImageList>
      </div>
    </Modal>
  );
};

export default LiveFeed;
