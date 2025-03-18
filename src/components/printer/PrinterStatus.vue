<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { usePrinterStore } from '@/stores/printer'
import { printerWebSocket } from '@/api/printer'

const printerStore = usePrinterStore()

onMounted(() => {
  printerStore.fetchPrinterInfo()
  printerStore.initWebSocket()
})

onUnmounted(() => {
  printerWebSocket.disconnect()
})
</script>

<template>
  <div class="bg-white rounded-lg shadow p-4">
    <h2 class="text-xl font-bold mb-4">打印机状态</h2>
    <div class="grid grid-cols-2 gap-4">
      <div v-if="printerStore.printerInfo">
        <p>状态: {{ printerStore.printerStatus }}</p>
        <p>主机名: {{ printerStore.printerInfo.hostname }}</p>
        <p>软件版本: {{ printerStore.printerInfo.software_version }}</p>
      </div>
    </div>
  </div>
</template> 