# Kick-In Media Front-end
_Front-end for the Kick-In Media App. Communicates with the corresponding back-end
in this GitHub organization._

#### Requirements

- [Back-end](https://github.com/kickin-media/media-back-end/)
- [Auth0 App Token](https://auth0.com/)
- [yarn](https://yarnpkg.com/)
- [NodeJS](https://nodejs.org/en/) _(developed on NodeJS v18.7.0)_

## Usage

#### 1. Installing packages
Use `yarn install` in order to install all the requirements locally.

#### 2. Run development instance
Run a local development instance with `npm start`.

#### 3. Create production build
Create a production-ready build with `npm run build`, the application accepts the
following environment variables:
- `REACT_APP_API_ENV=<"prod" | string>`
  Specifies which API environment the front-end should use for its communication
  with the back-end.
