
export const toLocalTimezone: (date: Date) => Date = (
  date
) => new Date(date.getTime() - date.getTimezoneOffset() * 1000 * 60);

export const toLocalDateString: (date: Date) => string = (
  date
) => toLocalTimezone(date).toJSON();
