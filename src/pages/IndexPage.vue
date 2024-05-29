<template>
  <q-page class="q-pa-sm">
    <q-carousel
      v-model="slide"
      transition-prev="scale"
      transition-next="scale"
      swipeable
      animated
      control-color="white"
      navigation
      padding
      arrows
      height="300px"
      class="bg-primary shadow-1 rounded-borders"
    >
      <q-carousel-slide
        class="column no-wrap flex-center"
        v-for="record in foodStore.dailyIntakeRecords"
        :key="record.date"
        :name="record.date"
      >
        <q-card style="width: 70%; height: 90%">
          <q-card-section>
            <h5 class="q-my-xs">{{ record.date }}</h5>
            <p
              v-for="(value, key) in record.nutrients"
              class="q-mb-xs"
              :key="key"
            >
              {{ key }}: {{ value }} {{ key === "calories" ? "kcal" : "g" }} ({{
                parseInt(nutritionDifference(record.date)[key])
              }})
            </p>
          </q-card-section>
        </q-card>
      </q-carousel-slide>
    </q-carousel>

    <q-card class="q-mt-md" style="width: 100%">
      <canvas id="acquisitions"></canvas>
      <q-card-section class="row justify-center">
        <q-btn-toggle
          v-model="placeholderModel"
          toggle-color="primary"
          :options="[
            { label: 'Kalorier', value: 'one' },
            { label: 'Protein', value: 'two' },
            { label: 'Karbohydrat', value: 'three' },
          ]"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { useFoodStore } from "src/stores/foodStore";
import { ref, watch, computed, onMounted } from "vue";
import Chart from "chart.js/auto";

const foodStore = useFoodStore();
const slide = ref(
  foodStore.dailyIntakeRecords[foodStore.dailyIntakeRecords.length - 1].date
);

const placeholderModel = ref();

function nutritionDifference(date) {
  const todayIndex = foodStore.dailyIntakeRecords.findIndex(
    (record) => record.date === date
  );
  const dayBeforeValues = foodStore.dailyIntakeRecords[todayIndex - 1];

  const differenceValues = {};
  for (const nutrient in foodStore.dailyIntakeRecords[todayIndex].nutrients) {
    differenceValues[nutrient] =
      foodStore.dailyIntakeRecords[todayIndex].nutrients[nutrient] -
        dayBeforeValues?.nutrients[nutrient] || 0;
  }
  return differenceValues;
}

onMounted(async () => {
  const data = foodStore.dailyIntakeRecords.map((record) => ({
    day: record.date,
    amount: record.nutrients.calories,
  }));

  new Chart(document.getElementById("acquisitions"), {
    type: "line",
    data: {
      labels: data.map((row) => row.day),
      datasets: [
        {
          label: "Kalorimengde",
          data: data.map((row) => row.amount),
        },
      ],
    },
  });
});

defineOptions({
  name: "IndexPage",
});
</script>
