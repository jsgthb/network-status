<template>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <UCard>
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-300">{{ store.capabilitiesList.length }}</div>
          <div class="text-sm font-bold text-gray-300">Total Capabilities</div>
        </div>
      </UCard>

      <UCard>
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-300">{{ store.zonesList.length }}</div>
          <div class="text-sm font-bold text-gray-300">Total Zones</div>
        </div>
      </UCard>

      <UCard>
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-300">{{ store.serversList.length }}</div>
          <div class="text-sm font-bold text-gray-300">Total Servers</div>
        </div>
      </UCard>
    </div>
</template>

<script setup lang="ts">
import { useInfrastructureStore } from '#imports';
const store = useInfrastructureStore()
</script>