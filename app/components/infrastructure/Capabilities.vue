<template>
  <div class="border-b border-gray-800 pb-3 mb-6 ml-1 pt-5">
    <h2 class="text-xl font-semibold">Capabilities</h2>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
    <div
      v-for="capability in store.capabilitiesList"
      :key="capability.id"
      class="border rounded-lg border-gray-800"
    > 
      <!-- Header -->
      <div class="p-4 border-b border-gray-800">
        <div class="flex items-center justify-between mb-3">
          <h3 class="font-medium text-lg">{{ capability.name }}</h3>
          <div class="text-right">
            <UBadge
              :color="getStatusColor(capability.status)"
              variant="subtle"
              size="lg"
            >
              {{ capability.status }}
            </UBadge>
            <div class="text-xs text-gray-400 mt-1">
              {{ formatDate(capability.lastUpdated) }}
            </div>
          </div>
        </div>

        <div class="flex justify-between text-sm text-gray-400 mb-3">
          <span>{{ store.getZonesByCapability(capability.id).length }} Zone(s)</span>
          <span>{{ store.getServersByCapability(capability.id).length }} Total Server(s)</span>
        </div>

        <!-- Zone status -->
        <div class="space-y-2">
          <div class="text-sm font-medium text-gray-300">Zone Status</div>
          <div class="space-y-1.5">
              <div
                v-for="zone in store.getZonesByCapability(capability.id)"
                :key="zone.id"
                class="flex items-center justify-between p-2 bg-gray-700/35 rounded"
              >
                <div class="flex items-center gap-2">
                  <UBadge
                    :color="getStatusColor(store.getZoneHealth(zone.id))"
                    variant="subtle"
                    size="sm"
                  >
                    {{ store.getZoneHealth(zone.id) }}
                  </UBadge>
                  <span class="text-sm font-medium">{{ zone.name }}</span>
                </div>
                <span class="text-xs text-gray-400">
                    {{ store.getServersByZone(zone.id).length }} Server(s)
                </span>
              </div>
            </div>

            <div v-if="store.getZonesByCapability(capability.id).length === 0" class="text-gray-500 text-sm p-2 bg-gray-800/30 rounded text-center">
              No zones assigned
            </div>
          </div>
        </div>

        <!-- Actions -->
        <!-- TODO Add update functionality-->
        <div class="p-4">
          <UButton
            @click=""
            size="sm"
            color="info"
            variant="outline"
            block
            icon="i-heroicons-pencil-square"
          >
            Update Status
          </UButton>
        </div>
      </div>
    </div>
</template>

<script setup lang="ts">
import { useInfrastructureStore } from '#imports';
import { Status } from '~/types/infrastructureTypes';

const store = useInfrastructureStore()
const statusEnum = Status

const getStatusColor = (status: string) => {
  switch (status) {
    case "Healthy": return "success"
    case "Compromised": return "error"
    default: return "warning"
  }
}

const updateCapabilityStatus = (capabilityId: string, status: Status) => {
  store.updateCapabilityStatus({
    id: capabilityId,
    type: "Capability",
    status,
    timestamp: new Date()
  })
}

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(date)
}
</script>