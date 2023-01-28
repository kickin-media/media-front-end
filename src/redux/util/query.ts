export const generateQuery: (params: { [key: string]: any }) => string = (
  params
) => '?' + Object.keys(params)
  .filter(key => params[key] !== undefined && params[key] !== null)
  .map(key => `${key}=${params[key]}`)
  .join('&');
