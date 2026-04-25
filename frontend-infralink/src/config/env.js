export const ENV = {
  API_URL: import.meta.env.VITE_API_URL || 'https://infralink-production.up.railway.app/api/v1',
  SOCKET_URL: import.meta.env.VITE_SOCKET_URL || 'https://infralink-production.up.railway.app',
  NODE_ENV: import.meta.env.MODE || 'development',
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
};
