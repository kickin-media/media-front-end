import { Component } from '@angular/core';
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { TitleSectionComponent } from "../components/title-section/title-section.component";
import { EventService } from "../../services/api/event.service";
import { AsyncPipe, NgForOf, NgIf } from "@angular/common";
import { MatMenuModule } from "@angular/material/menu";
import { filter, first, map, Observable, of, switchMap } from "rxjs";
import { MatDialog } from "@angular/material/dialog";
import { EventDialogComponent, EventDialogProps } from "./components/event-dialog/event-dialog.component";
import { Router } from "@angular/router";
import { Album, EventDetailed } from "../../util/types";
import { renderDate } from "../../util/timestamp.pipe";
import { ConfigService } from "../../services/config.service";

@Component({
  selector: 'event-page',
  standalone: true,
  imports: [
    AsyncPipe,
    NgForOf,
    NgIf,

    MatButtonModule,
    MatIconModule,
    MatMenuModule,

    TitleSectionComponent,
  ],
  templateUrl: './event-page.component.html',
  styleUrl: './event-page.component.scss'
})
export class EventPageComponent {

  // Yields albums indexed by date-strings or ""
  protected albums$: Observable<{ [key: string]: Album[] }>;

  constructor(
    protected dialog: MatDialog,
    protected router: Router,

    protected configService: ConfigService,
    protected eventService: EventService,
  ) {
    this.albums$ = this.eventService.albums.data$.pipe(
      map(albums => {
        // const categorized = groupBy()
        return {};
      }),
    );
    eventService.id$.subscribe(console.log);
  }

  editEvent() {
    this.eventService.event.data$.pipe(
      filter(event => event !== null),
      first(),
      switchMap(event => {
        if (!event) return of(null);

        const dialogRef = this.dialog.open(EventDialogComponent, { data: { event } as EventDialogProps });
        return dialogRef.afterClosed() as Observable<EventDetailed | null>
      }),
    ).subscribe(event => {
      if (!event) return;
      this.eventService.event.refresh();
    });
  }

  deleteEvent() {
    this.eventService.id$.pipe(
      first(),
      switchMap(eventId => {
        if (!eventId) return of(false);
        return this.eventService.delete(eventId);
      })
    ).subscribe(result => {
      if (!result) return;
      this.router.navigate(['/event']);
    });
  }

}
