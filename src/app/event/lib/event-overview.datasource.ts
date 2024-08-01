import { CollectionViewer, DataSource, ListRange } from "@angular/cdk/collections";
import { Album, PhotoEvent } from "../../../util/types";
import { EventService } from "../../../services/api/event.service";
import {
  combineLatest,
  concatAll,
  EMPTY,
  empty,
  expand,
  filter,
  map,
  mergeScan,
  Observable,
  of,
  pairwise,
  startWith, tap
} from "rxjs";

export class EventOverviewDataSource extends DataSource<EventItem> {

  constructor(
    protected eventService: EventService,
  ) {
    super();
  }

  override connect(collectionViewer: CollectionViewer): Observable<EventItem[]> {
    const indices$ = collectionViewer.viewChange.pipe(
      startWith({ start: 0, end: 0 } as ListRange),
      startWith({ start: -1, end: -1 } as ListRange),
      mergeScan(
        (acc, next) => of({
          start: next.end > acc.end ? acc.end + 1 : acc.start,
          end: next.end > acc.end ? next.end : acc.end,
        } as ListRange),
        { start: -1, end: -1} as ListRange,
      ),

      pairwise(),
      filter(([prevRange, curRange]) => curRange.start > prevRange.start),
      map(([prevRange, curRange]) => curRange),
    );

    return combineLatest([indices$, this.eventService.allEvents.data$]).pipe(
      filter(([range, events]) => range.start < events.length),
      map(([range, events]) => ({
        ...range,
        start: range.start + 1,
        event: events[range.start],
        allEvents: events,
      })),
      expand(item => {
        if (item.start > item.end || item.start >= item.allEvents.length) return EMPTY;
        return of({
          ...item,
          start: item.start + 1,
          event: item.allEvents[item.start],
        });
      }),

      map(item => this.eventService.fetchEventAlbums(item.event.id).pipe(
        map(albums => ({ event: item.event, albums, _allEvents: item.allEvents } as EventItem)),
      )),
      concatAll(),

      mergeScan(
        (acc, next) => of([...acc, next]),
        [] as EventItem[],
      ),

      map(items => [
        ...items,
        ...items.length > 0
          ? items[0]._allEvents.slice(items.length).map(event => ({
            event,
            _allEvents: items[0]._allEvents,
          }))
          : [],
      ]),
    );
  }

  override disconnect(collectionViewer: CollectionViewer) {
  }
}

interface EventItem {
  event: PhotoEvent;
  albums?: Album[];

  _allEvents: PhotoEvent[];
}
