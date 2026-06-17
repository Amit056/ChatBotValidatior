import http from 'k6/http';

export function get(url, headers = {}) {
  return http.get(url, { headers });
}

export function post(url, payload, headers = {}) {
  return http.post(url, payload, { headers });
}