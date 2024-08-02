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
  { path: "album/:album_id/:album_slug", component: AlbumPageComponent },
];
