import { Routes } from '@angular/router';
import { EventOverviewPageComponent } from "./event/event-overview-page.component";
import { EventPageComponent } from "./event/event-page.component";
import { AlbumPageComponent } from "./album/album-page.component";

export const routes: Routes = [
  { path: "", component: EventOverviewPageComponent },

  // Events
  { path: "event", component: EventOverviewPageComponent },
  { path: "event/:event_id/:event_slug", component: EventPageComponent },

  // Albums
  {
    path: "album/:album_id/:album_slug",
    component: AlbumPageComponent,
    runGuardsAndResolvers: "pathParamsChange",
  },

  // Compatibility route for photos
  {
    path: "album/:album_id/:album_slug/:photo_id",
    redirectTo: route => {
      const albumId = route.params["album_id"];
      const albumSlug = route.params["album_slug"];
      const photoId = route.params["photo_id"];

      return `/album/${albumId}/${albumSlug}?lightbox=${photoId}`;
    }
  }
];
