import { createAPIAction } from "../middlewares/api";
import * as schemas from '../schemas';

export const get = createAPIAction(
  'AUTHOR_GET',
  'GET',
  payload => `/author/${payload?.author_id}`,
  (author_id: string) => ({ author_id }),
  schemas.AUTHOR
);

export const update = createAPIAction(
  'AUTHOR_UPDATE',
  'PUT',
  '/author/',
  (name: string) => ({ body: { name } }),
);

export const remove = createAPIAction(
  'AUTHOR_DELETE',
  'DELETE',
  '/author/',
);
