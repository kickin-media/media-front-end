import { components } from "./back-end";

// Albums
export type Album = components["schemas"]["AlbumReadList"];
export type AlbumDetailed = components["schemas"]["AlbumReadSingle"];
export type AlbumCreate = components["schemas"]["AlbumCreate"];
export type AlbumUpdate = components["schemas"]["AlbumUpdate"];

// Events
export type PhotoEvent = components["schemas"]["EventReadList"];
export type EventDetailed = components["schemas"]["EventReadSingle"];
export type EventCreate = components["schemas"]["EventCreate"];
export type EventUpdate = EventCreate;

// Photos
export type Photo = components["schemas"]["PhotoReadSingleStub"];
export type PhotoDetailed = components["schemas"]["PhotoReadSingle"];
export type PhotoUpload = components["schemas"]["PhotoUploadResponse"];

// S3
export type S3PreSignedUrl = components["schemas"]["PhotoUploadPreSignedUrl"];
