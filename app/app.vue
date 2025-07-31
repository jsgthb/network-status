<template>
  <div>
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
    <Infrastructure v-else />
  </div>
</template>

<script setup>
const store = useInfrastructureStore()
const { connect, close, initializeStoreIntegration } = useWebSocketConnection()

onMounted(() => {
  connect()
  initializeStoreIntegration()
})

onUnmounted(() => {
  close()
})
</script>