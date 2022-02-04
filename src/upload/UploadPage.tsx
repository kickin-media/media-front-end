import React, { useEffect, useRef, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import Button from "@mui/material/Button";
import UploadGrid from "./components/UploadGrid";

import { StateType } from "../redux/reducers/reducers";
import { LinearProgress, Step, StepContent, StepLabel, Stepper } from "@mui/material";

import classes from './UploadPage.module.scss';
import uploadGraphic from '../res/graphics/upload.svg';
import Typography from "@mui/material/Typography";
import UploadAlbumForm, { UploadAlbumFormRef } from "./forms/UploadAlbumForm";

import * as actions from '../redux/actions/photo';
import { AnyAction } from "@reduxjs/toolkit";
import slugify from "slugify";

import * as authorActions from '../redux/actions/author';
import AuthorDialog from "../author/dialogs/AuthorDialog";

const UploadPage: React.FC = () => {
  const albumFormRef = useRef<UploadAlbumFormRef>(null);

  const [albumId, setAlbum] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [files, setFiles] = useState<{ [key: string]: File }>({});
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);

  const dispatch = useDispatch();
  const album = useSelector((state: StateType) => albumId === null
    ? null
    : state.album[albumId],
    shallowEqual);
  const user = useSelector((state: StateType) => state.auth.authenticated ? state.auth.user.sub : null);
  const author = useSelector((state: StateType) => state.auth.authenticated
    ? state.author[state.auth.user.sub]
    : null,
    shallowEqual);

  // Prevent users from accidentally navigating away from this page
  const history = useHistory<UploadHistoryState>();
  useEffect(() => history.block(location => {
    if (location.state && location.state.done === true) return;

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

  // Upload images once the last step is triggered
  useEffect(() => {
    if (step !== 2) return;

    dispatch(actions.create(Object.keys(files).length)).then((signedUrls: AnyAction) => {
      if (signedUrls.type !== actions.create.success) return;

      return Promise.all(Object.keys(files).map((key, index) => {
        const fields: { [key: string]: string } = signedUrls.response[index].preSignedUrl.fields;

        const formData = new FormData();
        Object.keys(fields).forEach(key => formData.append(key, fields[key]))

        return files[key].arrayBuffer().then(data => {
          formData.append('file', new Blob([data], { type: 'image/jpeg' }), files[key].name);

          return fetch(
            `${signedUrls.response[index].preSignedUrl.url}`, {
              body: formData,
              method: 'POST',
            }
          );
        }).then(res => {
          if (!res.ok) {
            setErrors(e => [...e, key]);
            return Promise.reject();
          }

          setProgress(progress => progress + 100 / Object.keys(files).length / 3 * 2);
          return dispatch(actions.setAlbums(signedUrls.response[index].photoId, [albumId as string]))
            .then((res: AnyAction) => {
              if (res.type !== actions.setAlbums.success) return;

              setProgress(progress => progress + 100 / Object.keys(files).length / 3);
            });
        }, () => setErrors(e => [...e, key]));
      }));
    }).catch(() => setStep(2))
      .then(() => setTimeout(() => {
        if (!album) return;
        history.push(
          `/album/${album.id}/${slugify(album.name).toLowerCase()}`,
          { done: true }
        );
      }, 1000));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, albumId, files, step]);

  console.log(author);
  useEffect(() => {
    if (user === null) return;
    dispatch(authorActions.get(user));
  }, [dispatch, user]);

  return (
    <>
      <AuthorDialog
        open={author === null}
        onClose={() => {
          if (user === null) return;
          dispatch(authorActions.get(user));
        }}
      />
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
              <UploadGrid files={files} onRemove={key => setFiles(f => {
                const copy = Object.assign({}, f);
                delete copy[key];

                return copy;
              })} />
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
          <StepContent className={classes['step-album']}>
            <Typography>Select an album to upload the selected images to:</Typography>
            <UploadAlbumForm reference={albumFormRef} onSubmit={(success, values) => {
              if (!success) return;
              setAlbum(values.albumId);
            }} />
            <div className={classes.actions}>
              <Button onClick={() => setStep(0)}>Back</Button>
              <Button
                color="primary"
                variant="contained"
                disabled={album === null}
                onClick={() => setStep(2)}
              >
                Confirm
              </Button>
            </div>
          </StepContent>
        </Step>

        {/* STEP 3: UPLOAD IMAGES*/}
        <Step>
          <StepLabel>Upload to server</StepLabel>
          <StepContent>
            <div className={classes.upload}>
              <img src={uploadGraphic} alt="" />
              <LinearProgress variant="determinate" value={progress} />
              <a className={classes.copyright} href='https://www.freepik.com/vectors/website'>Website vector created by stories - www.freepik.com</a>
              {errors.map((error, index) => (
                <Typography key={index}>{files[error].name}</Typography>
              ))}
            </div>
          </StepContent>
        </Step>
      </Stepper>
    </>
  );
};

interface UploadHistoryState {
  done?: boolean;
  files?: FileList | null;
}

export default UploadPage;
