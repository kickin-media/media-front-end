import React from 'react';
import { trackEvent } from "../../util/analytics";
import { PhotoType } from "../../redux/reducers/photo";
import { AlbumType } from "../../redux/reducers/album";

import IconButton from "@mui/material/IconButton";

import ShareIcon from "@mui/icons-material/Share";

const LightboxShareMenu: React.FC<Props> = ({ photo, album, albumName }) => {
  if (!photo || !album) return null;
  if (!('share' in navigator)) return null;

  const onShare = (photoId: string, url: string) => fetch(url)
    .then((res: Response) => res.blob())
    .then(blob => new File(
      [blob],
      `${albumName}-${photoId}.jpg`,
      {
        type: "image/jpeg",
        lastModified: new Date().getTime()
      }))
    .then(file => {
      trackEvent('share', photoId);
      navigator.share({
        title: 'Kick-In Media - ' + (album ? albumName : 'Photo Stream'),
        files: [file]
      });
    });

  return (
    <IconButton onClick={(e) => {
      onShare(photo.id, photo.imgUrls.large);
      e.stopPropagation();
      e.preventDefault();
    }}>
      <ShareIcon />
    </IconButton>
  );
};

interface Props {
  albumName: string;
  album?: AlbumType;
  photo?: PhotoType;
}

export default LightboxShareMenu;
