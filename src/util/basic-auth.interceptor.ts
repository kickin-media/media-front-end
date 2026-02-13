import { HttpErrorResponse, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { catchError, Observable, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { BasicAuthService } from '../services/basic-auth.service';
import { BasicAuthDialogComponent } from '../components/basic-auth-dialog/basic-auth-dialog.component';

// Shared dialog observable to prevent multiple concurrent dialogs
let pendingAuthDialog: Observable<string | null> | null = null;

export const basicAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const basicAuthService = inject(BasicAuthService);
  const dialog = inject(MatDialog);

  // Add sitewide password header to API requests (relative URLs only)
  const sitewidePassword = basicAuthService.getSitewidePasswordHeader();
  if (sitewidePassword && !req.url.startsWith('http://') && !req.url.startsWith('https://')) {
    req = req.clone({
      setHeaders: { 'X-Sitewide-Password': sitewidePassword }
    });
  }

  // Recursive helper to handle auth errors on both original and retry requests
  const handleAuthError = (request: HttpRequest<any>, error: HttpErrorResponse): Observable<any> => {
    // Check for sitewide authentication requirement
    if (error.status === 401 && error.error?.error === 'authentication_required') {
      // Ensure only one dialog is shown for concurrent 401s
      if (!pendingAuthDialog) {
        // Clear invalid credentials
        basicAuthService.clearCredentials();

        // Extract hint from response body
        const hint = error.error?.hint || 'Please provide the password to access this application.';

        // Open auth dialog
        const dialogRef = dialog.open(BasicAuthDialogComponent, {
          data: { hint },
          disableClose: true,
        });

        // Share dialog result across concurrent requests
        pendingAuthDialog = dialogRef.afterClosed().pipe(
          tap(() => {
            pendingAuthDialog = null;
          }),
          shareReplay(1)
        );
      }

      // Wait for dialog result and retry request
      return pendingAuthDialog.pipe(
        switchMap((password: string | null) => {
          if (password) {
            // Store new credentials
            basicAuthService.setCredentials(password);

            // Retry request with new credentials
            const retryReq = request.clone({
              setHeaders: {
                'X-Sitewide-Password': basicAuthService.getSitewidePasswordHeader()!
              }
            });

            // Recursively handle errors on retry (e.g., wrong password)
            return next(retryReq).pipe(
              catchError((retryError: HttpErrorResponse) => handleAuthError(retryReq, retryError))
            );
          }

          // User cancelled - propagate error
          return throwError(() => error);
        })
      );
    }

    // Not a sitewide auth challenge - propagate error
    return throwError(() => error);
  };

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => handleAuthError(req, error))
  );
};
