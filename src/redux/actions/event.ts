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
      timestamp: new Date(timestamp.getTime() + 1000 * 60 * 60 * 2),
    }}),
  schemas.EVENT
);

export const get = createAPIAction(
  'EVENT_GET',
  'GET',
  payload => `/event/${payload?.event_id}`,
  (event_id: string) => ({ event_id}),
  schemas.EVENT
);

export const update = createAPIAction(
  'EVENT_UPDATE',
  'PUT',
  payload => `/event/${payload?.event_id}`,
  (event_id: string, name: string, timestamp: Date) => ({
    event_id,
    body: {
      name,
      timestamp: new Date(timestamp.getTime() + 1000 * 60 * 60 * 2),
    }
  }),
  schemas.EVENT
);

export const remove = createAPIAction(
  'EVENT_DELETE',
  'DELETE',
  payload => `/event/${payload?.event_id}`,
  (event_id: string) => ({ event_id })
);

export const getAlbums = createAPIAction(
  'EVENT_ALBUMS_GET',
  'GET',
  payload => `/event/${payload?.event_id}/albums`,
  (event_id: string) => ({ event_id }),
  schemas.ALBUM_ARRAY
);
