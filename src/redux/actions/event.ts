import { createAPIAction } from "../middlewares/api";
import * as schemas from '../schemas';
import { toLocalDateString } from "../util/date";

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
  (name: string, timestamp: Date, locked: boolean) => ({ body: {
      name,
      timestamp: toLocalDateString(timestamp),
      locked
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
  (event_id: string, name: string, timestamp: Date, locked: boolean) => ({
    event_id,
    body: {
      name,
      timestamp: toLocalDateString(timestamp),
      locked
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

export const getWatermark = createAPIAction(
  'EVENT_WATERMARK_GET',
  'GET',
  payload => `/event/${payload?.event_id}/watermark`,
  (event_id: string) => ({ event_id }),
  schemas.EVENT_WATERMARK
);

export const createWatermark = createAPIAction(
  'ACTION_WATERMARK_CREATE',
  'POST',
  payload => `/event/${payload?.event_id}/watermark`,
  (event_id: string) => ({ event_id })
)

export const deleteWatermark = createAPIAction(
  'ACTION_WATERMARK_DELETE',
  'DELETE',
  payload => `/event/${payload?.event_id}/watermark`,
  (event_id: string) => ({ event_id })
)
