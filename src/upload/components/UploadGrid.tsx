import React, { useEffect, useState } from 'react';

// The package `browser-image-resizer` does not specify any types (even via @types/...), so
// ignore any typing errors that come from importing a package without typing.
// @ts-ignore
import { readAndCompressImage } from 'browser-image-resizer';

import IconButton from '@mui/material/IconButton';
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import Skeleton from "@mui/material/Skeleton";

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

import classes from './UploadGrid.module.scss';

const previewConfig = {
  quality: 0.7,
  maxWidth: 400,
  maxHeight: 400,
};

const UploadGrid: React.FC<Props> = ({ files, onAdd, onRemove }) => {
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});

  // Generate previews, one at a time
  useEffect(() => {
    let key: string | null = null;
    for (const k of Object.keys(files)) {
      if (previews[k] === '') return;
      if (previews.hasOwnProperty(k)) continue;
      key = k;
      break;
    }

    // Cannot generate a preview if there are no new files
    if (key === null) return;

    // Generate preview for the selected image
    const k = key;
    setPreviews(p => ({ ...p, [k]: '' }));
    readAndCompressImage(files[k], previewConfig).then((preview: Blob) => {
      setPreviews(p => ({ ...p, [k]: URL.createObjectURL(preview) }));
    });

    return () => {
      Object.keys(previews).forEach(key => URL.revokeObjectURL(previews[key]));
    };
  }, [previews, files]);

  return (
    <ImageList cols={6}>
      {Object.keys(files).map(key => (
        <ImageListItem
          key={key}
          className={classes.image}
        >
          <IconButton
            className={classes.options}
            onClick={() => {
              if (!onRemove) return;
              onRemove(key);
            }}
          >
            <DeleteIcon />
          </IconButton>
          {previews[key] && previews[key] !== '' ? (
            <img src={previews[key]} alt={files[key].name} />
          ) : (
            <Skeleton className={classes.loading} variant="rectangular" width={400} height={400} />
          )}
        </ImageListItem>
      ))}

      {onAdd !== undefined ? (
        <ImageListItem className={classes.add}>
          <IconButton onClick={() => {
            if (!onAdd) return;
            onAdd();
          }}>
            <AddIcon />
          </IconButton>
        </ImageListItem>
      ) : null}
    </ImageList>
  );
};

interface Props {
  files: { [key: string]: File };

  onAdd?: () => void;
  onRemove?: (key: string) => void;
}

export default UploadGrid;
