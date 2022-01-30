import React, { useEffect, useRef, useState } from 'react';
import { shallowEqual, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import Button from "@mui/material/Button";
import UploadGrid from "./components/UploadGrid";

import { StateType } from "../redux/reducers/reducers";
import { Step, StepContent, StepLabel, Stepper } from "@mui/material";

import classes from './UploadPage.module.scss';
import uploadGraphic from '../res/graphics/upload.svg';
import Typography from "@mui/material/Typography";
import UploadAlbumForm, { UploadAlbumFormRef } from "./forms/UploadAlbumForm";

const UploadPage: React.FC = () => {
  const albumFormRef = useRef<UploadAlbumFormRef>(null);

  const [albumId, setAlbum] = useState<string | null>(null);
  const [files, setFiles] = useState<{ [key: string]: File }>({});
  const [step, setStep] = useState(0);

  const album = useSelector((state: StateType) => albumId === null
    ? null
    : state.album[albumId],
    shallowEqual);

  // Prevent users from accidentally navigating away from this page
  const history = useHistory<UploadHistoryState>();
  useEffect(() => history.block(location => {
    // However, allow users to add other files to the upload (uses History API state replace)
    if (location.pathname === '/upload/') return;

    // Otherwise, show warning prompt to the user
    return 'Navigating away from page will cancel the ongoing upload process. Are you sure you want to leave?';
  }));

  // Process newly uploaded files
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!history.location.state || !history.location.state.files) return;

    const newFiles = history.location.state.files;
    if (newFiles.length === 0) return;

    const res: { [key: string]: File } = {};
    for (let i = 0; i < newFiles.length; i++) res[`${newFiles[i].name}-${newFiles[i].lastModified}`] = newFiles[i];

    setFiles(f => Object.assign({}, f, res));
    history.replace(history.location.pathname, {});

  });

  return (
    <>
      <Stepper orientation="vertical" activeStep={step}>

        {/* STEP 1: SELECT IMAGES */}
        <Step>
          <StepLabel
            optional={<Typography variant="caption">{Object.keys(files).length} images selected</Typography>}
          >
            Select images
          </StepLabel>
          <StepContent TransitionProps={{ unmountOnExit: false }}>
            {Object.keys(files).length > 0 ? (
              <UploadGrid files={files} />
            ) : (
              <div className={classes['empty-upload']}>
                <img src={uploadGraphic} alt="" />
                <Typography className={classes.instructions} variant="h4">Drop 'em like its hot!</Typography>
                <a className={classes.copyright} href='https://www.freepik.com/vectors/website'>Website vector created by stories - www.freepik.com</a>
              </div>
            )}
            <Button
              color="primary"
              variant="contained"
              disabled={Object.keys(files).length === 0}
              onClick={() => setStep(1)}
            >
              Next
            </Button>
          </StepContent>
        </Step>

        {/* STEP 2: SELECT ALBUM */}
        <Step>
          <StepLabel optional={(
            <Typography variant="caption">
              {album === null
                ? 'No album selected'
                : album.name
              }
            </Typography>
          )}>
            Select album
          </StepLabel>
          <StepContent>
            <UploadAlbumForm reference={albumFormRef} onSubmit={(success, values) => {
              if (!success) return;
              if (albumFormRef.current !== null) albumFormRef.current.reset();

              setAlbum(values.albumId);
            }} />
            <Button onClick={() => setStep(0)}>Back</Button>
            <Button
              color="primary"
              variant="contained"
              disabled={album === null}
              onClick={() => setStep(2)}
            >
              Confirm
            </Button>
          </StepContent>
        </Step>

        {/* STEP 3: UPLOAD IMAGES*/}
        <Step>
          <StepLabel>Upload to server</StepLabel>
          <StepContent>

          </StepContent>
        </Step>
      </Stepper>

      {/*<Button*/}
      {/*  variant="outlined"*/}
      {/*  onClick={() => {*/}
      {/*    dispatch(actions.create(Object.keys(files).length)).then(*/}
      {/*      (res: AnyAction) => {*/}
      {/*        if (res.type !== actions.create.success) return;*/}

      {/*        Object.keys(files).forEach((key, index) => {*/}
      {/*          const fields: { [key: string]: string } = res.response[index].preSignedUrl.fields;*/}
      {/*          const q = Object.keys(fields).map(key => `${key}=${fields[key]}`).join('&');*/}
      {/*          files[key].arrayBuffer().then(data => fetch(*/}
      {/*            `${res.response[index].preSignedUrl.url}?${q}`, {*/}
      {/*            body: data,*/}
      {/*            method: 'POST',*/}
      {/*          }));*/}
      {/*        });*/}
      {/*      },*/}
      {/*      (err: any) => console.warn(err)*/}
      {/*    );*/}
      {/*  }}*/}
      {/*>*/}
      {/*  Upload*/}
      {/*</Button>*/}
    </>
  );
};

interface UploadHistoryState {
  files?: FileList | null;
}

export default UploadPage;
