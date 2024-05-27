import { defineStore } from "pinia";

export const useFoodStore = defineStore({
  id: "foodStore",
  state: () => ({
    foodData: [],
    userCustomMeals: [],
  }),
  actions: {
    async fetchData() {
      const corsProxyUrl = "https://cors-anywhere.herokuapp.com/";
      await fetch(
        corsProxyUrl + "https://www.matvaretabellen.no/api/nb/foods.json"
      )
        .then((response) => response.json())
        .then((data) => (this.foodData = data));
    },
    fetchCustomMeals() {
      const storedMeals = localStorage.getItem("customMeals");
      this.userCustomMeals = storedMeals ? JSON.parse(storedMeals) : [];
    },
    addCustomMeal(newCustomMeal) {
      const existingMealIndex = this.userCustomMeals.findIndex(
        (meal) => meal.name === newCustomMeal.name
      );

      if (existingMealIndex !== -1) {
        this.userCustomMeals[existingMealIndex] = newCustomMeal;
      } else {
        this.userCustomMeals.push(newCustomMeal);
      }

      localStorage.setItem("customMeals", JSON.stringify(this.userCustomMeals));
    },
  },
});
