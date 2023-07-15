import React, { useState } from "react";
import { PhotoType } from "../../redux/reducers/photo";

import classes from './LightboxMap.module.scss';
import clsx from "clsx";

import Fullscreen from "@mui/icons-material/Fullscreen";
import FullscreenExit from "@mui/icons-material/FullscreenExit";
import IconButton from "@mui/material/IconButton";

const LightboxMap: React.FC<Props> = ({ photo }) => {
  const [open, setOpen] = useState<boolean>(false);

  if (!photo || !photo.gpsThumb) return null;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        if (!open) setOpen(true);
      }}
      className={clsx(classes.root, { [classes.open]: open })}
      style={{ backgroundImage: `url('${photo.gpsThumb}')` }}
    >
      {!open && <Fullscreen />}
      {open && (
        <IconButton onClick={e => {
            e.stopPropagation();
            e.preventDefault();
            setOpen(false);
        }}>
          <FullscreenExit />
        </IconButton>
      )}
    </div>
  );
};

interface Props {
  photo?: PhotoType;
}

export default LightboxMap;
