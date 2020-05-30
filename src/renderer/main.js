import App from "./App";
import Vue from "vue";
import axios from "axios";

import { BootstrapVue, IconsPlugin } from "bootstrap-vue";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";

import router from "./router";
import store from "./store";

import VueSidebarMenu from "vue-sidebar-menu";
import "vue-sidebar-menu/dist/vue-sidebar-menu.css";

import { library } from "@fortawesome/fontawesome-svg-core";
import { faUserSecret } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import "vue-sidebar-menu/dist/vue-sidebar-menu.css";
import "font-awesome/css/font-awesome.css";
import db from "./datastore";

const { autoUpdater } = require("electron-updater");

Vue.prototype.$db = db;

Vue.use(VueSidebarMenu);

Vue.use(BootstrapVue);
Vue.use(IconsPlugin);

library.add(faUserSecret);
Vue.component("font-awesome-icon", FontAwesomeIcon);
Vue.config.productionTip = false;

if (!process.env.IS_WEB) Vue.use(require("vue-electron"));

Vue.http = Vue.prototype.$http = axios.create({
  baseURL: "https://api.smugmug.com/api/v2/",
  headers: { Accept: "application/json" },
});

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: "<App/>",
}).$mount("#app");
