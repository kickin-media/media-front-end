import { Routes } from '@angular/router';
import { EventOverviewPageComponent } from "./event/event-overview-page.component";
import { EventPageComponent } from "./event/event-page.component";

export const routes: Routes = [
  { path: "", component: EventOverviewPageComponent },
  { path: "event", component: EventOverviewPageComponent },
  { path: "event/:event_id/:event_slug", component: EventPageComponent },
];
