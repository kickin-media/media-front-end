import React from 'react';

import SwipeableViews from 'react-swipeable-views';

import Album from './Album';

import { autoPlay } from 'react-swipeable-views-utils';

import classes from './AlbumCarousel.module.scss';
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { MobileStepper } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import { AlbumType } from "../../redux/reducers/album";
import useWidth from "../../util/useWidth";
import clsx from "clsx";

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

const VIEW_SIZES: { [key: string]: number } = { 'xs': 1, 'sm': 3 };

const AlbumCarousel: React.FC<Props> = ({ albums, title }) => {
  const [activeStep, setActiveStep] = React.useState(0);

  const width = useWidth();

  if (albums !== null && albums.length === 0) return null;

  const viewSize = VIEW_SIZES[width] ? VIEW_SIZES[width] : 4;

  console.log(width, viewSize);

  let aa = albums ? albums : new Array(5 * viewSize).fill(null);

  let views: (AlbumType | null)[][] = [];
  for (let i = 0; i < aa.length; i += viewSize) views.push(aa.slice(i, i + viewSize));

  const progress = VIEW_SIZES[width] && views.length > 3;

  return (
    <>
      <div className={classes.header}>
        <Typography variant="h6">{title}</Typography>

        {/* Only show the stepper/pagination if there are multiple pages/views */}
        {views.length > 1 && (
          <MobileStepper
            className={clsx(classes.stepper, { [classes.progress]: progress })}
            steps={views.length}
            variant={progress ? 'progress' : 'dots'}
            position="static"
            activeStep={activeStep}
            nextButton={(
              <IconButton
                size="small"
                onClick={() => setActiveStep(activeStep + 1)}
              >
                <KeyboardArrowRight />
              </IconButton>
            )}
            backButton={(
              <IconButton
                size="small"
                onClick={() => setActiveStep(activeStep - 1)}
              >
                <KeyboardArrowLeft />
              </IconButton>
            )}
          />
        )}
      </div>
      <AutoPlaySwipeableViews
        className={classes.carousel}
        index={activeStep}
        onChangeIndex={(step) => setActiveStep(step)}
        interval={5000}
        enableMouseEvents
      >
        {views.map((view, i) => (
          <Stack key={i} direction="row" spacing={2}>
            {view.map((album, j) => <Album key={j} album={album} />)}
          </Stack>
        ))}
      </AutoPlaySwipeableViews>
    </>
  );
}

interface Props {
  albums: AlbumType[] | null;
  title: string;
}

export default AlbumCarousel;
