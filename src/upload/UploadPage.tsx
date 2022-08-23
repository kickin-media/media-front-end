import React, { useEffect, useRef, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import slugify from "slugify";

import Accordion from '@mui/material/Accordion';
import AccordionActions from '@mui/material/AccordionActions';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Button from "@mui/material/Button";
import LinearProgress from '@mui/material/LinearProgress';
import Step from '@mui/material/Step';
import StepContent from '@mui/material/StepContent';
import StepLabel from '@mui/material/StepLabel';
import Stepper from '@mui/material/Stepper';
import TextField from '@mui/material/TextField';
import Typography from "@mui/material/Typography";
import UploadAlbumForm, { UploadAlbumFormRef } from "./forms/UploadAlbumForm";
import UploadEventForm, { UploadEventFormRef } from "./forms/UploadEventForm";
import UploadGrid from "./components/UploadGrid";

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import * as actions from '../redux/actions/photo';
import * as authorActions from '../redux/actions/author';
import { AnyAction } from "@reduxjs/toolkit";
import { AuthorType } from "../redux/reducers/author";
import { StateType } from "../redux/reducers/reducers";

import classes from './UploadPage.module.scss';
import uploadGraphic from '../res/graphics/upload.svg';

const UploadPage: React.FC = () => {
  const albumFormRef = useRef<UploadAlbumFormRef>(null);
  const eventFormRef = useRef<UploadEventFormRef>(null);

  const [albumIds, setAlbums] = useState<string[]>([]);
  const [eventId, setEvent] = useState<string | null>(null);

  const [errors, setErrors] = useState<string[]>([]);
  const [files, setFiles] = useState<{ [key: string]: File }>({});
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);

  const dispatch = useDispatch();
  const albums = useSelector((state: StateType) => albumIds.map(id => state.album[id]), shallowEqual);
  const event = useSelector((state: StateType) => eventId === null ? null : state.event[eventId], shallowEqual);

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
    if (step !== 3) return;

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
          return dispatch(actions.setAlbums(signedUrls.response[index].photoId, albumIds))
            .then((res: AnyAction) => {
              if (res.type !== actions.setAlbums.success) return;

              setProgress(progress => progress + 100 / Object.keys(files).length / 3);
            });
        }, () => setErrors(e => [...e, key]));
      }));
    }).catch(() => setStep(3))
      .then(() => setTimeout(() => {
        if (albums.length === 0) return;
        else if (albums.length === 1) history.push(
          `/album/${albums[0].id}/${slugify(albums[0].name).toLowerCase()}`,
          { done: true }
        );
        else history.push(
          `/event/${eventId}/${slugify(event ? event.name : '')}`,
            { done: true }
        );
      }, 1000));
  }, [dispatch, history, albumIds, albums, event, eventId, files, step]);

  // Setting the user's (nick)name
  const [authorEdit, setAuthorEdit] = useState<boolean>(false);
  const [authorLoaded, setAuthorLoaded] = useState<boolean>(author !== undefined && author !== null && author.name.length > 0);
  const [name, setName] = useState<string>(author ? author.name : '');
  useEffect(() => {
    if (user === null) return;
    dispatch(authorActions.get(user))
      .then((res: AnyAction) => {
        if (res.type !== authorActions.get.success) return;
        const author: AuthorType = res.response.entities.author[res.response.result];
        setName(author.name);
        setAuthorLoaded(true);
      });
  }, [dispatch, user]);

  return (
    <>
      <Typography variant="h3">Upload Photos</Typography>

      <Accordion className={classes.author} expanded={authorEdit} onChange={() => {
        setAuthorEdit(!authorEdit);
        setName(author ? author.name : '');
      }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography>
          Author - {author && author.name ? author.name : 'NOT CONFIGURED YET'}
        </Typography></AccordionSummary>
        <AccordionDetails>
          <TextField
            disabled={!authorLoaded}
            label={"Name"}
            value={name}
            onChange={e => setName(e.target.value)}
            fullWidth
          />
        </AccordionDetails>
        <AccordionActions>
          <Button color="secondary" onClick={() => {
            setName(author ? author.name : '');
            setAuthorEdit(false);
          }}>
            Cancel
          </Button>
          <Button onClick={() => dispatch(authorActions.update(name)).then((res: AnyAction) => {
            if (res.type !== authorActions.update.success) return;
            setAuthorEdit(false);
          })}>
            Save
          </Button>
        </AccordionActions>
      </Accordion>

      <Stepper orientation="vertical" activeStep={step}>
        {/* STEP 1: SELECT IMAGES */}
        <Step>
          <StepLabel
            error={Object.keys(files).length > 250}
            optional={(
              <Typography variant="caption">
                {Object.keys(files).length}{Object.keys(files).length > 250 ? ' / 250' : ''} images selected
              </Typography>
            )}
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
              disabled={Object.keys(files).length === 0 || Object.keys(files).length > 250 || !(author && author.name)}
              onClick={() => setStep(1)}
            >
              Next
            </Button>
          </StepContent>
        </Step>

        {/* STEP 2: SELECT EVENT */}
        <Step>
          <StepLabel optional={(
            <Typography variant="caption">
              {event === null ? 'No event selected' : `${event.name}`}
            </Typography>
          )}>
            Select event
          </StepLabel>
          <StepContent className={classes['step-event']}>
            <Typography>Select an event to upload the selected images to:</Typography>
            <UploadEventForm reference={eventFormRef} onSubmit={(success, values) => {
              if (!success) return;
              if (values.eventId !== eventId) {
                setAlbums([]);
                if (albumFormRef.current) albumFormRef.current.reset();
              }

              setEvent(values.eventId);
            }} />
            <div className={classes.actions}>
              <Button onClick={() => setStep(0)}>Back</Button>
              <Button
                color="primary"
                variant="contained"
                disabled={event === null}
                onClick={() => setStep(2)}
              >
                Confirm
              </Button>
            </div>
          </StepContent>
        </Step>

        {/* STEP 3: SELECT ALBUM */}
        <Step>
          <StepLabel optional={(
            <Typography variant="caption">
              {albums.length === 0
                ? 'No album selected'
                : albums.length + " albums selected: " + albums.map(album => album.name).join(', ')
              }
            </Typography>
          )}>
            Select album
          </StepLabel>
          <StepContent className={classes['step-album']}>
            <Typography>Select an album to upload the selected images to:</Typography>
            <UploadAlbumForm eventId={eventId} reference={albumFormRef} onSubmit={(success, values) => {
              if (!success) return;
              setAlbums(Object.keys(values.albums).filter(id => values.albums[id]));
            }} />
            <div className={classes.actions}>
              <Button onClick={() => setStep(1)}>Back</Button>
              <Button
                color="primary"
                variant="contained"
                disabled={albums.length === 0}
                onClick={() => setStep(3)}
              >
                Confirm
              </Button>
            </div>
          </StepContent>
        </Step>

        {/* STEP 4: UPLOAD IMAGES*/}
        <Step>
          <StepLabel>Upload to server</StepLabel>
          <StepContent>
            <div className={classes.upload}>
              <img src={uploadGraphic} alt="" />
              <LinearProgress variant="determinate" value={progress} />
              <a className={classes.copyright} href='https://www.freepik.com/vectors/website'>
                Website vector created by stories - www.freepik.com
              </a>
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
