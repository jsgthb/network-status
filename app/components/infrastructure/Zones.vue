<template>
    <UCard>
      <template #header>
        <h2 class="text-xl font-semibold">Zones</h2>
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

</script>