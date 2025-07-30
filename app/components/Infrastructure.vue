<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold mb-2">Network Status Dashboard</h1>
    </div>

    <!-- Summaries -->
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

    <!-- Capabilities -->
    <UCard>
      <template #header>
        <h2 class="text-xl font-semibold">Capabilities</h2>
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
              @click="updateCapabilityStatus(capability.id, 'Healthy')"
              size="xs"
              color="info"
              variant="outline"
            >
              Set Healthy
            </UButton>
            <UButton
              @click="updateCapabilityStatus(capability.id, 'Compromised')"
              size="xs"
              color="info"
              variant="outline"
            >
              Set Compromised
            </UButton>
            <UButton
              @click="updateCapabilityStatus(capability.id, 'Unknown')"
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

    <!-- Zones -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">Zones</h2>
          <div class="text-sm text-gray-600">
            Showing computed health based on server status
          </div>
        </div>
      </template>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          v-for="zone in store.zonesList"
          :key="zone.id"
          class="border rounded-lg p-4 border-gray-800"
        >
          <div class="flex items-center justify-between mb-3">
            <h3 class="font-medium">{{ zone.name }}</h3>
            <UBadge
              :color="getStatusColor(store.getZoneHealth(zone.id))"
              variant="subtle"
              size="lg"
            >
              {{ store.getZoneHealth(zone.id) }}
            </UBadge>
          </div>

          <div class="text-sm text-gray-600 mb-3">
            Capability: {{ store.getCapabilityById(zone.capabilityId)?.name }}
          </div>

          <!-- Server in zone -->
          <div class="space-y-2">
            <div class="text-sm font-medium">
              {{ store.getServersByZone(zone.id).length }} Server(s)
            </div>
            <div class="flex flex-wrap gap-1">
              <UBadge
                v-for="server in store.getServersByZone(zone.id)"
                :key="server.id"
                :color="getStatusColor(store.getServerById(server.id)?.status!)"
                variant="subtle"
                size="lg"
              >
                {{ server.name }}
              </UBadge>
            </div>
          </div>

        </div>
      </div>
    </UCard>

    <!-- Servers -->
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">Servers</h2>
          <div class="flex gap-2">
            <UBadge 
              color="success" variant="subtle" size="lg"
            >
              Healthy: {{ store.healthyServers.length }}
            </UBadge>
            <UBadge 
              color="error" variant="subtle" size="lg"
            >
              Compromised: {{ store.compromisedServers.length }}
            </UBadge>
          </div>
        </div>
      </template>

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
              @click="updateServerStatus(server.id, 'Healthy')"
              size="xs"
              color="info"
              variant="outline"
            >
              Set Healthy
            </UButton>
            <UButton
              @click="updateServerStatus(server.id, 'Compromised')"
              size="xs"
              color="info"
              variant="outline"
            >
              Set Compromised
            </UButton>
            <UButton
              @click="updateServerStatus(server.id, 'Unknown')"
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
    
  </div>
</template>

<script setup lang="ts">
import { useInfrastructureStore } from '#imports';

const store = useInfrastructureStore()

// Helper functions
const getStatusColor = (status: string) => {
  switch (status) {
    case "Healthy": return "success"
    case "Compromised": return "error"
    default: return "warning"
  }
}

const updateCapabilityStatus = (capabilityId: string, status: "Healthy" | "Compromised" | "Unknown") => {
  store.updateCapabilityStatus({
    id: capabilityId,
    type: "Capability",
    status,
    timestamp: new Date()
  })
}

const updateServerStatus = (serverId: string, status: "Healthy" | "Compromised" | "Unknown") => {
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