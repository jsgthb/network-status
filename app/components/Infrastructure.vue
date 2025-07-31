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

          <div class="text-sm mb-3">
            <div class="mb-2">
              <span class="font-medium">Assigned Capabilites</span>
            </div>
            <div class="flex flex-wrap gap-1">
              <UBadge
                v-for="capability in store.getCapabilitiesByZone(zone.id)"
                :key="capability.id"
                :color="getStatusColor(capability.status)"
                variant="subtle"
                size="sm"
              >
                {{ capability.name }}
              </UBadge>
            </div>
            <div v-if="store.getCapabilitiesByZone(zone.id).length === 0" class="text-gray-500 text-sm">
              No capabilities assigned
            </div>
          </div>

          <!-- Server in zone -->
          <div class="space-y-2">
            <div class="text-sm font-medium">
              {{ store.getServersByZone(zone.id).length }} Server(s)
            </div>
            <div class="flex flex-wrap gap-1.5">
              <div
                v-for="server in store.getServersByZone(zone.id)"
                :key="server.id"
                :class="getServerIconColor(store.getServerById(server.id)?.status!)"
                :title="`${server.name} (${server.description.os}) - ${store.getServerById(server.id)?.status}`"
                class="w-8 h-8 rounded flex items-center justify-center cursor-pointer transition-all hover:scale-110"
              >
                <UIcon 
                  :name="`i-simple-icons-${getOSIcon(server.description.os)}`" 
                  class="w-4 h-4 text-gray"
                />
              </div>
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
              color="success" 
              variant="subtle" 
              size="lg"
            >
              Healthy: {{ store.healthyServers.length }}
            </UBadge>
            <UBadge 
              color="warning" 
              variant="subtle" 
              size="lg"
            >
              Unknown: {{ store.unknownServers.length }}
            </UBadge>
            <UBadge 
              color="error" 
              variant="subtle" 
              size="lg"
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

const getServerIconColor = (status: string) => {
  switch (status) {
    case "Healthy": return "bg-emerald-500/20 border border-emerald-500/30"
    case "Compromised": return "bg-red-500/20 border border-red-500/30"
    default: return "bg-amber-500/20 border border-amber-500/30"
  }
}

const getOSIcon = (osString: string) => {
  const os = osString.toLowerCase()
  
  if (os.includes("windows")) return "windows"
  if (os.includes("ubuntu")) return "ubuntu"
  if (os.includes("debian")) return "debian"
  if (os.includes("centos")) return "centos"
  if (os.includes("redhat") || os.includes("rhel")) return 'redhat'
  if (os.includes("fedora")) return "fedora"
  if (os.includes("opensuse") || os.includes("suse")) return "opensuse"
  if (os.includes("arch")) return "archlinux"
  if (os.includes("alpine")) return "alpinelinux"
  if (os.includes("freebsd")) return "freebsd"
  if (os.includes("openbsd")) return "openbsd"
  if (os.includes("macos") || os.includes("darwin")) return 'apple'
  if (os.includes("linux")) return "linux"
  
  // Default fallback
  return "linux"
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