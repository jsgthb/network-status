<template>
  <div>
    <NuxtPage></NuxtPage>
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