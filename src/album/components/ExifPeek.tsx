import React from 'react';

import { PhotoType } from "../../redux/reducers/photo";

import Chip from '@mui/material/Chip';

import Aperture from '@mui/icons-material/Camera';
import FocalLength from '@mui/icons-material/Landscape';
import Iso from '@mui/icons-material/Iso';
import ShutterSpeed from '@mui/icons-material/ShutterSpeed';

const ExifPeek: React.FC<Props> = ({ photo, onClick }) => {
  if (!photo.exif) return null;

  const InfoItem: React.FC<InfoProps> = ({ icon, value }) => value ? (
    <Chip
      icon={icon}
      label={value}
      onClick={onClick}
      size="small"
      variant="outlined"
      clickable
    />
  ) : null;

  return (
    <>
      <InfoItem icon={<FocalLength />}
                value={photo.exif.focalLength
                  ? photo.exif.focalLength + 'mm'
                  : undefined} />
      <InfoItem icon={<Aperture />}
                value={photo.exif.apertureValue
                  ? 'f/' + parseFloat(photo.exif.apertureValue).toFixed(1)
                  : undefined} />
      <InfoItem icon={<ShutterSpeed />}
                value={photo.exif.shutterSpeedValue
                  ? '1 / ' + Math.pow(2, parseFloat(photo.exif.shutterSpeedValue)).toFixed(0)
                  : undefined} />
      <InfoItem icon={<Iso />} value={photo.exif.photographicSensitivity} />
    </>
  );
};

interface Props {
  photo: PhotoType;

  onClick?: (e: React.MouseEvent) => void;
}

interface InfoProps {
  icon: React.ReactElement;
  value?: string;
}

export default ExifPeek;
