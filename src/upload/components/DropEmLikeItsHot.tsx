import React, { useEffect, useState } from 'react';
import clsx from 'clsx';

import classes from './DropEmLikeItsHot.module.scss';
import uploadGraphic from '../../res/graphics/upload.svg';
import Typography from "@mui/material/Typography";

const DropEmLikeItsHot: React.FC = () => {
  const [canDrop, setCanDrop] = useState<NodeJS.Timeout | null>(null);

  const onDrag = (e: DragEvent) => {
    if (canDrop !== null) clearTimeout(canDrop);
    setCanDrop(setTimeout(() => setCanDrop(null), 5000));
    e.stopPropagation();
  };

  const onDragEnd = (e: DragEvent) => {
    if (canDrop !== null) clearTimeout(canDrop);
    setCanDrop(null);
    e.stopPropagation();
  };

  const onDrop = (e: DragEvent) => {
    if (canDrop !== null) clearTimeout(canDrop);
    setCanDrop(null);
    e.stopPropagation();

    console.log('drop', e);
  };

  useEffect(() => {
    document.addEventListener('drag', onDrag);
    document.addEventListener('dragend', onDragEnd);
    document.addEventListener('drop', onDrop);

    // Remove event listeners upon unmounting the component
    return () => {
      if (canDrop !== null) clearTimeout(canDrop);
      document.removeEventListener('drag', onDrag);
      document.removeEventListener('dragleave', onDragEnd);
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
