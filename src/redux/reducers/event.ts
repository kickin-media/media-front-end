import { createReducer, Reducer } from "@reduxjs/toolkit";

import * as actions from '../actions/event';
import * as albumActions from '../actions/album';

export type EventStateType = { [key: string]: EventType };

export interface EventType {
  id: string;

  locked: boolean;
  name: string;
  timestamp: Date;

  watermark?: string;
}

const mergeEvents = (old: EventType | undefined, current: EventType) => Object.assign({}, old, current);

const event: Reducer<EventStateType> = createReducer({} as EventStateType, {
  [albumActions.get.success]: (state, action) => {
    const events = action.response.entities.event;
    Object.keys(events).forEach(id => state[id] = mergeEvents(state[id], events[id]));
  },

  [actions.create.success]: (state, action) => {
    const event = action.response.entities.event[action.response.result];
    state[event.id] = event;
  },

  [actions.list.success]: (state, action) => {
    const events = action.response.entities.event;
    Object.keys(events).forEach(id => state[id] = mergeEvents(state[id], events[id]));
  },

  [actions.get.success]: (state, action) => {
    const event = action.response.entities.event[action.response.result];
    state[event.id] = mergeEvents(state[event.id], event);
  },

  [actions.remove.success]: (state, action) => {
    delete state[action.payload['event_id']];
  },

  [actions.getWatermark.success]: (state, action) => {
    state[action.payload['event_id']].watermark = action.response.entities.eventWatermark.watermark;
  },
});

export default event;
