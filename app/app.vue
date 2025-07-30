<template>
  <div>
    <Infrastructure />
  </div>
</template>

<script setup>
const { connect, close, initializeStoreIntegration } = useWebSocketConnection()

onMounted(() => {
  connect()
  initializeStoreIntegration()
})

onUnmounted(() => {
  close()
})
</script>