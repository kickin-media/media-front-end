import React, { useEffect, useMemo, useState } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";

import { StateType } from '../redux/reducers/reducers';
import * as actions from '../redux/actions/photo-stream';
import StreamGallery from "./components/StreamGallery";
import { PhotoType } from "../redux/reducers/photo";
import { AnyAction } from "@reduxjs/toolkit";

const StreamOverviewPage: React.FC = () => {
  const photoIds = useSelector((state: StateType) => state.photoStream.photos, shallowEqual);
  const photos = useSelector((state: StateType) => state.photo, shallowEqual);
  const lastCheck = useSelector((state: StateType) => state.photoStream.upToDate);

  const stream = useMemo(
    () => photoIds.map(id => photos[id] ? photos[id] : null)
      .filter(photo => photo !== null) as PhotoType[],
    [photoIds, photos]);

  // Load some data on mount
  const dispatch = useDispatch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadOlder() }, [dispatch]);

  const [loading, setLoading] = useState<boolean>(false);

  const loadOlder = () => {
    if (loading) return;
    setLoading(true);
    dispatch(actions.getPage(stream.length > 0 ? stream[stream.length - 1].uploadedAt : undefined, "older"))
      .then((res: AnyAction) => {
        if (res.type === actions.getPage.request) return;
        setLoading(false);
      });
  }

  const loadNewer = () => {
    if (loading) return;
    if (lastCheck && new Date().getTime() < lastCheck.getTime() + 60 * 1000) return;

    setLoading(true);
    dispatch(actions.getPage(stream.length > 0 ? stream[0].uploadedAt : undefined, "newer"))
      .then((res: AnyAction) => {
        if (res.type === actions.getPage.request) return;
        setLoading(false);
      });
  }

  return (
    <>
      <StreamGallery
        photos={stream.length > 0 ? stream : undefined}
        onRequireNew={loadNewer}
        onRequireOld={loadOlder}
      />
      {/*<div className={classes.loading}><CircularProgress color={loading ? "secondary" : "inherit"} /></div>*/}
    </>
  );
};

export default StreamOverviewPage;
