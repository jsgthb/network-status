<template>
    <!-- Loading state -->
    <!-- TODO: Implement retry logic -->
    <div v-if="store.isLoading" class="flex items-center justify-center min-h-screen">
      <div class="text-center space-y-4">
        <div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <div class="text-lg font-medium">Loading infrastructure data...</div>
        <div class="text-sm text-gray-600">Connecting to server and syncing state</div>
      </div>
    </div>

    <!-- Main application -->
    <div v-else class="p-6 max-w-7xl mx-auto space-y-6">
        <div class="text-center mb-8">
            <h1 class="text-3xl font-bold mb-2">Network Status Dashboard</h1>
        </div>

        <!-- Quick summary of elements -->
        <InfrastructureSummary/>

        <!-- Capabilities overview -->
        <InfrastructureCapabilities/>

        <!-- Zones overview -->
        <InfrastructureZones/>

        <!-- Servers overview -->
        <InfrastructureServers/>
    </div>
</template>

<script setup lang="ts">
import InfrastructureSummary from "~/components/infrastructure/Summary.vue"
import InfrastructureCapabilities from "~/components/infrastructure/Capabilities.vue"
import InfrastructureZones from "~/components/infrastructure/Zones.vue"
import InfrastructureServers from "~/components/infrastructure/Servers.vue"

const store = useInfrastructureStore()
</script>