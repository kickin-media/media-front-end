import { ApiConfig } from "./util/api.interceptor";
import { InjectionToken } from "@angular/core";
import { AuthConfig } from "@auth0/auth0-angular";
import { Album } from "./util/types";
import { T } from "@angular/cdk/keycodes";

export interface Config<T extends string | number | symbol> {

  // API
  apiHosts: ApiConfig;

  // Auth0
  auth0?: AuthConfig,

  // Corporate Identity
  title: string;
  logo: string;
  website: string;

  // Contact info
  contact: {
    name: string,
    email: string,
  };

  // Album grouping (for event page)
  albumGroupIndex: (album: Album) => T;
  albumGroupName: (index: T) => string;

}

const defaultConfig: Config<string> = {
  apiHosts: {},

  title: "No title",
  logo: "https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg",
  website: "https://www.example.com/",

  contact: { name: "Unknown", email: "unknown@example.com" },

  albumGroupIndex: (album: Album) => new Date(album.timestamp).toDateString(),
  albumGroupName: (index: string) => index,
};

export const APP_CONFIG = new InjectionToken<Config<any>>(
  "Media tool application config",
  { factory: () => defaultConfig }
);
