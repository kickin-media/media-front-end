import { bootstrapMediaApp } from "../../../src/public-api";
import { Album } from "../../../src/util/types";

bootstrapMediaApp({
  title: "Jongeren Werkgroep voor Sterrenkunde",
  logo: "/cropped-star-192x192.png",
  website: "https://www.sterrenkunde.nl/jwg",

  contact: {
    name: "Internet Commissie",
    email: "gallery@sterrenkunde.nl",
  },

  apiHosts: {
    // Development (local)
    "localhost": "api.dev.kick-in.media",

    // Production
    "fotos.sterrenkunde.nl": "api.fotos.sterrenkunde.nl",
    "www.fotos.sterrenkunde.nl": "api.fotos.sterrenkunde.nl",
  },

  albums: {
    groupIndex: (album: Album) => new Date(album.timestamp).toDateString(),
    groupName: (index: string) => index,
    groupSort: (a: string, b: string) => new Date(b).getTime() - new Date(a).getTime(),
  },

  auth0: {
    domain: "todo",
    clientId: "todo",

    cacheLocation: "localstorage",
    useRefreshTokens: true,

    authorizationParams: {
      audience: "https://api.fotos.sterrenkunde.nl",
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
