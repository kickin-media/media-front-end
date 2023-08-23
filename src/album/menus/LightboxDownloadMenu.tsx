import React, { useState } from 'react';
import { useDispatch, useSelector } from "react-redux";

import { StateType } from "../../redux/reducers/reducers";
import { PhotoType } from "../../redux/reducers/photo";
import { trackEvent } from "../../util/analytics";
import * as photoActions from "../../redux/actions/photo";
import { AnyAction } from "@reduxjs/toolkit";

import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

import Download from "@mui/icons-material/Download";
import PhotoSizeSelectActual from "@mui/icons-material/PhotoSizeSelectActual";
import PhotoSizeSelectLarge from "@mui/icons-material/PhotoSizeSelectLarge";
import PhotoSizeSelectSmall from "@mui/icons-material/PhotoSizeSelectSmall";
import RawOn from "@mui/icons-material/RawOn";

import classes from "../components/Lightbox.module.scss";
import slugify from "slugify";

const LightboxDownloadMenu: React.FC<Props> = ({ photo, albumName }) => {
  const [open, setOpen] = useState<null | HTMLElement>(null);

  const dispatch = useDispatch();
  const canDownload = useSelector((state: StateType) =>
    state.auth.authenticated && state.auth.scopes.includes('photos:download_other'));

  if (!photo) return null;

  // Download
  const onDownload = (url: string) => (e) => {
    trackEvent('download', photo.id);
    downloadPhoto(photo.id, url, photo?.author.name);
    setOpen(null);
    e.stopPropagation();
    e.preventDefault();
  };
  const onDownloadOriginal = () => (e) => {
    e.stopPropagation();
    e.preventDefault();
    setOpen(null);
    trackEvent('download', photo.id);
    // noinspection DuplicatedCode
    dispatch(photoActions.getOriginal(photo.id))
      .then((res: AnyAction) => {
        if (res.type !== photoActions.getOriginal.success) return Promise.reject();
        return downloadPhoto(photo.id, res.response.downloadUrl, photo?.author.name);
      });
  };
  const downloadPhoto = (photoId: string, url: string, author: string) => fetch(url)
    .then((res: Response) => res.blob())
    .then((blob: Blob) => URL.createObjectURL(blob))
    .then((url: string) => {
      const root = document.getElementsByClassName(classes.root)[0];
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${albumName}--${slugify(author)}--${photoId}.jpg`;
      anchor.className = classes.download;

      root.appendChild(anchor);
      anchor.click();
      root.removeChild(anchor);
      setTimeout(() => URL.revokeObjectURL(url), 30000);
    });

  return (
    <>
      <IconButton onClick={(e) => {
        setOpen(e.currentTarget);
        e.stopPropagation();
        e.preventDefault();
      }}>
        <Download />
      </IconButton>
      <Menu
        open={open !== null}
        onClose={(e: React.MouseEvent) => {
          setOpen(null);
          e.stopPropagation();
        }}
        anchorEl={open}
      >
        <MenuItem onClick={onDownload(photo.imgUrls.small)}>
          <ListItemIcon><PhotoSizeSelectSmall /></ListItemIcon>
          <ListItemText primary="Small" secondary="400px" />
        </MenuItem>
        <MenuItem onClick={onDownload(photo.imgUrls.medium)}>
          <ListItemIcon><PhotoSizeSelectLarge /></ListItemIcon>
          <ListItemText primary="Medium" secondary="800px" />
        </MenuItem>
        <MenuItem onClick={onDownload(photo.imgUrls.large)}>
          <ListItemIcon><PhotoSizeSelectActual /></ListItemIcon>
          <ListItemText primary="Large" secondary="2048px" />
        </MenuItem>

        {canDownload && [
          <Divider key="divider" />,
          <MenuItem key="original" onClick={onDownloadOriginal()}>
            <ListItemIcon><RawOn /></ListItemIcon>
            <ListItemText primary="Original" secondary="Without watermark" />
          </MenuItem>
        ]}
      </Menu>
    </>
  );
};

interface Props {
  albumName: string;
  photo?: PhotoType;
}

export default LightboxDownloadMenu;
