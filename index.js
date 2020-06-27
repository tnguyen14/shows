import App from "./App.svelte";

window.SHEETS_API_URL = "__SHEETS_API_URL__";
window.THIRDPARTY_API_URL = "__THIRDPARTY_API_URL__";

const app = new App({
  target: document.body,
  props: {},
});

export default app;
