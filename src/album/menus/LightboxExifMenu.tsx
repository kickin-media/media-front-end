import React, { useState } from 'react';
import useWidth from "../../util/useWidth";

import { PhotoType } from "../../redux/reducers/photo";

import Button from "@mui/material/Button";
import Drawer from '@mui/material/Drawer';
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import ExifPeek from "../components/ExifPeek";
import IconButton from "@mui/material/IconButton";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from "@mui/material/ListItemText";
import ListItemIcon from "@mui/material/ListItemIcon";
import Typography from "@mui/material/Typography";

import Aperture from '@mui/icons-material/Camera';
import Camera from '@mui/icons-material/CameraAlt';
import FocalLength from '@mui/icons-material/Landscape';
import Info from '@mui/icons-material/Info';
import Iso from '@mui/icons-material/Iso';
import Lens from '@mui/icons-material/Lens';
import ShutterSpeed from '@mui/icons-material/ShutterSpeed';

import classes from './LightboxExifMenu.module.scss';

const LightboxExifMenu: React.FC<Props> = ({ photo }) => {
  const [open, setOpen] = useState<boolean>(false);

  const mobile = useWidth() === 'xs';

  if (!photo) return null;

  const InfoItem: React.FC<InfoProps> = ({ icon, name, value }) => value ? (
    <ListItem>
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText primary={value} secondary={name} />
    </ListItem>
  ) : null;

  const PhotoInfo = () => photo.exif ? (
    <List>
      <InfoItem icon={<Camera />} name="Camera body" value={photo.exif.model} />
      <InfoItem icon={<Lens />} name="Lens" value={photo.exif.lensModel} />
      <InfoItem icon={<FocalLength />} name="Focal length"
                value={photo.exif.focalLength
                  ? photo.exif.focalLength + 'mm'
                  : undefined} />
      <InfoItem icon={<Aperture />} name="Aperture"
                value={photo.exif.apertureValue
                  ? 'f/' + parseFloat(photo.exif.apertureValue).toFixed(1)
                  : undefined} />
      <InfoItem icon={<ShutterSpeed />} name="Shutter speed"
                value={photo.exif.shutterSpeedValue
                  ? '1 / ' + Math.pow(2, parseFloat(photo.exif.shutterSpeedValue)).toFixed(0)
                  : undefined} />
      <InfoItem icon={<Iso />} name="ISO" value={photo.exif.photographicSensitivity} />
    </List>
  ) : <Typography>No EXIF data in photo</Typography>;

  return (
    <>
      {!mobile && (
        <ExifPeek photo={photo} onClick={(e) => {
          setOpen(true);
          e.preventDefault();
          e.stopPropagation();
        }} />
      )}
      <IconButton onClick={(e) => {
        setOpen(true);
        e.stopPropagation();
        e.preventDefault();
      }}>
        <Info />
      </IconButton>

      {mobile ? (
        <Drawer
          open={open}
          onClick={e => e.stopPropagation()}
          onClose={(e: any) => {
            setOpen(false);
            e.preventDefault();
            e.stopPropagation();
          }}
          className={classes.drawer}
          anchor="bottom"
        >
          <PhotoInfo />
        </Drawer>
      ) : (
        <Dialog
          open={open}
          onClick={e => e.stopPropagation()}
          onClose={() => setOpen(false)}
          className={classes.dialog}
        >
          <DialogTitle>EXIF Information</DialogTitle>
          <DialogContent><PhotoInfo /></DialogContent>
          <DialogActions><Button onClick={(e) => {
            setOpen(false)
            e.stopPropagation();
            e.preventDefault();
          }}>
            Close
          </Button></DialogActions>
        </Dialog>
      )}
    </>
  );
};

interface Props {
  photo?: PhotoType;
}

interface InfoProps {
  icon: React.ReactNode;
  name: string;
  value?: string;
}

export default LightboxExifMenu;
