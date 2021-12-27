import React, { useState } from 'react';
import clsx from "clsx";

import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import { Card, CardActionArea, Checkbox } from "@mui/material";
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

const UploadPage: React.FC = () => {
  const [selected, setSelected] = useState<{ [key: string]: boolean }>({});

  let selectedCount = Object.keys(selected).filter(img => selected[img]).length;

  return (
    <>
      <ImageList cols={6}>
        {new Array(40).fill(null).map((item, index) => (
          <ImageListItem
            key={index}
            className={clsx(classes.image, {
              [classes.selected]: selected[index]
            })}
            onClick={() => setSelected({ ...selected, [index]: !selected[index] })}
          >
            <Checkbox
              className={classes.check}
              icon={<RadioButtonUnchecked />}
              checkedIcon={<CheckCircle />}
              checked={selected[index] !== undefined ? selected[index] : false}
            />
            <img src={`https://picsum.photos/200/200?index=${index}`} alt="" />
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

export default UploadPage;
