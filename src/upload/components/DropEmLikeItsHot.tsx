import React, { useEffect, useState } from 'react';
import clsx from 'clsx';

import classes from './DropEmLikeItsHot.module.scss';
import uploadGraphic from '../../res/graphics/upload.svg';
import Typography from "@mui/material/Typography";

const DropEmLikeItsHot: React.FC = () => {
  const [canDrop, setCanDrop] = useState(false);

  const onDragEnter = (e: DragEvent) => {
    console.log('enter', e.target);
    setCanDrop(true);
    e.stopPropagation();
  };

  const onDragEnd = (e: DragEvent) => {
    console.log('leave', e.target);
    setCanDrop(false);
    e.stopPropagation();
  };

  const onDrop = (e: DragEvent) => {
    console.log('drop');
    setCanDrop(false);
    e.stopPropagation();
  };

  useEffect(() => {
    document.addEventListener('dragenter', onDragEnter);
    document.addEventListener('dragend', onDragEnd);
    document.addEventListener('drop', onDrop);

    // Remove event listeners upon unmounting the component
    return () => {
      document.removeEventListener('dragenter', onDragEnter);
      document.removeEventListener('dragleave', onDragEnd);
      document.removeEventListener('drop', onDrop);
    };
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
