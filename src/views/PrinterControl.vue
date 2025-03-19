<script setup lang="ts">
import PrinterStatus from '@/components/printer/PrinterStatus.vue'
import PrinterControl from '@/components/printer/PrinterControl.vue'
import TemperatureControl from '@/components/printer/TemperatureControl.vue'
</script>

<template>
    <div class="container mx-auto p-4">
        <PrinterStatus />
        <TemperatureControl />
        <PrinterControl />
    </div>
</template>

<style scoped></style>