import MealForm from "pages/MealFormPage.vue";
//import DailyForm from "pages/DailyFormPage.vue";

const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "meals", component: MealForm },
      // { path: "daily", component: DailyForm },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
