import { defineStore } from "pinia";

export const useFoodStore = defineStore({
  id: "foodStore",
  state: () => ({
    apiFoodData: [],
    userCustomMeals: [],
    dailyIntakeRecords: [],
  }),
  actions: {
    async fetchData() {
      const corsProxyUrl = "https://cors-anywhere.herokuapp.com/"; // Proxy that adds CORS headers to requests. Bad for production, needs to be re-enabled every 24 hours.
      await fetch(
        corsProxyUrl + "https://www.matvaretabellen.no/api/nb/foods.json"
      )
        .then((response) => response.json())
        .then((data) => (this.apiFoodData = data));
    },
    fetchCustomMeals() {
      const storedMeals = localStorage.getItem("customMeals");
      this.userCustomMeals = storedMeals ? JSON.parse(storedMeals) : [];
    },
    fetchDailyIntakeRecords() {
      const storedRecords = localStorage.getItem("dailyIntakeRecords");
      this.dailyIntakeRecords = storedRecords ? JSON.parse(storedRecords) : []; // Very similar to code above - could be converted to helper function
    },
    addCustomMeal(newCustomMeal) {
      // This could be renamed
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
    addDailyRecord(dailyRecord) {
      const existingRecordIndex = this.dailyIntakeRecords.findIndex(
        (record) => record.date === dailyRecord.date
      ); // Similar code is in the function above - this could be done with a helper function

      if (existingRecordIndex !== -1) {
        this.dailyIntakeRecords[existingRecordIndex] = dailyRecord;
      } else {
        this.dailyIntakeRecords.push(dailyRecord); // Pushes if new, overwrites if already existing
      }

      localStorage.setItem(
        "dailyIntakeRecords",
        JSON.stringify(this.dailyIntakeRecords) // A helper function might fit well here
      );
    },
  },
});
