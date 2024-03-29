import { createAPIAction } from "../middlewares/api";
import * as schemas from '../schemas';
import { toLocalDateString } from "../util/date";

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
    timestamp: toLocalDateString(timestamp),
    release_time: release ? toLocalDateString(release) : null,
    event_id
  }}),
  schemas.ALBUM
);

export const get = createAPIAction(
  'ALBUM_GET',
  'GET',
  payload => payload?.secret
    ? `/album/${payload?.album_id}?secret=${payload?.secret}`
    : `/album/${payload?.album_id}`,
  (album_id: string, secret?: string) => ({ album_id, secret }),
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
      timestamp: toLocalDateString(timestamp),
      release_time: release ? toLocalDateString(release) : null,
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
  payload => `/album/${payload?.album_id}/hidden`,
  (album_id: string, secret: boolean, refreshSecret: boolean) => ({
    album_id,
    body: {
      is_secret: secret,
      refresh_secret: refreshSecret
    }
  }),
  schemas.ALBUM
);

export const updateAlbumCover = createAPIAction(
  'ALBUM_COVER_UPDATE',
  'PUT',
  payload => `/album/${payload?.album_id}/cover`,
  (album_id: string, photo_id: string) => ({
    album_id,
    body: { photo_id: photo_id }
  }),
  schemas.ALBUM
);

export const increaseViewCount = createAPIAction(
  'ALBUM_VIEWCOUNT_INCREASE',
  'PUT',
  payload => `/album/${payload?.album_id}/view`,
  (album_id: string) => ({ album_id })
);
