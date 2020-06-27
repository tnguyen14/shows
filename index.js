import App from "./App.svelte";

window.API_URL = "__API_URL__";

const app = new App({
  target: document.body,
  props: {},
});

export default app;
