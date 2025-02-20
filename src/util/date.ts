export const serializeDate: (date: Date) => string = date => {
  // Ensure type is date type (can go wrong with datePicker values)
  date = new Date(JSON.stringify(date).replaceAll("\"", ""));

  // Correct timezone
  const res = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
  return JSON.stringify(res).replaceAll("\"", "");
};
