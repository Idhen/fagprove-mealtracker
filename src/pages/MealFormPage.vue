<template>
  <q-page class="flex justify-center items-start q-pa-sm">
    <q-card style="min-width: 100%">
      <q-card-section class="row justify-center items-center">
        <q-select
          filled
          v-model="searchTerm"
          use-input
          hide-selected
          fill-input
          input-debounce="0"
          :options="filteredOptions"
          option-label="foodName"
          @filter="filterFn"
          hint="Søk en ingrediens. Verdier vises for 100g."
          style="width: 70%"
          class="q-mr-sm"
          @update:model-value="onIngredientSelect"
        />

        <q-btn
          round
          color="primary"
          size="sm"
          icon="arrow_downward"
          @click="addIngredientToCustomMeal"
        />
      </q-card-section>
      <q-card-section class="text-center" style="padding: 16px 10px">
        <q-badge
          class="q-ma-xs"
          :label="`${selectedItemNutrients.calories || 0} kcal`"
        />
        <q-badge
          class="q-ma-xs"
          color="orange"
          :label="`${selectedItemNutrients.protein || 0}g protein`"
        />
        <q-badge
          class="q-ma-xs"
          color="brown"
          :label="`${selectedItemNutrients.fiber || 0}g fiber`"
        />
        <q-badge
          class="q-ma-xs"
          color="grey"
          :label="`${selectedItemNutrients.fett || 0}g fett`"
        />
        <q-badge
          class="q-ma-xs"
          color="green"
          :label="`${selectedItemNutrients.karbo || 0}g karbohydrat`"
        />
      </q-card-section>
    </q-card>

    <q-card style="min-width: 100%" class="q-mt-auto">
      <q-markup-table :separator="'vertical'" flat bordered>
        <tbody
          v-for="ingredient in customMeal?.ingredients"
          :key="ingredient.name"
        >
          <tr>
            <td style="padding: 7px; text-wrap: wrap">{{ ingredient.name }}</td>
            <td class="items-center">
              <q-input
                v-model="ingredient.amount"
                hint="Mengde i gram"
                type="number"
                v-model.number="model"
                @change="onAmountChange"
              />
            </td>
            <td style="padding: 7px">
              <q-btn
                round
                color="red"
                size="sm"
                icon="delete"
                @click="removeIngredientFromCustomMeal(ingredient.name)"
              />
            </td>
          </tr>
        </tbody>
      </q-markup-table>

      <q-card-section class="text-center" style="padding: 16px 10px">
        <q-badge
          class="q-ma-xs"
          :label="`${parseInt(customMeal?.totalNutrients?.calories) || 0} kcal`"
        />
        <q-badge
          class="q-ma-xs"
          color="orange"
          :label="`${
            parseInt(customMeal?.totalNutrients?.protein) || 0
          }g protein`"
        />
        <q-badge
          class="q-ma-xs"
          color="brown"
          :label="`${parseInt(customMeal?.totalNutrients?.fiber) || 0}g fiber`"
        />
        <q-badge
          class="q-ma-xs"
          color="grey"
          :label="`${parseInt(customMeal?.totalNutrients?.fett) || 0}g fett`"
        />
        <q-badge
          class="q-ma-xs"
          color="green"
          :label="`${
            parseInt(customMeal?.totalNutrients?.karbo) || 0
          }g karbohydrat`"
        />
      </q-card-section>

      <q-card-section class="row justify-center items-center">
        <q-input
          filled
          dense
          v-model="newCustomMealName"
          label="Opprett måltid..."
          style="width: 70%"
          class="q-mr-sm"
        />

        <q-btn
          round
          color="primary"
          size="sm"
          icon="add"
          @click="createNewCustomMeal"
        />
      </q-card-section>
      <q-card-section style="padding-top: 0px">
        <q-select
          filled
          dense
          v-model="customMeal"
          fill-input
          input-debounce="0"
          :options="foodStore.userCustomMeals"
          option-label="foodName"
          @update:model-value="onMealSelect"
          :hint="
            customMeal
              ? 'Valgt måltid: ' + customMeal.foodName
              : 'Velg et eksisterende måltid...'
          "
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useFoodStore } from "../stores/foodStore";

const foodStore = useFoodStore();

const filteredOptions = ref([]);

const searchTerm = ref("");

const selectedItemNutrients = ref({});

const newCustomMealName = ref();

const customMeal = ref();

const filterFn = (val, update) => {
  update(() => {
    filteredOptions.value = foodStore.apiFoodData.foods.filter((option) => {
      return option.foodName.toLowerCase().includes(val.toLowerCase());
    });
  });
};

function onIngredientSelect() {
  if (searchTerm.value) {
    selectedItemNutrients.value = {
      calories: searchTerm.value.calories.quantity,
      protein: searchTerm.value.constituents.find(
        (val) => val.nutrientId === "Protein"
      ).quantity,
      fiber: searchTerm.value.constituents.find(
        (val) => val.nutrientId === "Fiber"
      ).quantity,
      fett: searchTerm.value.constituents.find(
        (val) => val.nutrientId === "Fett"
      ).quantity,
      karbo: searchTerm.value.constituents.find(
        (val) => val.nutrientId === "Karbo"
      ).quantity,
    };
  }
}

function calculateTotalNutrients() {
  const newTotalNutrients = {};
  const multNutrients = customMeal.value.ingredients.map((ingredient) => {
    const multValues = {};
    for (let key in ingredient.values) {
      if (!newTotalNutrients[key]) {
        newTotalNutrients[key] = 0;
      }
      multValues[key] = ingredient.values[key] * (ingredient.amount / 100);
      newTotalNutrients[key] += multValues[key];
    }
    return { ...ingredient, values: multValues };
  });
  customMeal.value.totalNutrients = newTotalNutrients;
  foodStore.addCustomMeal(customMeal.value);
}

function addIngredientToCustomMeal() {
  if (searchTerm.value && customMeal.value) {
    customMeal.value.ingredients.push({
      name: searchTerm.value.foodName,
      values: selectedItemNutrients.value,
      amount: 100,
    });
    searchTerm.value = "";
    selectedItemNutrients.value = {};

    calculateTotalNutrients();
  }
}

function removeIngredientFromCustomMeal(ingredient) {
  const indexToRemove = customMeal.value.ingredients.findIndex(
    (item) => item.name === ingredient
  );
  customMeal.value.ingredients.splice(indexToRemove, 1);
  calculateTotalNutrients();
}

function onAmountChange() {
  calculateTotalNutrients();
}

function onMealSelect() {
  calculateTotalNutrients();
}

function createNewCustomMeal() {
  if (newCustomMealName.value) {
    foodStore.addCustomMeal({
      foodName: newCustomMealName.value,
      ingredients: [],
      totalNutrients: [],
    });
    newCustomMealName.value = "";
  }
}

defineOptions({
  name: "MealFormPage",
});
</script>
