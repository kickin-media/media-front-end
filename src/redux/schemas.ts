import { schema } from 'normalizr';

export const EVENT = new schema.Entity('event', {}, {
  processStrategy: (value, parent, key) => Object.assign({}, value, {
    timestamp: new Date(value.timestamp)
  })
});
export const EVENT_ARRAY = new schema.Array(EVENT);

export const ALBUM = new schema.Entity('album', {
  event: EVENT,
  photos: new schema.Array(new schema.Entity('photo', {}, {
    processStrategy: (value, parent, key) => Object.assign({}, value, {
      timestamp: new Date(value.timestamp),
      uploadedAt: new Date(value.uploadedAt)
    })
  }))
}, {
  processStrategy: (value, parent, key) => Object.assign({}, value, {
    releaseTime: value.releaseTime === null ? null : new Date(value.releaseTime),
    timestamp: new Date(value.timestamp)
  })
});

export const ALBUM_ARRAY = new schema.Array(ALBUM);

export const PHOTO = new schema.Entity('photo', {
  albums: ALBUM_ARRAY
}, {
  processStrategy: (value, parent, key) => Object.assign({}, value, {
    timestamp: new Date(value.timestamp),
    uploadedAt: new Date(value.uploadedAt)
  })
});

export const PHOTO_ARRAY = new schema.Array(PHOTO);

export const AUTHOR = new schema.Entity('author', {
  photos: PHOTO_ARRAY
});

export const PHOTO_STREAM = new schema.Entity('photoStream', {
  photos: PHOTO_ARRAY
}, {
  idAttribute: 'page'
});
