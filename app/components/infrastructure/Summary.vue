<template>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <!-- Capabilities -->
      <UCard>
        <div class="text-center mb-5">
          <div class="text-2xl font-bold text-gray-300">{{ store.capabilitiesList.length }}</div>
          <div class="text-sm font-bold text-gray-300">Total Capabilities</div>
        </div>
        <div class="flex gap-2 justify-center flex-wrap sm:flex-nowrap">
            <UBadge 
              :color="store.unknownCapabilities.length !== 0 || store.compromisedCapabilities.length !== 0 ? 'neutral' : 'success'"
              variant="subtle" 
              size="lg"
            >
              {{ store.healthyCapabilities.length }} {{ StatusCapability.Green }}
            </UBadge>
            <UBadge 
              :color="store.unknownCapabilities.length === 0 ? 'neutral' : 'warning'"
              variant="subtle" 
              size="lg"
            >
              {{ store.unknownCapabilities.length }} {{ StatusCapability.Yellow }}
            </UBadge>
            <UBadge 
              :color="store.compromisedCapabilities.length === 0 ? 'neutral' : 'error'"
              variant="subtle" 
              size="lg"
            >
              {{ store.compromisedCapabilities.length }} {{ StatusCapability.Red }}
            </UBadge>
          </div>
      </UCard>

      <!-- Zones -->
      <UCard>
        <div class="text-center mb-5">
          <div class="text-2xl font-bold text-gray-300">{{ store.zonesList.length }}</div>
          <div class="text-sm font-bold text-gray-300">Total Zones</div>
        </div>
        <div class="flex gap-2 justify-center flex-wrap sm:flex-nowrap">
          <UBadge 
            :color="store.unknownZones.length !== 0 || store.compromisedZones.length !== 0 ? 'neutral' : 'success'"
            variant="subtle" 
            size="lg"
          >
            {{ store.healthyZones.length }} {{ StatusServer.Green }}
          </UBadge>
          <UBadge 
            :color="store.unknownZones.length === 0 ? 'neutral' : 'warning'"
            variant="subtle" 
            size="lg"
          >
            {{ store.unknownZones.length }} {{ StatusServer.Yellow }}
          </UBadge>
          <UBadge 
            :color="store.compromisedZones.length === 0 ? 'neutral' : 'error'" 
            variant="subtle" 
            size="lg"
          >
            {{ store.compromisedZones.length }} {{ StatusServer.Red }}
          </UBadge>
        </div>
      </UCard>

      <!-- Servers -->
      <UCard>
        <div class="text-center mb-5">
          <div class="text-2xl font-bold text-gray-300">{{ store.serversList.length }}</div>
          <div class="text-sm font-bold text-gray-300">Total Servers</div>
        </div>
        <div class="flex gap-2 justify-center flex-wrap sm:flex-nowrap">
            <UBadge 
              :color="store.unknownServers.length !== 0 || store.compromisedServers.length !== 0 ? 'neutral' : 'success'"
              variant="subtle" 
              size="lg"
            >
              {{ store.healthyServers.length }} {{ StatusServer.Green }}
            </UBadge>
            <UBadge 
              :color="store.unknownServers.length === 0 ? 'neutral' : 'warning'"
              variant="subtle" 
              size="lg"
            >
              {{ store.unknownServers.length }} {{ StatusServer.Yellow }}
            </UBadge>
            <UBadge 
              :color="store.compromisedServers.length === 0 ? 'neutral' : 'error'" 
              variant="subtle" 
              size="lg"
            >
              {{ store.compromisedServers.length }} {{ StatusServer.Red }}
            </UBadge>
          </div>
      </UCard>
    </div>
</template>

<script setup lang="ts">
import { useInfrastructureStore } from '#imports';
import { StatusServer, StatusCapability} from "~/types/infrastructureTypes"

const store = useInfrastructureStore()
const serverStatusEnum = StatusServer
const capabilityStatusEnum = StatusCapability
</script>