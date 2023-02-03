import React, { useEffect, useMemo, useRef, useState } from 'react';
import clsx from 'clsx';

// The package `browser-image-resizer` does not specify any types (even via @types/...), so
// ignore any typing errors that come from importing a package without typing.
// @ts-ignore
import { readAndCompressImage } from 'browser-image-resizer';

import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";

import Cancel from '@mui/icons-material/Close';
import Upload from '@mui/icons-material/Upload';

import classes from './PhotoUpload.module.scss';

const previewConfig = {
  quality: 0.7,
  maxWidth: 400,
  maxHeight: 400,
  mimeType: "image/png"
};

const PhotoUpload: React.FC<Props> = ({ value, onChange, className, label }) => {
  const [val, setValue] = useState<File| null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const input = useRef<HTMLInputElement>(null);

  const currentValue = useMemo(() => value !== undefined ? value : val, [value, val]);
  useEffect(() => {
    if (currentValue === null) setPreview(null);
    else if (typeof currentValue === "string") setPreview(currentValue);
    else readAndCompressImage(currentValue, previewConfig)
        .then((preview: Blob) => setPreview(URL.createObjectURL(preview)));
  }, [currentValue]);

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setValue(e.target.files[0]);
    if (onChange) onChange(e.target.files[0]);
  };

  return (
    <>
      {label && (<Typography className={classes.label} variant="caption">{label}</Typography>)}
      <div className={clsx(classes.root, className)}>
        {/* PREVIEW */}
        {preview ? (
          <img className={classes.preview} src={preview} alt="" />
        ) : (
          <Skeleton className={classes.preview} variant="rectangular" width={90} height={60} />
        )}

        {/* INPUT */}
        <input
          onChange={onUpload}
          ref={input}
          className={classes['file-input']}
          type="file"
          accept="image/png"
        />

        {/* ACTIONS */}
        <ButtonGroup className={classes.actions} color="secondary" variant={currentValue ? "outlined" : "contained"}>
          <Button
            onClick={() => {
              if (!input.current) return;
              input.current.click();
            }}
            startIcon={<Upload />}
          >
            Upload
          </Button>
          {currentValue !== null && (
            <Button
              onClick={() => {
                setValue(null);
                if (onChange) onChange(null);
              }}
              className={classes.cancel}
            >
              <Cancel />
            </Button>
          )}
        </ButtonGroup>
      </div>
    </>
  )
};

interface Props {
  value?: string | File | null;
  onChange?: (file: File | null) => void;

  className?: string;
  label?: string;
}

export default PhotoUpload;
