import React, { useEffect } from 'react';
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

const EventOverviewPage: React.FC = () => {
  const dispatch = useDispatch();
  const events = useSelector((state: StateType) => state.event, shallowEqual);

  // Load all data on mount
  useEffect(() => {
    dispatch(actions.list())
      .then((eventResult: AnyAction) => {
        if (eventResult.type !== actions.list.success) return;

        eventResult.response.result
          .forEach((eventId: string) => dispatch(actions.getAlbums(eventId)));
      });
  }, [dispatch]);

  // Determine layout rules
  const theme = useTheme();
  const multiColumn = useMediaQuery(theme.breakpoints.up('md'));

  return (
    <>
      <div className={clsx(classes.grid, { [classes.large]: multiColumn })}>
        {Object.keys(events)
          .map(eventId => (
            <Event key={eventId} event={events[eventId]} />
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
