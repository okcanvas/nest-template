import { URL } from 'url';
/**
 * @param urlPath {String} 
 * @param key {String}
 * @return {*}
 */
export const getUrlQuery = (urlPath: string, key: string): string | null => {
  const url = new URL(urlPath, 'https://www.');
  const params = new URLSearchParams(url.search.substring(1));
  return params.get(key);
};
