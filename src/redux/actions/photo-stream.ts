import { createAPIAction } from '../middlewares/api';
import * as schemas from '../schemas';

export const getPage = createAPIAction(
  'PHOTO_STREAM_GET',
  'GET',
  payload => `/photo/stream?page=${payload?.page}&order=${payload?.order}&sort_by=${payload?.sort_by}`,
  (page: number = 0, order: string = 'desc', sort_by: string = 'uploaded') => ({
    page,
    order,
    sort_by
  }),
  schemas.PHOTO_STREAM
);
