import { useHistory } from "react-router-dom";
import { useEffect } from "react";

const SITE_ID_PROD = 'daa4f0a8-78f3-46e5-9b6f-431177a3fd2e';
const SITE_ID_DEV = 'c06799af-69b0-481e-887a-f23e4a86fc59';

const getSiteId: () => string = () => process.env.REACT_APP_API_ENV === 'prod' ? SITE_ID_PROD : SITE_ID_DEV;

export const trackEvent: (type: string, value: string) => void = (type, value) => fetch(
  'https://analytics.aws.kick-in.media/api/collect', {
    method: 'POST',
    body: JSON.stringify({
      type: 'event',
      payload: {
        website: getSiteId(),
        event_type: type,
        event_value: value,
        hostname: window.location.hostname,
        language: navigator.language,
        screen: `${window.screen.width}x${window.screen.height}`
      }
    }),
  }
);

export const trackPage: (url: string, referrer: string) => void = (url, referrer) => fetch(
  'https://analytics.aws.kick-in.media/api/collect', {
    method: 'POST',
    body: JSON.stringify({
      type: 'pageview',
      payload: {
        website: getSiteId(),
        url: url,
        referrer: referrer,
        hostname: window.location.hostname,
        language: navigator.language,
        screen: `${window.screen.width}x${window.screen.height}`
      }
    }),
  }
);

export const usePageTracking = () => {
  const history = useHistory();
  useEffect(() => {
    trackPage(history.location.pathname, document.referrer)
    let prev = history.location.pathname;
    history.listen(l => {
      if (l.pathname === prev) return;

      trackPage(l.pathname, '');
      prev = l.pathname;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
