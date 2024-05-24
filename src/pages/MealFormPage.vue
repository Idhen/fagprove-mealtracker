<template>
  <q-page class="flex justify-center items-start q-pa-md">
    <q-card>
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
          icon="add"
          @click="addIngredientToCustomMeal"
        />
      </q-card-section>
      <q-card-section class="text-center">
        <q-badge
          class="q-ma-sm"
          :label="`${selectedItemNutrients.calories || 0} kcal`"
        />
        <q-badge
          class="q-ma-sm"
          color="orange"
          :label="`${selectedItemNutrients.protein || 0}g protein`"
        />
        <q-badge
          class="q-ma-sm"
          color="brown"
          :label="`${selectedItemNutrients.fiber || 0}g fiber`"
        />
        <q-badge
          class="q-ma-sm"
          color="grey"
          :label="`${selectedItemNutrients.fett || 0}g fett`"
        />
        <q-badge
          class="q-ma-sm"
          color="green"
          :label="`${selectedItemNutrients.karbo || 0}g karbohydrater`"
        />
      </q-card-section>
    </q-card>

    <q-card>
      <q-markup-table :separator="'vertical'" flat bordered>
        <tbody v-for="ingredient in customMeal" :key="ingredient.name">
          <tr>
            <td>{{ ingredient.name }}</td>
            <td class="items-center">
              <q-input v-model="ingredient.amount" hint="Mengde i gram" />
            </td>
            <td>
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

      <q-card-section class="text-center">
        <q-badge
          class="q-ma-sm"
          :label="`${totalNutrients.calories || 0} kcal`"
        />
        <q-badge
          class="q-ma-sm"
          color="orange"
          :label="`${totalNutrients.protein || 0}g protein`"
        />
        <q-badge
          class="q-ma-sm"
          color="brown"
          :label="`${totalNutrients.fiber || 0}g fiber`"
        />
        <q-badge
          class="q-ma-sm"
          color="grey"
          :label="`${totalNutrients.fett || 0}g fett`"
        />
        <q-badge
          class="q-ma-sm"
          color="green"
          :label="`${totalNutrients.karbo || 0}g karbohydrater`"
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

const totalNutrients = ref({
  calories: 0,
  protein: 0,
  fiber: 0,
  fett: 0,
  karbo: 0,
});

const customMeal = ref([]);

onMounted(async () => {
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
  },
  { deep: true }
);

function calculateTotalNutrients() {
  //TODO
}

function addIngredientToCustomMeal() {
  if (input.value) {
    customMeal.value.push({
      name: input.value.foodName,
      values: selectedItemNutrients.value,
      amount: 100,
    });
    input.value = "";
    selectedItemNutrients.value = {};

    console.log(customMeal.value);
  }
}

function removeIngredientFromCustomMeal(ingredient) {
  const indexToRemove = customMeal.value.findIndex(
    (item) => item.name === ingredient
  );
  customMeal.value.splice(indexToRemove, 1);
}

defineOptions({
  name: "MealFormPage",
});
</script>
