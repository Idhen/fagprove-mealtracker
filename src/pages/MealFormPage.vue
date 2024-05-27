<template>
  <q-page class="flex justify-center items-start q-pa-sm">
    <q-card style="min-width: 100%">
      <q-card-section class="row justify-center items-center">
        <q-select
          filled
          v-model="input"
          use-input
          hide-selected
          fill-input
          input-debounce="0"
          :loading="currentlyFetching"
          :options="filteredOptions"
          option-label="foodName"
          @filter="filterFn"
          hint="Søk en ingrediens. Verdier vises for 100g."
          style="width: 70%"
          class="q-mr-sm"
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
          :label="`${parseInt(totalNutrients.calories) || 0} kcal`"
        />
        <q-badge
          class="q-ma-xs"
          color="orange"
          :label="`${parseInt(totalNutrients.protein) || 0}g protein`"
        />
        <q-badge
          class="q-ma-xs"
          color="brown"
          :label="`${parseInt(totalNutrients.fiber) || 0}g fiber`"
        />
        <q-badge
          class="q-ma-xs"
          color="grey"
          :label="`${parseInt(totalNutrients.fett) || 0}g fett`"
        />
        <q-badge
          class="q-ma-xs"
          color="green"
          :label="`${parseInt(totalNutrients.karbo) || 0}g karbohydrat`"
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
          option-label="name"
          :hint="
            customMeal
              ? 'Valgt måltid: ' + customMeal.name
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

const options = ref([]);
const filteredOptions = ref([]);

const currentlyFetching = ref(false);

const input = ref("");

const selectedItemNutrients = ref({});

const newCustomMealName = ref();

const totalNutrients = ref({
  calories: 0,
  protein: 0,
  fiber: 0,
  fett: 0,
  karbo: 0,
});

const customMeal = ref();

onMounted(async () => {
  foodStore.fetchCustomMeals(); // Move this to mounting of the app itself - or the front page.

  currentlyFetching.value = true;
  await foodStore.fetchData();
  currentlyFetching.value = false;
  options.value = foodStore.foodData.foods;
});

const filterFn = (val, update) => {
  update(() => {
    filteredOptions.value = options.value.filter((option) => {
      return option.foodName.toLowerCase().includes(val.toLowerCase());
    });
  });
};

watch(input, (newInput) => {
  // Redo, rename
  if (input.value) {
    selectedItemNutrients.value = {
      calories: newInput.calories.quantity,
      protein: newInput.constituents.find((val) => val.nutrientId === "Protein")
        .quantity,
      fiber: newInput.constituents.find((val) => val.nutrientId === "Fiber")
        .quantity,
      fett: newInput.constituents.find((val) => val.nutrientId === "Fett")
        .quantity,
      karbo: newInput.constituents.find((val) => val.nutrientId === "Karbo")
        .quantity,
    };
  }
});

watch(
  customMeal,
  (newCustomMeal) => {
    calculateTotalNutrients();
    foodStore.addCustomMeal(customMeal.value);
  },
  { deep: true }
);

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

  totalNutrients.value = newTotalNutrients;
}

function addIngredientToCustomMeal() {
  if (input.value && customMeal.value) {
    customMeal.value.ingredients.push({
      name: input.value.foodName,
      values: selectedItemNutrients.value,
      amount: 100,
    });
    input.value = "";
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

function createNewCustomMeal() {
  if (newCustomMealName.value) {
    foodStore.addCustomMeal({ name: newCustomMealName.value, ingredients: [] });
    newCustomMealName.value = "";
  }
}

defineOptions({
  name: "MealFormPage",
});
</script>
