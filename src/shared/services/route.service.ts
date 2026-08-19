import { inject, Injectable, Signal } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, ActivationEnd, Router } from '@angular/router';
import { distinctUntilChanged, filter, map, Observable, shareReplay, startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class RouteService {
  protected router: Router = inject(Router);
  protected activatedRoute: ActivatedRoute = inject(ActivatedRoute);

  public readonly route$: Observable<ActivatedRouteSnapshot>;
  public readonly route: Signal<ActivatedRouteSnapshot>;

  constructor() {
    this.route$ = this.router.events.pipe(
      // Filter `ActivationEnd` types to ensure all sub-routes and variables have been resolved
      filter(event => event instanceof ActivationEnd),
      map(event => event as ActivationEnd),

      // Get the state snapshot
      map(event => event.snapshot),

      // Initialize and fetch the innermost child
      startWith(this.activatedRoute.snapshot),
      map(route => {
        while (route.firstChild !== null) route = route.firstChild;
        return route;
      }),

      // Cache the latest route snapshot
      shareReplay(1)
    );
    this.route = toSignal(this.route$, { initialValue: this.activatedRoute.snapshot });
  }

  public trackRouteParam(name: string): Observable<string | null> {
    return this.route$.pipe(
      map(route => route.paramMap.get(name)),
      distinctUntilChanged(),
      shareReplay(1)
    );
  }

  public trackRouteQuery(name: string): Observable<string | null> {
    return this.route$.pipe(
      map(route => route.queryParamMap.get(name)),
      distinctUntilChanged(),
      shareReplay(1)
    );
  }
}
