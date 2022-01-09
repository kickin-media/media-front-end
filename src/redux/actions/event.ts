import { createAPIAction } from "../middlewares/api";
import * as schemas from '../schemas';

export const list = createAPIAction(
  'EVENT_LIST',
  'GET',
  '/event/',
  undefined,
  schemas.EVENT_ARRAY
);

export const create = createAPIAction(
  'EVENT_CREATE',
  'POST',
  '/event/',
  (name: string, timestamp: Date) => ({ body: {
      name,
      timestamp
    }}),
  schemas.EVENT
);

export const get = createAPIAction(
  'EVENT_GET',
  'GET',
  payload => `/event/${payload?.event_id}`,
  (event_id: number) => ({ event_id}),
  schemas.EVENT
);

export const update = createAPIAction(
  'EVENT_UPDATE',
  'PUT',
  payload => `/event/${payload?.event_id}`,
  (event_id: number, name: string, timestamp: Date) => ({
    event_id,
    body: {
      name,
      timestamp
    }
  }),
  schemas.EVENT
);

export const remove = createAPIAction(
  'EVENT_DELETE',
  'DELETE',
  payload => `/event/${payload?.event_id}`,
  (event_id: number) => ({ event_id })
);

export const getAlbums = createAPIAction(
  'EVENT_ALBUMS_GET',
  'GET',
  (payload, state) => state.auth.authenticated
    ? `/event/${payload?.event_id}/albums/authenticated`
    : `/event/${payload?.event_id}/albums`,
  (event_id: number) => ({ event_id }),
  schemas.ALBUM_ARRAY
);

export const updateHiddenStatus = createAPIAction(
  'ALBUM_HIDDEN_UPDATE',
  'PUT',
  payload => `/album/${payload?.album_id}`,
  (album_id: number, secret: boolean, refreshSecret: boolean) => ({
    album_id,
    body: {
      is_secret: secret,
      refresh_secret: refreshSecret
    }
  }),
  schemas.ALBUM
);


