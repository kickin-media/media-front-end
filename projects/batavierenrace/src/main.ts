import { bootstrapMediaApp } from "../../../src/public-api";
import { Album } from "../../../src/util/types";

bootstrapMediaApp({
  title: "Batavierenrace",
  logo: "/bata-logo.svg",
  website: "https://www.batavierenrace.nl/",

  contact: {
    name: "Batavierenrace committee",
    email: "nijmegen@batavierenrace.nl,enschede@batavierenrace.nl",
  },

  apiHosts: {
    // Development (local)
    "localhost": "api.dev.kick-in.media",

    // Production
    "fotos.batavierenrace.nl": "api.fotos.batavierenrace.nl.",
    "www.fotos.batavierenrace.nl": "api.fotos.batavierenrace.nl.",
  },

  albums: {
    groupIndex: (album: Album) => new Date(album.timestamp).toDateString(),
    groupName: (index: string) => index,
    groupSort: (a: string, b: string) => new Date(b).getTime() - new Date(a).getTime(),
  },

  auth0: {
    domain: "bata-media.eu.auth0.com",
    clientId: "DM86MjwjORkLBs3u2UhorYAUVlkUVMft",

    cacheLocation: "localstorage",
    useRefreshTokens: true,

    authorizationParams: {
      audience: "https://api.foto.batavierenrace.nl", // Should stay with `foto` instead of `fotos` as the audience could not be updated in Auth0 to the new domain. This is just an identifier and does not relate to the actual domain name.
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
