import { ActivatedRoute, ActivatedRouteSnapshot, ActivationEnd, Router } from "@angular/router";
import {
  catchError,
  combineLatest,
  distinctUntilChanged,
  filter,
  first,
  map,
  Observable,
  of,
  pairwise,
  share,
  shareReplay,
  startWith,
  Subject,
  switchMap
} from "rxjs";

export abstract class BaseService {

  protected readonly route$: Observable<ActivatedRouteSnapshot>;

  constructor(
    protected router: Router,
    protected activatedRoute: ActivatedRoute,
  ) {
    this.route$ = this.router.events.pipe(
      // Filter `ActivationEnd` types to ensure all sub-routes and variables have been resolved
      filter(event => event instanceof ActivationEnd),
      map(event => event as ActivationEnd),

      // Get the state snapshot
      map(event => event.snapshot),

      // Initialize and fetch the innermost child
      startWith(activatedRoute.snapshot),
      map(route => {
        while (route.firstChild !== null) route = route.firstChild;
        return route;
      }),

      // Cache the latest route snapshot
      shareReplay(1),
    );

    // Prime the observable
    this.route$.pipe(first()).subscribe();
  }

  protected trackRouteParam(name: string): Observable<string | null> {
    return this.route$.pipe(
      map(route => route.paramMap.get(name)),
      distinctUntilChanged(),
      shareReplay(1),
    );
  }

  protected fetch<
    T,
    D extends T | null | []
  >(
    fn: () => Observable<T>,
    defaultValue: D,
    cache: boolean | number = false,
  ): FetchedObject<T | D> {
    return this.fetchOnChange(of(true), fn, defaultValue, cache);
  }

  protected fetchOnChange<
    Id extends NonNullable<any>,
    T,
    D extends T | null | [],
  >(
    input$: Observable<Id | null>,
    fn: (input: NonNullable<Id>) => Observable<T>,
    defaultValue: D,
    cache: boolean | number = false,
  ): FetchedObject<T | D> {
    // Create a refresh trigger
    const refreshTrigger$ = new Subject<void>();

    // Take pairwise input to make the distinction between new data or a refresh
    const pairwise$ = combineLatest([
      input$,
      refreshTrigger$.pipe(startWith(null)),
    ]).pipe(
      map(([input]) => input),
      startWith(null),
      pairwise(),
    );

    // Fetch data on ID change
    const state$: Observable<FetchState<T | D | undefined>> = pairwise$.pipe(
      switchMap(([prev, current]) => {
        // If the current ID is `null` or `undefined`, then yield the default value
        if (current === null || current === undefined) {
          return of({
            data: defaultValue,
            loading: false,
            error: false,
          });
        }

        return fn(current).pipe(
          // Ensure this fetch doesn't keep emitting events by unsubscribing after the first result
          first(),

          // Wrap data in return type
          map(data => ({ data, loading: false, error: false })),

          // Broadcast an initial loading state
          startWith({
            // When selecting new data (prev !== current), substitute defaultValue as intermediate;
            // on the other hand, when refreshing data for the current ID (prev !== current) we want
            // to keep showing the current data until the refresh is done, so we inject undefined
            // into the data, and filter it out with the creation of the readable data$ observable.
            data: prev === current ? undefined : defaultValue,
            loading: true,
            error: false,
          }),

          // Set error state on error
          catchError(() => of({ data: defaultValue, loading: false, error: true })),

          // Start with an empty state
          startWith({ data: defaultValue, loading: false, error: false }),
        );
      }),

      // Multicast result with optional cache
      cache === false
        ? share()
        : shareReplay(1, typeof cache === "number" ? cache : undefined),
    );

    return Object.freeze({
      data$: state$.pipe(
        map(state => state.data),
        filter(data => data !== undefined),
        map(data => data as T | D),
      ),
      loading$: state$.pipe(map(state => state.loading)),
      error$: state$.pipe(map(state => state.error)),

      refresh: () => refreshTrigger$.next(),
    });
  }

  protected transformFetchedObject<I extends NonNullable<any> | null, O>(
    obj: FetchedObject<I>,
    fn: (data: NonNullable<I>) => O,
    defaultValue: O,
    cache: boolean = false,
  ): FetchedObject<O> {
    return Object.freeze({
      ...obj,
      data$: obj.data$.pipe(
        map(data => {
          if (data === null || data === undefined) return defaultValue;
          else return fn(data);
        }),

        // Multicast result with optional cache
        !cache ? share() : shareReplay(1),
      ),
    });
  }

}

interface FetchState<T> {
  data: T;
  loading: boolean;
  error: boolean;
}

interface FetchedObj<T> {
  data$: Observable<T>;
  loading$: Observable<boolean>;
  error$: Observable<boolean>;

  refresh: () => void;
}

export type FetchedObject<T> = FetchedObj<T>;
