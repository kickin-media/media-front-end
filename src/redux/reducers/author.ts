import { createReducer, Reducer } from '@reduxjs/toolkit';

import * as actions from '../actions/author';

export type AuthorStateType = { [key: string]: AuthorType };

export interface AuthorType {
  id: string;
  name: string;
}

const mergeAuthors = (old: AuthorType | undefined, current: AuthorType) => {
  return current;
}

const author: Reducer<AuthorStateType> = createReducer({} as AuthorStateType, {
  [actions.get.success]: (state, action) => {
    const authors = action.response.entities.author;
    Object.keys(authors).forEach(id => state[id] = mergeAuthors(state[id], authors[id]));
  }
});

export default author;
