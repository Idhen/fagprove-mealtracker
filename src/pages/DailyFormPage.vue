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
          hint="Søk en ingrediens eller måltid."
          style="width: 70%"
          class="q-mr-sm"
        />

        <q-btn
          round
          color="primary"
          size="sm"
          icon="arrow_downward"
          @click="addFoodToRecord"
        />
      </q-card-section>
    </q-card>

    <q-card style="min-width: 100%" class="q-mt-auto">
      <q-markup-table :separator="'vertical'" flat bordered
        ><thead>
          <tr>
            <th>Mat</th>
            <th>Mengde (g)</th>
            <th>Fjern</th>
          </tr>
        </thead>
        <tbody v-for="food in todaysRecord.foods" :key="food.name">
          <tr>
            <td style="padding: 7px; text-wrap: wrap">{{ food.name }}</td>
            <td class="items-center">
              <q-input
                v-model="food.amount"
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
                @click="removeFoodFromRecord(food)"
              />
            </td>
          </tr>
        </tbody>
      </q-markup-table>
      <q-card-section>
        <p style="text-align: center">
          Næringsinnhold i forhold til Helsedir. anbefalinger:
        </p>
        <q-card-section class="text-center" style="padding: 16px 10px">
          <q-badge
            class="q-ma-xs"
            :label="`${
              parseInt(todaysRecord.nutrients?.calories) || 0
            }/${parseInt(recommendedNutrients.calories)} kcal`"
          />
          <q-badge
            class="q-ma-xs"
            color="orange"
            :label="`${
              parseInt(todaysRecord.nutrients?.protein) || 0
            }/${parseInt(recommendedNutrients.protein)} g protein`"
          />
          <q-badge
            class="q-ma-xs"
            color="brown"
            :label="`${parseInt(todaysRecord.nutrients?.fiber) || 0}/${parseInt(
              recommendedNutrients.fiber
            )}g fiber`"
          />
          <q-badge
            class="q-ma-xs"
            color="grey"
            :label="`${parseInt(todaysRecord.nutrients?.fett) || 0}/${parseInt(
              recommendedNutrients.fett
            )}g fett`"
          />
          <q-badge
            class="q-ma-xs"
            color="green"
            :label="`${parseInt(todaysRecord.nutrients?.karbo) || 0}/${parseInt(
              recommendedNutrients.karbo
            )}g karbohydrat`"
          />
        </q-card-section>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { useFoodStore } from "../stores/foodStore";

const foodStore = useFoodStore();

const fullDateToday = new Date()
  .toLocaleDateString("en-GB")
  .replace(/\//g, "-");

const recommendedNutrients = {
  calories: 2700,
  protein: (2700 * 0.2) / 4, // Protein provides 4 calories per gram
  fiber: 30,
  fett: (2700 * 0.3) / 9, // Fat provides 9 calories per gram
  karbo: (2700 * 0.55) / 4, // Carbohydrates provide 4 calories per gram
};

const searchTerm = ref("");
const initialOptions = [
  ...foodStore.apiFoodData.foods,
  ...foodStore.userCustomMeals,
];
const filteredOptions = ref([]);

const todaysRecord = computed(() => {
  let record = foodStore.dailyIntakeRecords.find(
    (record) => record.date === fullDateToday
  );
  if (!record) {
    record = {
      date: fullDateToday,
      foods: [],
      nutrients: { calories: 0, protein: 0, fiber: 0, fett: 0, karbo: 0 },
    };
    foodStore.addDailyRecord(record);
  }
  return record;
});

const filterFn = (val, update) => {
  update(() => {
    filteredOptions.value = initialOptions.filter((option) => {
      return option.foodName?.toLowerCase().includes(val.toLowerCase());
    });
  });
};

function calculateTotalNutrients() {
  // Could maybe be done with reduce.
  const newTotalNutrients = {};
  todaysRecord.value.foods.map((food) => {
    const multValues = {};
    for (let key in food.nutrients) {
      if (!newTotalNutrients[key]) {
        newTotalNutrients[key] = 0;
      }
      multValues[key] = food.nutrients[key] * (food.amount / 100);
      newTotalNutrients[key] += multValues[key];
    }
    return { ...food, values: multValues };
  });

  todaysRecord.value.nutrients = newTotalNutrients;
  foodStore.addDailyRecord(todaysRecord.value); // Updates/adds record to state/localStorage, since all changes call this function its done here to reduce redundancy
}

function addFoodToRecord() {
  if (searchTerm.value) {
    const foodNutrients = {
      calories:
        searchTerm.value.calories?.quantity ??
        searchTerm.value.totalNutrients.calories,
      protein:
        searchTerm.value.constituents?.find(
          (val) => val.nutrientId === "Protein"
        ).quantity ?? searchTerm.value.totalNutrients.protein,
      fiber:
        searchTerm.value.constituents?.find((val) => val.nutrientId === "Fiber")
          .quantity ?? searchTerm.value.totalNutrients.fiber,
      fett:
        searchTerm.value.constituents?.find((val) => val.nutrientId === "Fett")
          .quantity ?? searchTerm.value.totalNutrients.fett,
      karbo:
        searchTerm.value.constituents?.find((val) => val.nutrientId === "Karbo")
          .quantity ?? searchTerm.value.totalNutrients.karbo,
    };

    todaysRecord.value.foods.push({
      name: searchTerm.value.foodName,
      nutrients: foodNutrients,
      amount: 100,
    });

    calculateTotalNutrients();

    searchTerm.value = "";
  }
}

function removeFoodFromRecord(food) {
  const indexToRemove = todaysRecord.value.foods.findIndex(
    (item) => item.name === food.name
  );
  todaysRecord.value.foods.splice(indexToRemove, 1);

  calculateTotalNutrients();
}

function onAmountChange() {
  calculateTotalNutrients();
}
</script>
