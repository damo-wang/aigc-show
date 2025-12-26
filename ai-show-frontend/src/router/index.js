import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import WorkDetailView from "../views/WorkDetailView.vue";

const routes = [
  { path: "/", component: HomeView },
  { path: "/works/:id", component: WorkDetailView, props: true }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
