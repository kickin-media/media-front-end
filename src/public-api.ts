import { bootstrapApplication } from '@angular/platform-browser';
import { createAngularConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { Config } from "./config";

export * from "./config";

export const bootstrapMediaApp = (config: Config) => {
  bootstrapApplication(AppComponent, createAngularConfig(config))
    .catch((err) => console.error(err));
};
