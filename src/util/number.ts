export const renderNumber: (value: number) => string = (value) => {
  if (value > 250000) return Math.round(value / 100000) / 10 + 'M';
  else if (value > 250) return Math.round(value / 100) / 10 + 'K';
  return '' + value;
}