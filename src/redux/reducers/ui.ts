import { createReducer, Reducer } from '@reduxjs/toolkit';

import * as actions from '../actions/ui';

export interface UIStateType {
  notifications: NotificationType[];
}

export interface NotificationType {
  id: string;
  text: string;
  action?: () => void;
  actionText?: string;
}

const ui: Reducer<UIStateType> = createReducer({
  notifications: [],
} as UIStateType, {
  // Notifications
  [actions.createNotification.toString()]: (state, action) => {
    state.notifications = [...state.notifications, action.payload as NotificationType];
  },

  [actions.deleteNotification.toString()]: (state, action) => {
    state.notifications = state.notifications.filter(n => n.id !== action.payload.id);
  },
});

export default ui;
