import { createAction } from '@reduxjs/toolkit';
import { v4 as uuid } from 'uuid';

export const createNotification = createAction(
  "ui/notification/add",
  (text: string, action?: () => void, actionText?: string) => {
    if ((action && !actionText) || (actionText && !action)) console.warn(
      `Incomplete action defined for notification: ${action}, ${actionText}`);

    return { payload: {
        id: uuid(),
        text, action, actionText
      }
    };
  }
);

export const deleteNotification = createAction(
  'ui/notification/delete',
  (id: string) => ({ payload: { id } })
);
