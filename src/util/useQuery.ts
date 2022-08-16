import { useLocation } from "react-router-dom";

const useQuery = () => {
  const location = useLocation();
  return location.search
    .substring(1)
    .split('&')
    .filter(e => e.length > 0)
    .map(e => e.split('='))
    .reduce((prev, cur) => Object.assign({}, prev, { [cur[0]]: cur[1] }), {});
}

export default useQuery;
