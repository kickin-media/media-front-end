import { Component } from '@angular/core';
import { EventOverviewPageComponent } from "../event/event-overview-page.component";
import { EventService } from "../../services/api/event.service";
import { filter, first, map } from "rxjs";
import { Router } from "@angular/router";
import slugify from "slugify";

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    EventOverviewPageComponent
  ],
  templateUrl: './home-page.component.html',
})
export class HomePageComponent {

  constructor(
    router: Router,
    eventService: EventService,
  ) {
    eventService.allEvents.data$.pipe(
      // Take the first occurrence with at least one event
      filter(events => events.length > 0),
      first(),
      // Take the latest event (events are sorted by timestamp DESC)
      map(events => events[0])
    ).subscribe(latestEvent => {
      const now = new Date();
      const deltaTime = now.getTime() - new Date(latestEvent.timestamp).getTime();

      if (deltaTime < 0) {
        // If the latest event is in the future, do nothing (shows all events overview)
        return;
      } else if (deltaTime < 1000 * 60 * 60 * 24 * 7 * 4) {
        // If the latest event is less than 4 weeks old, navigate to the latest event
        router.navigate([`/event/${latestEvent.id}/${slugify(latestEvent.name)}`]);
      }
    });
  }

}
