// In dev, requests go through the Vite proxy (see vite.config.js) to avoid
// CORS, since the APIs only allow https://tridnguyen.com as an origin.
export const SHEETS_API_URL = import.meta.env.DEV
  ? "/api/sheets"
  : "https://sheets.cloud.tridnguyen.com";
export const THIRDPARTY_API_URL = import.meta.env.DEV
  ? "/api/thirdparty"
  : "https://thirdparty.cloud.tridnguyen.com";
