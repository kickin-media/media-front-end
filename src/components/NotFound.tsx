import React from "react";

import Typography from "@mui/material/Typography";

import classes from './NotFound.module.scss';
import notFoundGraphic from "../res/graphics/not-found.svg";

const NotFound: React.FC = () => (
  <div className={classes.root}>
    <img src={notFoundGraphic} alt="" />
    <Typography variant="h3">Oops, looks like there is no data...</Typography>
    <Typography variant="h5">Maybe try again later</Typography>
    <a href="https://www.freepik.com/free-vector/error-404-concept-landing-page_4660894.htm" className={classes.copyright}>Image by pikisuperstar on Freepik</a>
  </div>
);

export default NotFound;
