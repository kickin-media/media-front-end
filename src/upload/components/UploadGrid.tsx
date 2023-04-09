import React, { useEffect, useState } from 'react';
import clsx from 'clsx';
import ExifParser from 'exif-parser';

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
import Alert from "@mui/material/Alert";

const previewConfig = {
  quality: 0.7,
  maxWidth: 400,
  maxHeight: 400,
};

type UploadErrorType = "exif" | "datetime" | "colorspace";

const UploadGrid: React.FC<Props> = ({ files, onAdd, onRemove }) => {
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});
  const [errors, setErrors] = useState<{ [key: string]: UploadErrorType }>({});

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

    // Test if the photo contains at least the `DateTimeOriginal` EXIF tag
    const reader = new FileReader();
    reader.onload = () => {
      if (!reader.result) return;

      const res = ExifParser.create(reader.result).parse();
      console.log(res);
      if (!res || !res.tags) setErrors(e => ({ ...e, [k]: 'exif' }));
      else if (res.tags.ColorSpace !== 1) setErrors(e => ({ ...e, [k]: 'colorspace' }));
      else if (!res.tags.DateTimeOriginal) setErrors(e => ({ ...e, [k]: 'datetime' }));
    };
    reader.readAsArrayBuffer(files[k]);

    return () => {
      Object.keys(previews).forEach(key => URL.revokeObjectURL(previews[key]));
    };
  }, [previews, files]);

  return (
    <>
      <ImageList cols={6}>
        {Object.keys(files).map(key => (
          <ImageListItem
            key={key}
            className={clsx(classes.image, { [classes.error]: errors[key] })}
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

      {Object.keys(errors).some(key => errors[key] === 'exif') && (
        <Alert className={classes.alert} severity="error">
          Some of your images don't include EXIF-tags. Make sure you include photo
          metadata when exporting your photos and re-upload the highlighted photos.
        </Alert>
      )}

      {Object.keys(errors).some(key => errors[key] === 'colorspace') && (
        <Alert className={classes.alert} severity="error">
          Some of your images are not exported in the sRGB color space. Even though your pictures might look okay in
          here, things are likely going to go wrong during processing. Please re-upload your images in the proper color
          space.
        </Alert>
      )}

      {Object.keys(errors).some(key => errors[key] === 'datetime') && (
        <Alert className={classes.alert} severity="warning">
          Some of your images don't contain the <code>DateTimeOriginal</code> EXIF-tag. Make sure you include photo
          metadata when exporting your photos and re-upload the highlighted photos.
        </Alert>
      )}
    </>
  );
};

interface Props {
  files: { [key: string]: File };

  onAdd?: () => void;
  onRemove?: (key: string) => void;
}

export default UploadGrid;
