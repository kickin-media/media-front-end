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

const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

const AlbumCarousel: React.FC<Props> = ({ albums, title }) => {
  const [activeStep, setActiveStep] = React.useState(0);

  const viewSize = 4;

  let aa = albums ? albums : new Array(viewSize).fill(null);

  let views: ({} | null)[][] = [];
  for (let i = 0; i < aa.length; i += viewSize) views.push(aa.slice(i, i + viewSize));

  return (
    <>
      <div className={classes.header}>
        <Typography variant="h6">{title}</Typography>

        {/* Only show the stepper/pagination if there are multiple pages/views */}
        {views.length > 1 && (
          <MobileStepper
            className={classes.stepper}
            steps={views.length}
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
  albums: {}[] | null;
  title: string;
}

export default AlbumCarousel;
