import { defineStore } from 'pinia';

export const useFoodStore = defineStore({
    id: 'foodStore',
    state: () => ({
        foodData: [],
        userCustomMeals: [],
    }),
    actions: {
        async fetchData() {
            const corsProxyUrl = 'https://cors-anywhere.herokuapp.com/';
            await fetch(corsProxyUrl + 'https://www.matvaretabellen.no/api/nb/foods.json')
                .then(response => response.json())
                .then(data => this.foodData = data)
        },
        addCustomMeal(meal) {
            this.userCustomMeals.push(meal);
        }
    },
});