import React, { useEffect, useState } from 'react';
import clsx from "clsx";

import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import { Card, Checkbox } from "@mui/material";
import {
  AddToPhotos,
  CheckCircle, Close,
  CreateNewFolder,
  DriveFolderUpload,
  PermMedia,
  RadioButtonUnchecked, SelectAll
} from "@mui/icons-material";
import Typography from "@mui/material/Typography";

import classes from './UploadPage.module.scss';
import IconButton from "@mui/material/IconButton";
import { useHistory } from "react-router-dom";
import Skeleton from "@mui/material/Skeleton";

const UploadPage: React.FC = () => {
  const [files, setFiles] = useState<{ [key: string]: File }>({});
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});
  const [selected, setSelected] = useState<{ [key: string]: boolean }>({});

  const history = useHistory<UploadHistoryState>();
  useEffect(() => history.block((location, action) => {
    if (location.pathname === '/upload/') return;
    return 'Navigating away from page will cancel the ongoing upload process. Are you sure you want to leave?';
  }));

  useEffect(() => {
    if (!history.location.state || !history.location.state.files) return;

    const newFiles = history.location.state.files;
    if (newFiles.length === 0) return;

    const res: { [key: string]: File } = {};
    for (let i = 0; i < newFiles.length; i++) res[`${newFiles[i].name}-${newFiles[i].lastModified}`] = newFiles[i];

    setFiles(f => Object.assign({}, f, res));

    Object.keys(res)
      .forEach(key => res[key].arrayBuffer()
        .then(buffer => setPreviews(p => Object.assign({}, p, {
          [key]: p[key] ? p[key] : URL.createObjectURL(new Blob([buffer]))
        }))));
  }, [history.location.state, setFiles, setPreviews]);

  let selectedCount = Object.keys(selected).filter(img => selected[img]).length;

  return (
    <>
      <ImageList cols={6}>
        {Object.keys(files).map(key => (
          <ImageListItem
            key={key}
            className={clsx(classes.image, {
              [classes.selected]: selected[key]
            })}
            onClick={() => setSelected(s => Object.assign({}, s, { [key]: !selected[key] }))}
          >
            <Checkbox
              className={classes.check}
              icon={<RadioButtonUnchecked />}
              checkedIcon={<CheckCircle />}
              checked={selected[key] !== undefined ? selected[key] : false}
            />
            {previews[key] ? (
              <img src={previews[key]} alt={files[key].name} />
            ) : (
              <Skeleton variant="rectangular" width={100} height={100} />
            )}
          </ImageListItem>
        ))}
      </ImageList>

      <div className={classes.folders}>
        {selectedCount > 0 ? (
          <Card variant="outlined" className={classes['selected-status']}>
            {selectedCount} selected
            <IconButton onClick={() => setSelected({})}><Close /></IconButton>
          </Card>
        ) : (
          <Card variant="outlined" className={classes['selected-status']}>
            0 selected
            <IconButton
              onClick={() => {
                const selected: any = {};
                for (let i = 0; i < 40; i++) selected[i] = true;
                setSelected(selected);
              }}
            >
              <SelectAll />
            </IconButton>
          </Card>
        )}

        <Card variant="outlined">
          <DriveFolderUpload />
          <div>
            <Typography variant="body2">Current upload</Typography>
            <Typography variant="caption">40 images</Typography>
          </div>
          <IconButton><AddToPhotos /></IconButton>
        </Card>

        <Card variant="outlined">
          <PermMedia />
          <div>
            <Typography variant="body2">Bestorming van de Bastille</Typography>
            <Typography variant="caption">20 images</Typography>
          </div>
          <IconButton><AddToPhotos /></IconButton>
        </Card>

        <Card variant="outlined">
          <PermMedia />
          <div>
            <Typography variant="body2">Taste Cantus</Typography>
            <Typography variant="caption">20 images</Typography>
          </div>
          <IconButton><AddToPhotos /></IconButton>
        </Card>

        <Card variant="outlined">
          <CreateNewFolder />
          <div>
            <Typography variant="body2">Add album...</Typography>
          </div>
          <IconButton><AddToPhotos /></IconButton>
        </Card>
      </div>
    </>
  );
};

interface UploadHistoryState {
  files: FileList | null;
}

export default UploadPage;
