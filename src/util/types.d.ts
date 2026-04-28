import * as openapi from '../shared/back-end';

// Albums
export type Album = openapi.AlbumReadList;
export type AlbumDetailed = openapi.AlbumReadSingle;
export type AlbumCreate = openapi.AlbumCreate;
export type AlbumUpdate = AlbumCreate;

// Author
export type Author = openapi.AuthorReadSingle;
export type AuthorCreate = openapi.AuthorCreate;

// Events
export type PhotoEvent = openapi.EventReadList;
export type EventDetailed = openapi.EventReadSingle;
export type EventCreate = openapi.EventCreate;
export type EventUpdate = EventCreate;

// Photos
export type Photo = openapi.PhotoReadSingleStub;
export type PhotoDetailed = openapi.PhotoReadSingle;
export type PhotoUpload = openapi.PhotoUploadResponse;

// S3
export type S3PreSignedUrl = openapi.PhotoUploadPreSignedUrl;
