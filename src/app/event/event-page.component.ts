import { Component } from '@angular/core';
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { Breadcrumb, TitleSectionComponent } from "../components/title-section/title-section.component";
import { EventService } from "../../services/api/event.service";
import { AsyncPipe, NgForOf, NgIf } from "@angular/common";
import { MatMenuModule } from "@angular/material/menu";
import { filter, first, map, Observable, of, shareReplay, switchMap } from "rxjs";
import { MatDialog } from "@angular/material/dialog";
import { EventDialogComponent, EventDialogProps } from "./components/event-dialog/event-dialog.component";
import { Router } from "@angular/router";
import { Album, AlbumDetailed, EventDetailed } from "../../util/types";
import { ConfigService } from "../../services/config.service";
import { groupBy } from "../../util/groupby";
import { AlbumComponent } from "../album/components/album/album.component";
import { AlbumDialogComponent } from "../album/components/album-dialog/album-dialog.component";
import { SlugPipe } from "../../util/slug.pipe";
import slugify from "slugify";

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
    AlbumComponent,
    SlugPipe,
  ],
  templateUrl: './event-page.component.html',
  styleUrl: './event-page.component.scss'
})
export class EventPageComponent {

  protected breadcrumb$: Observable<Breadcrumb[] | undefined>;

  // Yields albums indexed by date-strings or ""
  protected albums$: Observable<{ [key: string]: Album[] }>;

  constructor(
    protected dialog: MatDialog,
    protected router: Router,
    protected configService: ConfigService,
    protected eventService: EventService,
  ) {
    this.breadcrumb$ = this.eventService.event.data$.pipe(
      map(event => {
        return [
          { title: 'Events', url: '/event' },
          {
            title: event?.name,
            url: event ? `/event/${event.id}/${slugify(event.name)}` : undefined
          },
        ];
      }),
    );

    this.albums$ = this.eventService.albums.data$.pipe(
      map((albums: Album[]) => albums.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())),
      map((albums: Album[]) => groupBy(albums, configService.config.albums.groupIndex)),
      map(groups => {
        const albums = Object.values(groups).flatMap(albums => albums);
        const albumsPerGroup = albums.length / Object.keys(groups).length;

        if (albums.length > 10 && albumsPerGroup > 4) return groups;
        else return ({ [""]: albums });
      }),
      shareReplay(1),
    );
    eventService.id$.subscribe(console.log);
  }

  createAlbum() {
    this.eventService.event.data$.pipe(
      filter(event => event !== null),
      first(),
      switchMap(event => {
        if (!event) return of(null);

        const dialogRef = this.dialog.open(
          AlbumDialogComponent,
          { data: { event } as EventDialogProps }
        );
        return dialogRef.afterClosed() as Observable<AlbumDetailed | null>;
      }),
    ).subscribe(album => {
      if (!album) return;
      this.router.navigate([`/album/${album.id}/${slugify(album.name)}`]);
    });
  }

  editEvent() {
    this.eventService.event.data$.pipe(
      filter(event => event !== null),
      first(),
      switchMap(event => {
        if (!event) return of(null);

        const dialogRef = this.dialog.open(EventDialogComponent, { data: { event } as EventDialogProps });
        return dialogRef.afterClosed() as Observable<EventDetailed | null>;
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

  protected getAlbumGroupIndices(groups: { [key: string]: Album[] }): string[] {
    return Object.keys(groups).sort(this.configService.config.albums.groupSort);
  }

}
