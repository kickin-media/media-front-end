import React, { useEffect, useState } from 'react';
import clsx from 'clsx';

import classes from './DropEmLikeItsHot.module.scss';
import uploadGraphic from '../../res/graphics/upload.svg';
import Typography from "@mui/material/Typography";
import { useHistory } from "react-router-dom";

const isValid = (e: DragEvent) => {
  if (!e.dataTransfer || !e.dataTransfer.items) return false;

  for (let i = 0; i < e.dataTransfer.items.length; i++) {
    const item = e.dataTransfer.items[i];
    if (item.kind !== 'file') continue;

    if (item.type === 'image/jpeg') return true;
  }

  return false;
}

const DropEmLikeItsHot: React.FC = () => {
  const [canDrop, setCanDrop] = useState<boolean>(false);

  const history = useHistory();

  const onDrag = (e: DragEvent) => {
    if (!isValid(e)) return;

    setCanDrop(true);
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
  };

  const onDragEnd = () => { setCanDrop(false) };

  const onDrop = (e: DragEvent) => {
    setCanDrop(false);
    if (!isValid(e)) return;
    if (!e.dataTransfer) return;

    e.preventDefault();

    history.push('/upload/', {
      files: e.dataTransfer.files
    });
  };

  useEffect(() => {
    document.addEventListener('dragover', onDrag);
    document.addEventListener('dragenter', onDrag);
    document.addEventListener('dragend', onDragEnd);
    document.addEventListener('drop', onDrop);

    // Remove event listeners upon unmounting the component
    return () => {
      document.removeEventListener('dragover', onDrag);
      document.removeEventListener('dragenter', onDrag);
      document.removeEventListener('dragend', onDragEnd);
      document.removeEventListener('drop', onDrop);
    };
    // eslint-disable-next-line
  }, []);

  return (
    <div
      className={clsx(classes.root, {
        [classes['can-drop']]: canDrop
      })}
    >
      <img src={uploadGraphic} alt="" />
      <Typography className={classes.instructions} variant="h3">Drop 'em like its hot!</Typography>

      <a className={classes.copyright} href='https://www.freepik.com/vectors/website'>Website vector created by stories - www.freepik.com</a>
    </div>
  );
};

export default DropEmLikeItsHot;
