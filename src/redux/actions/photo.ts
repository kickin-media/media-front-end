import { createAPIAction } from "../middlewares/api";
import * as schemas from '../schemas'

export const get = createAPIAction(
  'PHOTO_GET',
  'GET',
  payload => `/photo/${payload?.photo_id}`,
  (photo_id: number) => ({ photo_id }),
  schemas.PHOTO
);

export const remove = createAPIAction(
  'PHOTO_DELETE',
  'DELETE',
  payload => `/photo/${payload?.photo_id}`,
  (photo_id: number) => ({ photo_id })
);

export const getOriginal = createAPIAction(
  'PHOTO_ORIGINAL_GET',
  'GET',
  payload => `/photo/${payload?.photo_id}/original`,
  (photo_id: number) => ({ photo_id })
);

export const reprocess = createAPIAction(
  'PHOTO_REPROCESS',
  'POST',
  payload => `/photo/${payload?.photo_id}`,
  (photo_id: number) => ({ photo_id })
);

export const create = createAPIAction(
  'PHOTO_CREATE',
  'POST',
  '/photo/'
);

export const setAlbums = createAPIAction(
  'PHOTO_ALBUM_SET',
  'PUT',
  payload => `/photo/${payload?.photo_id}/albums`,
  (photo_id: number) => ({ photo_id })
);
