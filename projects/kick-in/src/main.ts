import { bootstrapMediaApp } from "../../../src/public-api";
import { Album } from "../../../src/util/types";

bootstrapMediaApp({
  title: "Kick-In",
  logo: "/logo-white.png",
  website: "https://www.kick-in.nl",

  contact: { name: "Kick-In committee", email: "info@kick-in.nl" },

  apiHosts: {
    // Development (local)
    "localhost": "api.dev.kick-in.media",

    // Testing
    "dev.kick-in.media": "api.dev.kick-in.media",

    // Production
    "kick-in.media": "api.kick-in.media",
    "www.kick-in.media": "api.kick-in.media",
  },

  albums: {
    groupIndex: (album: Album) => new Date(album.timestamp).toDateString(),
    groupName: (index: string) => index,
    groupSort: (a: string, b: string) => new Date(b).getTime() - new Date(a).getTime(),
  },

  auth0: {
    domain: "kickin-media.eu.auth0.com",
    clientId: "JVlKeh2uzBJSw1cwOF34V1Ro57vj5uoh",

    cacheLocation: "localstorage",
    useRefreshTokens: true,

    authorizationParams: {
      audience: "https://api.kick-in.media",
      connection: "kick-in-idb", // Use the Kick-In OAuth connection
      redirect_uri: window.location.origin,
      scope: [
        'openid',
        'profile',
        'email',
        'events:manage',
        'albums:read_hidden',
        'albums:manage',
        'photos:upload',
        'photos:download_other',
        'photos:delete_other',
        'photos:manage_other',
        'photos:read_view_count'
      ].join(' '),
    },
  },
});
