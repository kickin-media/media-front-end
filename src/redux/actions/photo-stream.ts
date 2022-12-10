import { createAPIAction } from '../middlewares/api';
import * as schemas from '../schemas';

export const getPage = createAPIAction(
  'PHOTO_STREAM_GET',
  'GET',
  payload => payload?.timestamp
    ? `/photo/stream?timestamp=${payload?.timestamp}&direction=${payload?.direction}&sort_by=${payload?.sort_by}`
    : `/photo/stream?direction=${payload?.direction}&sort_by=${payload?.sort_by}`,
  (timestamp: Date | undefined = undefined, direction: 'older' | 'newer' = 'older', sort_by: string = 'uploaded') => ({
    timestamp: timestamp ? Math.round(timestamp.getTime() / 1000) + 60 * 60 * 2 : undefined,
    direction,
    sort_by
  }),
  schemas.PHOTO_STREAM
);
