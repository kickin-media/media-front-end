import { AnyAction, Middleware } from "@reduxjs/toolkit";

import { normalize, schema } from 'normalizr';
import { StateType } from "../reducers/reducers";
import { AuthenticatedType } from "../reducers/auth";
import { transformResponse } from "../util/transform";

export const CALL_API = 'CALL_API';

export interface ApiCallType {
  types: {
    request: string,
    failure: string,
    success: string
  };

  url: string | ((state: StateType) => string);
  options?: RequestInit;

  injectResponse?: object;
  schema?: schema.Entity;
}

export interface ApiActionType extends AnyAction {
  type: 'CALL_API';
  payload: PayloadType;

  [CALL_API]: ApiCallType;
}

type PayloadType = { [key: string]: any };
export const createAPIAction: <PA extends (...args: any[]) => PayloadType | undefined = () => undefined>(
  action: string,
  method: string,
  url: string | ((state: StateType) => string),
  createPayload?: PA,
  schema?: schema.Entity,
  injectResponse?: object
)  => ((...args: Parameters<PA>) => AnyAction) & { request: string, success: string, failure: string } = (
  action, method, url, createPayload, schema, injectResponse
) => {
  const actionCreator = (...args: any[]) => {
    const payload = createPayload ? createPayload(args) : undefined;

    return {
      type: CALL_API,
      payload,

      [CALL_API]: {
        types: {
          request: `${action.toUpperCase()}_REQUEST`,
          success: `${action.toUpperCase()}_SUCCESS`,
          failure: `${action.toUpperCase()}_FAILURE`,
        },

        url,
        options: {
          method,
          body: payload && payload.body ? payload.body : undefined
        },

        injectResponse,
        schema
      }
    } as ApiActionType;
  };

  actionCreator.request = `${action.toUpperCase()}_REQUEST`;
  actionCreator.success = `${action.toUpperCase()}_SUCCESS`;
  actionCreator.failure = `${action.toUpperCase()}_FAILURE`;

  return actionCreator;
};

export const apiMiddleware: (endpoint: string) => Middleware = endpoint => api => next => {
  const injectHeaders: (options?: RequestInit) => RequestInit = options => {
    const auth = (api.getState() as StateType).auth.authenticated
      ? ((api.getState() as StateType).auth as AuthenticatedType).accessToken
      : null;

    return {
      ...(options ? options : {}),
      ...{
        headers: {
          'Content-Type': 'application/json',
          ...(auth ? { 'Authorization': `Bearer ${auth}` } : {}),
          ...(options && options.headers ? options.headers : {})
        }
      }
    };
  };

  // noinspection HttpUrlsUsage
  const makeCall: (apiCall: ApiCallType) => Promise<any> = apiCall => {
    let url = apiCall.url as string;
    if (!url.startsWith('https://') && !url.startsWith('http://')) url = endpoint + url;

    return fetch(url, injectHeaders(apiCall.options)).then(
      response => {
        const type = (response.headers.get('Content-Type') as string).split(';')[0];

        // Handle non-ok response-status
        if (!response.ok) {
          // TODO: Handle invalid authentication

          switch (type) {
            case 'application/json':
              return response.json().then(json => Promise.reject(json));

            default:
              return response.text().then(text => Promise.reject(text));
          }
        }

        // Don't do anything if the response is empty
        if (response.statusText === 'No Content') return {};

        switch (type) {
          // Handle regular JSON responses from the API
          case 'application/json':
            return response.json().then(json => {
              // Transform the API's snake case to camelcase
              json = transformResponse(json);

              // Inject data into the response from the API
              json = Object.assign({}, json, apiCall.injectResponse ? apiCall.injectResponse : {});

              // Parse the data according to (optional) schemas
              if (apiCall.schema) json = normalize(json, apiCall.schema);
              else if (process.env.NODE_ENV !== 'production')
                console.warn(`No schema specified for endpoint: ${url}`);

              return Object.assign({}, json);
            });
        }

        if (process.env.NODE_ENV !== 'production')
          console.warn(`Unhandled API response type '${type}' on API url: ${url}`);

        return {};
      },
      error => {
        console.error(error);
        return Promise.reject(error);
      }
    )
  };

  return (action) => {
    // Catch any undefined actions and cancel processing
    if (!action) return;

    // If there is no CALL_API block in the action, then just ignore it and pass the action on to the next middleware
    const callAPI: ApiCallType | undefined = action[CALL_API];
    if (typeof callAPI === "undefined") return next(action);

    // Correct the endpoint
    if (typeof callAPI.url === 'function') callAPI.url = callAPI.url(api.getState());

    // Declare a small action generator
    const actionWith = (data: any) => {
      const finalAction = Object.assign({}, action, data);
      delete finalAction[CALL_API];
      return finalAction;
    };

    // Announce the start of the API request
    next(actionWith({ type: callAPI.types.request }));

    // Finally, start the request
    return makeCall(callAPI).then(
      response => next(actionWith({ type: callAPI.types.success, response })),
      error => next(actionWith({ type: callAPI.types.failure, error }))
    );
  };
}
