# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Angular 18 monorepo for the Kick-In Media tool, a photo management application. The architecture consists of:

- **Library (`media-tool`)**: Reusable components, services, and utilities in `src/`
- **Applications**: Multiple branded instances in `projects/` (kick-in, batavierenrace, jwg) that consume the library

Each application is a different deployment of the same tool with customized branding, API endpoints, and Auth0 configuration.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs kick-in app on port 3000)
npm start

# Build library
npm run build

# Run tests
npm test

# Generate backend API types from OpenAPI spec
npm run api-spec
```

### Working with Specific Applications

```bash
# Serve a specific app
ng serve <app-name>  # kick-in, batavierenrace, or jwg

# Build a specific app
ng build <app-name>

# Test a specific app
ng test <app-name>
```

## Architecture

### Library + Multi-App Structure

- `src/` contains the library code exported via `src/public-api.ts`
- Applications bootstrap using `bootstrapMediaApp(config)` from the library
- Each app in `projects/` has its own `main.ts` that provides app-specific configuration
- Configuration includes: API hosts, Auth0 settings, branding (title, logo, website), contact info, and album grouping logic

### Configuration System

Apps configure the tool via `APP_CONFIG` injection token:

- **apiHosts**: Maps frontend hosts to backend API hosts
- **auth0**: Auth0 domain, clientId, and authorization parameters
- **Corporate Identity**: title, logo, website
- **contact**: name and email
- **albums.groupIndex/groupName/groupSort**: Functions for grouping albums (e.g., by date)
- **uploadIgnoreCriticalWarnings**: Whether to ignore critical EXIF warnings during upload

See `src/config.ts` for the Config interface and `projects/kick-in/src/main.ts` for an example.

### Services Architecture

**BaseService Pattern** (`src/services/base.service.ts`):

- Abstract base class for route-aware services
- Provides `route$` observable tracking the innermost active route
- `trackRouteParam(name)` helper for reactive route parameter tracking
- `fetch()` method with caching, error handling, and default value support

**API Services** (`src/services/api/`):

- `event.service.ts`: Event CRUD operations
- `album.service.ts`: Album CRUD operations
- `photo.service.ts`: Photo CRUD, upload, download
- `author.service.ts`: Photographer/author management

All API services extend BaseService and use the reactive route tracking pattern.

**Other Services**:

- `account.service.ts`: User account and permissions
- `s3.service.ts`: Direct S3 uploads
- `download.service.ts`: Photo download handling
- `share.service.ts`: Share functionality
- `image-quality.service.ts`: Image quality configuration

### Backend Integration

- Backend types and interfaces are auto-generated from OpenAPI spec: `npm run generate-api`
- Generated code is stored in `src/shared/back-end/`
  - DO NOT MANUALLY OVERRIDE THESE FILES!
- API host routing is handled by `src/util/api.interceptor.ts` using the `apiHosts` config
- The backend repository is at https://github.com/kickin-media/media-back-end/

### Application Structure

**Main Pages** (all in `src/app/`):

- `home/`: Landing page (shows latest event if < 4 weeks old)
- `event/`: Event overview and detail pages with album galleries
- `album/`: Album photo gallery with lightbox
- `upload/`: Photo upload interface with EXIF validation

**Routes** (`src/app/app.routes.ts`):

- `/` - Home page
- `/event` - Event overview
- `/event/:event_id/:event_slug` - Event detail
- `/album/:album_id/:album_slug` - Album gallery
- `/album/:album_id/:album_slug?lightbox=:photo_id` - Album with lightbox

### Key Components

**Lightbox** (`src/app/lightbox/`):

- Full-screen photo viewer with navigation
- Download options and photo management controls

**Event Components** (`src/app/event/`):

- Event cards, dialogs for CRUD operations
- `event-overview.datasource.ts`: DataSource for paginated event lists

**Album Components** (`src/app/album/`):

- Album gallery grid with lazy loading
- Album selection and management dialogs

**Upload** (`src/app/upload/`):

- Drag-and-drop photo upload with preview grid
- EXIF validation and image resizing via `browser-image-resizer`
- Critical warnings can be bypassed via `uploadIgnoreCriticalWarnings` config

### Utilities

- `src/util/types.d.ts`: Shared TypeScript interfaces
- `src/util/validate-exif.ts`: EXIF metadata validation
- `src/util/date.ts`: Date formatting utilities
- `src/util/groupby.ts`: Array grouping helper

### Authentication

Uses Auth0 via `@auth0/auth0-angular` with scope-based permissions:

- `events:manage`, `albums:manage`, `albums:read_hidden`
- `photos:upload`, `photos:download_other`, `photos:delete_other`
- `photos:manage_other`, `photos:read_view_count`

## Testing

Tests use Karma + Jasmine. Configuration is per-project in `tsconfig.spec.json` files. Component tests are skipped by default (see schematics config in `angular.json`).
