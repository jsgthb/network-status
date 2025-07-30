<template>
  <div>
    <Infrastructure />
  </div>
</template>

<script setup>
const { connect, close, sendMessage } = useWebSocketConnection()

onMounted(() => {
  connect()

  // Test websocket
  setTimeout(() => {
    sendMessage({ type: "ping", data: "test ping" })
  }, 2000)
})

onUnmounted(() => {
  close()
})
</script>