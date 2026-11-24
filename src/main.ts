import { createApp, createSSRApp } from "vue";
import App from "./App.vue";
import "./index.css";
import "./redesign.css";

const prerendered = !!document.getElementById("app")?.childElementCount;
(prerendered ? createSSRApp(App) : createApp(App)).mount("#app");
