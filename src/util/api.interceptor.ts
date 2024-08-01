import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from "@auth0/auth0-angular";
import { inject } from "@angular/core";
import { catchError, map, of, switchMap } from "rxjs";

export type ApiConfig = Record<string, string>;

export const apiHttpInterceptor: (config: ApiConfig) => HttpInterceptorFn = (config) => (req, next) => {
  const url = req.url;

  // noinspection HttpUrlsUsage
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    const apiHost = config[window.location.hostname];
    const auth = inject(AuthService);

    return auth.getAccessTokenSilently().pipe(
      catchError(() => of(null)),
      map(token => req.clone({
        url: `https://${apiHost}${url}`,
        setHeaders: token ? { Authorization: `Bearer ${token}` } : undefined,
      })),
      switchMap(req => next(req)),
    );
  }

  return next(req);
};
