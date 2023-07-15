import React, { useContext, useEffect, useMemo } from 'react';
import clsx from "clsx";
import useMediaQuery from "@mui/material/useMediaQuery";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useTheme } from "@mui/material/styles";

import { AnyAction } from "@reduxjs/toolkit";
import { StateType } from "../redux/reducers/reducers";
import * as actions from '../redux/actions/event';

import Event from './components/Event';
import Typography from "@mui/material/Typography";

import Timeline from '@mui/icons-material/Timeline';

import classes from './EventOverviewPage.module.scss';
import { BreadcrumbContext } from "../components/ui/Breadcrumb";

const EventOverviewPage: React.FC = () => {
  const dispatch = useDispatch();
  const events = useSelector((state: StateType) => state.event, shallowEqual);

  const setBreadcrumb = useContext(BreadcrumbContext).setPath;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setBreadcrumb({ name: 'Events', href: '/event/' }), []);

  // Load all data on mount
  useEffect(() => {
    dispatch(actions.list())
      .then((eventResult: AnyAction) => {
        if (eventResult.type !== actions.list.success) return;

        eventResult.response.result
          .forEach((eventId: string) => dispatch(actions.getAlbums(eventId)));
      });
  }, [dispatch]);

  const sortedEvents = useMemo(() => Object.keys(events)
    .map(id => events[id])
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    ), [events]);

  // Determine layout rules
  const theme = useTheme();
  const multiColumn = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <>
      <div className={clsx(classes.grid, { [classes.large]: multiColumn })}>
        {sortedEvents.map(event => (
          <Event key={event.id} event={event} />
        ))}
      </div>
      <div className={classes.backref}>
        <Timeline color="secondary" />
        <div>
          <Typography>The photos from before 2022 can be found on Flickr.</Typography>
          <a href="https://www.flickr.com/photos/kick-in/albums/" target="_blank" rel="noreferrer">
            Click here to view them
          </a>
        </div>
      </div>
    </>
  );
};

export default EventOverviewPage;
