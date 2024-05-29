import { useFoodStore } from "stores/foodStore.js";

export default async ({ app }) => {
  const foodStore = useFoodStore();

  await foodStore.fetchData();
  foodStore.fetchCustomMeals();
  foodStore.fetchDailyIntakeRecords();
};
