import { schema } from 'normalizr';

export const EVENT = new schema.Entity('event');

export const ALBUM = new schema.Entity('album', {
  event: EVENT,
  photos: new schema.Array(new schema.Entity('photo'))
});

export const PHOTO = new schema.Entity('photo', {
  albums: new schema.Array(ALBUM)
});

export const AUTHOR = new schema.Entity('author', {
  photos: new schema.Array(PHOTO)
});
