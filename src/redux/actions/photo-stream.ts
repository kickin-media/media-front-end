import { createAPIAction } from '../middlewares/api';
import * as schemas from '../schemas';
import { generateQuery } from "../util/query";

export const getStream = createAPIAction(
  'PHOTO_STREAM_GET',
  'GET',
  payload => payload
    ? '/photo/stream' + generateQuery(payload)
    : '/photo/stream',
  (
    timestamp: Date | undefined = undefined,
    direction: 'older' | 'newer' = 'older',
    sort_by: string = 'uploaded',
    next_photo: string | undefined = undefined
  ) => ({
    timestamp: timestamp ? Math.round(timestamp.getTime() / 1000) + 60 * 60 * 2 : undefined,
    direction,
    photo_id_start: next_photo,
    sort_by
  }),
  schemas.PHOTO_STREAM
);
