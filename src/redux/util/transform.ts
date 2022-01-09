export const transformResponse: (response: { [key: string]: any }) => any = response => {
  let res: { [key: string]: any } = {};

  Object.keys(response).forEach(key => {
    let value = response[key];
    if (typeof value === 'object' && value !== null) value = transformResponse(value);

    let newKey = key.replace(/_+([^\W_])|_+/g, (match: string) =>
      match.replace("_", "").toUpperCase()
    );

    res[newKey] = value;
  });

  return res;
}