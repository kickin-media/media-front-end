import { createAPIAction } from "../middlewares/api";
import * as schemas from '../schemas';

export const list = createAPIAction(
  'ALBUM_LIST',
  'GET',
  '/album/',
  undefined,
  schemas.ALBUM_ARRAY
);

export const create = createAPIAction(
  'ALBUM_CREATE',
  'POST',
  '/album/',
  (name: string, timestamp: Date, release: Date | null, event_id: string) => ({ body: {
    name,
    timestamp,
    release_time: release,
    event_id
  }}),
  schemas.ALBUM
);

export const get = createAPIAction(
  'ALBUM_GET',
  'GET',
  payload => `/album/${payload?.album_id}`,
  (album_id: string) => ({ album_id }),
  schemas.ALBUM
);

export const update = createAPIAction(
  'ALBUM_UPDATE',
  'PUT',
  payload => `/album/${payload?.album_id}`,
  (album_id: string, name: string, timestamp: Date, release: Date | null, event_id: string) => ({
    album_id,
    body: {
      name,
      timestamp,
      release_time: release,
      event_id
    }
  }),
  schemas.ALBUM
);

export const remove = createAPIAction(
  'ALBUM_DELETE',
  'DELETE',
  payload => `/album/${payload?.album_id}`,
  (album_id: string) => ({ album_id })
);

export const clear = createAPIAction(
  'ALBUM_CLEAR',
  'DELETE',
  payload => `/album/${payload?.album_id}/empty`,
  (album_id: string) => ({ album_id })
);

export const updateHiddenStatus = createAPIAction(
  'ALBUM_HIDDEN_UPDATE',
  'PUT',
  payload => `/album/${payload?.album_id}`,
  (album_id: string, secret: boolean, refreshSecret: boolean) => ({
    album_id,
    body: {
      is_secret: secret,
      refresh_secret: refreshSecret
    }
  }),
  schemas.ALBUM
);


