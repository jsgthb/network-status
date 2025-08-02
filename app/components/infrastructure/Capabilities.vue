<template>
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">Capabilities</h2>
          <div class="flex gap-2">
            <UBadge 
              color="success" 
              variant="subtle" 
              size="lg"
            >
              Healthy: {{ store.healthyCapabilities.length }}
            </UBadge>
            <UBadge 
              color="warning" 
              variant="subtle" 
              size="lg"
            >
              Unknown: {{ store.unknownCapabilities.length }}
            </UBadge>
            <UBadge 
              color="error" 
              variant="subtle" 
              size="lg"
            >
              Compromised: {{ store.compromisedCapabilities.length }}
            </UBadge>
          </div>
        </div>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          v-for="capability in store.capabilitiesList"
          :key="capability.id"
          class="border rounded-lg p-4 border-gray-800"
        >
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-medium">{{ capability.name }}</h3>
            <UBadge
              :color="getStatusColor(capability.status)"
              variant="subtle"
              size="lg"
            >
              {{ capability.status }}
            </UBadge>
          </div>

          <!-- Zones in capability -->
          <div class="mb-3">
            <div class="flex justify-between items-center mb-3">
              <div class="text-sm font-medium">{{ store.getZonesByCapability(capability.id).length }} Zone(s)</div>
              <div class="text-sm font-medium text-gray-600">{{ store.getServersByCapability(capability.id).length }} Server(s)</div>
            </div>
            <div class="flex flex-wrap gap-1">
              <UBadge
                v-for="zone in store.getZonesByCapability(capability.id)"
                :key="zone.id"
                :color="getStatusColor(store.getZoneHealth(zone.id))"
                variant="subtle"
                size="lg"
              >
                {{ zone.name }}
              </UBadge>
            </div>
          </div>

          <!-- Update capability -->
          <div class="text-sm font-medium mb-3">Actions</div>
          <div class="flex justify-between gap-1">
            <UButton
              @click="updateCapabilityStatus(capability.id, statusEnum.Green)"
              size="xs"
              color="info"
              variant="outline"
            >
              Set Healthy
            </UButton>
            <UButton
              @click="updateCapabilityStatus(capability.id, statusEnum.Red)"
              size="xs"
              color="info"
              variant="outline"
            >
              Set Compromised
            </UButton>
            <UButton
              @click="updateCapabilityStatus(capability.id, statusEnum.Yellow)"
              size="xs"
              color="info"
              variant="outline"
            >
              Set Unknown
            </UButton>
          </div>
        </div>

      </div>
    </UCard>
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
</script>