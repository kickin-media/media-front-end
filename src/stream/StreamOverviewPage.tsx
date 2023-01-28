import React, { useEffect, useMemo, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";

import { StateType } from '../redux/reducers/reducers';
import * as actions from '../redux/actions/photo-stream';
import StreamGallery from "./components/StreamGallery";
import { PhotoType } from "../redux/reducers/photo";
import { AnyAction } from "@reduxjs/toolkit";
import CircularProgress from "@mui/material/CircularProgress";

import classes from './StreamOverviewPage.module.scss';

const StreamOverviewPage: React.FC = () => {
  const photoIds = useSelector((state: StateType) => state.photoStream.photos, shallowEqual);
  const photos = useSelector((state: StateType) => state.photo, shallowEqual);
  const lastCheck = useSelector((state: StateType) => state.photoStream.upToDate);
  const { head, tail } = useSelector((state: StateType) => ({
    head: state.photoStream.head,
    tail: state.photoStream.tail
  }));

  const stream: PhotoType[] = useMemo(
    () => photoIds.map(id => photos[id] ? photos[id] : null)
      .filter(photo => photo !== null) as PhotoType[],
    [photoIds, photos]);

  // Load some data on mount
  const dispatch = useDispatch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadOlder() }, [dispatch]);

  const [loading, setLoading] = useState<"newer" | "older" | false>(false);

  const loadOlder = () => {
    if (loading || tail === null) return;
    setLoading("older");

    dispatch(actions.getStream(
      stream.length > 0 ? stream[stream.length - 1].uploadedAt : undefined,
      "older", "uploaded", tail
    )).then((res: AnyAction) => {
      if (res.type === actions.getStream.request) return;
      setLoading(false);
    });
  }

  const loadNewer = () => {
    if (loading) return;
    if (lastCheck && new Date().getTime() < lastCheck.getTime() + 60 * 1000) return;

    setLoading("newer");
    dispatch(actions.getStream(
      stream.length > 0 ? stream[0].uploadedAt : undefined,
      "newer", "uploaded", head
    )).then((res: AnyAction) => {
      if (res.type === actions.getStream.request) return;
      setLoading(false);
    });
  }

  return (
    <>
      {loading === "newer" && (
        <div className={classes.loading}>
          <CircularProgress color={loading ? "secondary" : "inherit"} />
        </div>
      )}
      <StreamGallery
        photos={stream.length > 0 ? stream : undefined}
        onRequireNew={loadNewer}
        onRequireOld={tail === null ? () => {} : loadOlder}
      />
      {loading === "older" && (
        <div className={classes.loading}>
          <CircularProgress color={loading ? "secondary" : "inherit"} />
        </div>
      )}
    </>
  );
};

export default StreamOverviewPage;
