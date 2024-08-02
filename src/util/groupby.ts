export const groupBy = <T, K extends keyof any>(
  items: T[],
  key: (i: T) => K
) => items.reduce(
  (groups, item) => {
    (groups[key(item)] ||= []).push(item);
    return groups;
  },
  {} as Record<K, T[]>
);
