import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { Config } from "../config";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { apiHttpInterceptor } from "../util/api.interceptor";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from "@angular/material/form-field";
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from "@angular/material/snack-bar";
import { ConfigService } from "../services/config.service";
import { authHttpInterceptorFn, provideAuth0 } from "@auth0/auth0-angular";
import { provideNativeDateAdapter } from "@angular/material/core";

export const createAngularConfig: (config: Config<any>) => ApplicationConfig = (config) => ({
  providers: [
    // Project configuration (ie. Kick-In / Bata specific options)
    { provide: ConfigService, useValue: new ConfigService(config) },

    // Angular config
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

    // Auth0
    provideAuth0(config.auth0),

    // HttpClient
    provideHttpClient(withInterceptors([
      apiHttpInterceptor(config.apiHosts),
      authHttpInterceptorFn
    ])),

    // Material UI
    provideAnimationsAsync(),
    provideNativeDateAdapter(),
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: "outline" } },
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: {
        duration: 4000, // [ms] => 4 seconds
        horizontalPosition: "start",
        verticalPosition: "bottom",
      },
    },
  ],
});
