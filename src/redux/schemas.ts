import { schema } from 'normalizr';

export const EVENT = new schema.Entity('event');
export const EVENT_ARRAY = new schema.Array(EVENT);

export const ALBUM = new schema.Entity('album', {
  event: EVENT,
  photos: new schema.Array(new schema.Entity('photo'))
});

export const ALBUM_ARRAY = new schema.Array(ALBUM);

export const PHOTO = new schema.Entity('photo', {
  albums: ALBUM_ARRAY
});

export const PHOTO_ARRAY = new schema.Array(PHOTO);

export const AUTHOR = new schema.Entity('author', {
  photos: PHOTO_ARRAY
});
