const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;
const MONTH = 365 * DAY / 12;
const YEAR = 365 * DAY;

export const relativeDate: (date: Date) => string = (date) => {
  const diff = new Date().getTime() - date.getTime();

  if (diff < 0) return 'in the future';
  if (diff < MINUTE) return 'less than a minute ago';
  if (diff < 1.5 * MINUTE) return 'a minute ago';
  if (diff < 5 * MINUTE) return 'a few minutes ago';
  if (diff < HOUR) return `${Math.round(diff / MINUTE)} minutes ago`;
  if (diff < 1.5 * HOUR) return 'an hour ago';
  if (diff < DAY) return `${Math.round(diff / HOUR)} hours ago`;
  if (diff < 1.5 * DAY) return 'a day ago';
  if (diff < 1.5 * WEEK) return `${Math.round(diff / DAY)} days ago`;
  if (diff < 1.5 * MONTH) return `${Math.round(diff / WEEK)} weeks ago`;
  if (diff < 1.5 * YEAR) return `${Math.round(diff / MONTH)} months ago`;

  return renderDate(date, false);
};

export const renderDate: (date: Date, includeDay?: boolean) => string = (date, includeDay = true) => {
  const day = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday'][date.getDay()];
  const dom = date.getDate();
  const month = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ][date.getMonth()];
  const year = date.getFullYear();

  return includeDay
    ? `${day} ${month} ${dom} ${year}`
    : `${month} ${dom} ${year}`;
}
