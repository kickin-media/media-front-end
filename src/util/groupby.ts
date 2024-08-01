export const groupBy = (items, key) => {
  return items.reduce((groups, item) => {
    (groups[item[key]] = groups[item[key]] || []).push(item);
    return groups;
  }, {});
};
