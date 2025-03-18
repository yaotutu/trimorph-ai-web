<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElCard, ElButton, ElInputNumber, ElMessage } from 'element-plus'
import { printerApi, printerWebSocket } from '@/api/printer'
import type { Temperature, TemperatureLimits } from '@/api/printer/types'
import { TEMPERATURE_PRESETS } from '@/config/temperature-presets'
import {
  isTemperatureInRange,
  getAdjustedPresetTemperature,
  formatTemperature,
  parseConfigTemperature
} from '@/utils/temperature'

interface WebSocketTemperatureData {
  params?: {
    status?: {
      extruder?: {
        temperature: number
        target: number
      }
      heater_bed?: {
        temperature: number
        target: number
      }
    }
  }
}

const currentTemp = ref<Temperature>({
  hotend: 0,
  bed: 0
})

const targetTemp = ref<Temperature>({
  hotend: 0,
  bed: 0
})

const tempLimits = ref<TemperatureLimits>({
  extruder: { min_temp: 0, max_temp: 0 },
  heater_bed: { min_temp: 0, max_temp: 0 }
})

// 获取温度限制
const fetchTempLimits = async () => {
  try {
    const response = await printerApi.getTemperatureLimits()
    const config = response.result.status.configfile.config
    if (config) {
      tempLimits.value = {
        extruder: {
          min_temp: parseConfigTemperature(config.extruder.min_temp),
          max_temp: parseConfigTemperature(config.extruder.max_temp)
        },
        heater_bed: {
          min_temp: parseConfigTemperature(config.heater_bed.min_temp),
          max_temp: parseConfigTemperature(config.heater_bed.max_temp)
        }
      }
      console.log('温度限制加载成功:', tempLimits.value)
    }
  } catch (error) {
    console.error('获取温度限制失败:', error)
    ElMessage.error('获取温度限制失败，请检查打印机连接')
  }
}

// 设置温度
const setTemperature = async (type: 'hotend' | 'bed', temp: number | undefined) => {
  if (typeof temp === 'undefined') return
  
  const limits = type === 'hotend' ? tempLimits.value.extruder : tempLimits.value.heater_bed
  if (!isTemperatureInRange(temp, limits)) {
    ElMessage.error(`温度必须在 ${limits.min_temp}°C 到 ${limits.max_temp}°C 之间`)
    targetTemp.value[type] = currentTemp.value[type]
    return
  }

  try {
    const command = type === 'hotend' 
      ? `M104 S${temp}` // 设置喷头温度
      : `M140 S${temp}` // 设置热床温度
    await printerApi.sendGcode(command)
    ElMessage.success(`${type === 'hotend' ? '喷头' : '热床'}温度设置成功`)
  } catch (error) {
    console.error('设置温度失败:', error)
    ElMessage.error('设置温度失败，请检查打印机状态')
    targetTemp.value[type] = currentTemp.value[type]
  }
}

// 应用预设温度
const applyPreset = async (presetName: keyof typeof TEMPERATURE_PRESETS) => {
  const preset = TEMPERATURE_PRESETS[presetName]
  const adjustedTemps = getAdjustedPresetTemperature(preset, tempLimits.value)

  try {
    await Promise.all([
      setTemperature('hotend', adjustedTemps.hotend),
      setTemperature('bed', adjustedTemps.bed)
    ])
    ElMessage.success(`已应用 ${presetName} 温度预设 (${preset.description})`)
  } catch (error) {
    console.error('应用预设温度失败:', error)
    ElMessage.error('应用温度预设失败')
  }
}

// 关闭加热
const coolDown = async () => {
  try {
    await Promise.all([
      setTemperature('hotend', 0),
      setTemperature('bed', 0)
    ])
    ElMessage.success('已关闭所有加热器')
  } catch (error) {
    console.error('关闭加热失败:', error)
    ElMessage.error('关闭加热失败，请检查打印机状态')
  }
}

// 监听温度变化
const handleTemperatureUpdate = (data: WebSocketTemperatureData) => {
  if (data.params?.status?.extruder) {
    currentTemp.value.hotend = data.params.status.extruder.temperature
    targetTemp.value.hotend = data.params.status.extruder.target
  }
  if (data.params?.status?.heater_bed) {
    currentTemp.value.bed = data.params.status.heater_bed.temperature
    targetTemp.value.bed = data.params.status.heater_bed.target
  }
}

onMounted(async () => {
  await fetchTempLimits()
  printerWebSocket.connect({
    onMessage: handleTemperatureUpdate
  })
})

onUnmounted(() => {
  printerWebSocket.disconnect()
})
</script>

<template>
  <ElCard class="temperature-control" shadow="never">
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold">温度控制</h2>
        <ElButton type="danger" @click="coolDown">关闭加热</ElButton>
      </div>
    </template>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- 喷头温度控制 -->
      <div class="temperature-section">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium">喷头温度</h3>
          <div class="text-sm text-gray-500">
            限制: {{ tempLimits.extruder.min_temp }}°C - {{ tempLimits.extruder.max_temp }}°C
          </div>
        </div>
        <div class="temp-display mb-4">
          <div class="current-temp">
            当前: {{ formatTemperature(currentTemp.hotend) }}°C
          </div>
          <div class="target-temp">
            目标: {{ targetTemp.hotend }}°C
          </div>
        </div>
        <div class="temp-input mb-4">
          <ElInputNumber
            v-model="targetTemp.hotend"
            :min="tempLimits.extruder.min_temp"
            :max="tempLimits.extruder.max_temp"
            :step="1"
            size="large"
            @change="(val) => setTemperature('hotend', val)"
          >
            <template #append>°C</template>
          </ElInputNumber>
        </div>
      </div>

      <!-- 热床温度控制 -->
      <div class="temperature-section">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium">热床温度</h3>
          <div class="text-sm text-gray-500">
            限制: {{ tempLimits.heater_bed.min_temp }}°C - {{ tempLimits.heater_bed.max_temp }}°C
          </div>
        </div>
        <div class="temp-display mb-4">
          <div class="current-temp">
            当前: {{ formatTemperature(currentTemp.bed) }}°C
          </div>
          <div class="target-temp">
            目标: {{ targetTemp.bed }}°C
          </div>
        </div>
        <div class="temp-input mb-4">
          <ElInputNumber
            v-model="targetTemp.bed"
            :min="tempLimits.heater_bed.min_temp"
            :max="tempLimits.heater_bed.max_temp"
            :step="1"
            size="large"
            @change="(val) => setTemperature('bed', val)"
          >
            <template #append>°C</template>
          </ElInputNumber>
        </div>
      </div>

      <!-- 温度预设 -->
      <div class="col-span-full">
        <h3 class="text-lg font-medium mb-4">常用预设</h3>
        <div class="flex flex-wrap gap-4">
          <ElButton
            v-for="(preset, name) in TEMPERATURE_PRESETS"
            :key="name"
            type="primary"
            @click="applyPreset(name)"
            :title="preset.description"
          >
            {{ name }}
            ({{ preset.hotend }}/{{ preset.bed }}°C)
          </ElButton>
        </div>
        <div class="mt-2 text-sm text-gray-500">
          注意：如果预设温度超出打印机限制，将会自动调整到允许范围内
        </div>
      </div>
    </div>
  </ElCard>
</template>

<style scoped>
.temperature-control {
  margin-top: 1rem;
  background-color: #f8fafc;
  border: none;
}

.temperature-section {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
}

.temp-display {
  display: flex;
  justify-content: space-between;
  font-size: 1.125rem;
}

.current-temp {
  color: #2563eb;
  font-weight: 500;
}

.target-temp {
  color: #dc2626;
  font-weight: 500;
}

.temp-input :deep(.el-input-number) {
  width: 100%;
}
</style> 