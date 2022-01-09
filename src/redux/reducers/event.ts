import { createReducer, Reducer } from "@reduxjs/toolkit";

import * as actions from '../actions/event';

export type EventStateType = { [key: string]: EventType };

export interface EventType {
  id: string;

  name: string;
  timestamp: Date;
}

const mergeEvents = (old: EventType | undefined, current: EventType) => {
  // TODO: Merge
  return current;
};

const event: Reducer<EventStateType> = createReducer({} as EventStateType, {
  [actions.list.success]: (state, action) => {
    const events = action.response.entities.event;
    Object.keys(events).forEach(id => state[id] = mergeEvents(state[id], events[id]));
  }
});

export default event;
