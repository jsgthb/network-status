<template>
  <div class="border-b border-gray-800 pb-3 mb-6 ml-1 pt-5">
    <h2 class="text-xl font-semibold">Servers</h2>
  </div>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    <div
      v-for="server in store.serversList"
      :key="server.id"
      class="border rounded-lg p-4 border-gray-800"
    >
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-medium"> {{ server.name }}</h3>
        <UBadge
          :color="getStatusColor(server.status)"
          variant="subtle"
          size="lg"
        >
          {{ server.status }}
        </UBadge>
      </div>

      <div class="text-sm text-gray-600 mb-3 space-y-1">
        <div>Zone: {{ store.getZoneById(server.zoneId)?.name }}</div>
        <div>Updated: {{ formatDate(server.lastUpdated) }}</div>
      </div>

      <!-- Update server status -->
      <div class="text-sm font-medium mb-3">Actions</div>
      <div class="flex justify-between gap-1">
        <UButton
          @click="updateServerStatus(server.id, statusEnum.Green)"
          size="xs"
          color="info"
          variant="outline"
        >
          Set Healthy
        </UButton>
        <UButton
          @click="updateServerStatus(server.id, statusEnum.Red)"
          size="xs"
          color="info"
          variant="outline"
        >
          Set Compromised
        </UButton>
        <UButton
          @click="updateServerStatus(server.id, statusEnum.Yellow)"
          size="xs"
          color="info"
          variant="outline"
        >
          Set Unknown
        </UButton>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { useInfrastructureStore } from '#imports';
import { StatusServer } from '~/types/infrastructureTypes';

const store = useInfrastructureStore()
const statusEnum = StatusServer

const getStatusColor = (status: string) => {
  switch (status) {
    case StatusServer.Green: return "success"
    case StatusServer.Yellow: return "warning"
    case StatusServer.Red: return "error"
    default: return "warning"
  }
}

const updateServerStatus = (serverId: string, status: StatusServer) => {
  store.updateServerStatus({
    id: serverId,
    type: "Server",
    status,
    timestamp: new Date()
  })
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date)
}
</script>