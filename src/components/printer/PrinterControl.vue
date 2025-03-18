<script setup lang="ts">
import { usePrinterStore } from '@/stores/printer'
import { ElButton, ElInputNumber, ElCard } from 'element-plus'
import { ref } from 'vue'
import { printerApi } from '@/api/printer'
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  HomeFilled,
  Plus,
  Minus
} from '@element-plus/icons-vue'

const printerStore = usePrinterStore()
const moveDistance = ref(10) // 默认移动距离为10mm
const moveSpeeds = [
  { label: '慢速', value: 1000 },
  { label: '正常', value: 3000 },
  { label: '快速', value: 5000 }
]
const selectedSpeed = ref(3000)

// 移动控制函数
const moveAxis = async (axis: 'X' | 'Y' | 'Z', direction: number) => {
  const distance = direction * moveDistance.value
  try {
    await printerApi.movePrinthead(axis, distance, `F${selectedSpeed.value}`)
  } catch (error) {
    console.error('移动失败:', error)
  }
}

// 回原点函数
const homeAxis = async (axis?: 'X' | 'Y' | 'Z') => {
  try {
    await printerApi.homeAxis(axis)
  } catch (error) {
    console.error('回原点失败:', error)
  }
}

const commonDistances = [0.1, 1, 10, 50, 100]
</script>

<template>
  <ElCard class="printer-control" shadow="never">
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold">打印机控制</h2>
      </div>
    </template>

    <div class="control-panel">
      <!-- 左侧：XY轴控制 -->
      <div class="xy-control">
        <div class="control-grid">
          <!-- Y+ -->
          <div class="col-start-2">
            <ElButton
              type="primary"
              class="control-btn"
              @click="moveAxis('Y', 1)"
              :icon="ArrowUp"
            />
          </div>
          <!-- X- -->
          <div class="col-start-1 row-start-2">
            <ElButton
              type="primary"
              class="control-btn"
              @click="moveAxis('X', -1)"
              :icon="ArrowLeft"
            />
          </div>
          <!-- Home -->
          <div class="col-start-2 row-start-2">
            <ElButton
              type="warning"
              class="control-btn home-btn"
              @click="homeAxis()"
              :icon="HomeFilled"
            />
          </div>
          <!-- X+ -->
          <div class="col-start-3 row-start-2">
            <ElButton
              type="primary"
              class="control-btn"
              @click="moveAxis('X', 1)"
              :icon="ArrowRight"
            />
          </div>
          <!-- Y- -->
          <div class="col-start-2 row-start-3">
            <ElButton
              type="primary"
              class="control-btn"
              @click="moveAxis('Y', -1)"
              :icon="ArrowDown"
            />
          </div>
        </div>
        <div class="text-center mt-2">XY轴控制</div>
      </div>

      <!-- 中间：控制设置 -->
      <div class="control-settings">
        <ElCard shadow="never" class="settings-card">
          <h3 class="text-lg font-medium mb-4">移动设置</h3>
          
          <!-- 移动距离选择 -->
          <div class="setting-group">
            <div class="setting-label">移动距离 (mm)</div>
            <div class="distance-buttons">
              <ElButton
                v-for="distance in commonDistances"
                :key="distance"
                :type="moveDistance === distance ? 'primary' : 'default'"
                size="small"
                @click="moveDistance = distance"
              >
                {{ distance }}
              </ElButton>
            </div>
            <ElInputNumber
              v-model="moveDistance"
              :min="0.1"
              :max="100"
              :step="0.1"
              size="small"
              class="mt-2"
            />
          </div>

          <!-- 移动速度选择 -->
          <div class="setting-group mt-4">
            <div class="setting-label">移动速度</div>
            <div class="speed-buttons">
              <ElButton
                v-for="speed in moveSpeeds"
                :key="speed.value"
                :type="selectedSpeed === speed.value ? 'primary' : 'default'"
                size="small"
                @click="selectedSpeed = speed.value"
              >
                {{ speed.label }}
              </ElButton>
            </div>
          </div>
        </ElCard>
      </div>

      <!-- 右侧：Z轴控制 -->
      <div class="z-control">
        <div class="flex flex-col items-center gap-2">
          <ElButton
            type="primary"
            class="control-btn"
            @click="moveAxis('Z', 1)"
            :icon="Plus"
          />
          <div class="text-center my-2">Z轴控制</div>
          <ElButton
            type="primary"
            class="control-btn"
            @click="moveAxis('Z', -1)"
            :icon="Minus"
          />
        </div>
      </div>
    </div>
  </ElCard>
</template>

<style scoped>
.printer-control {
  background-color: #f8fafc;
  border: none;
}

.control-panel {
  display: grid;
  grid-template-columns: 1fr 1.5fr 1fr;
  gap: 2rem;
  align-items: start;
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 0.5rem;
  place-items: center;
}

.control-btn {
  width: 3rem;
  height: 3rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-btn {
  background-color: #f59e0b;
  border-color: #f59e0b;
}

.home-btn:hover {
  background-color: #d97706;
  border-color: #d97706;
}

.settings-card {
  background-color: white;
  border: 1px solid #e5e7eb;
}

.setting-group {
  margin-bottom: 1rem;
}

.setting-label {
  font-size: 0.875rem;
  color: #4b5563;
  margin-bottom: 0.5rem;
}

.distance-buttons,
.speed-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.xy-control,
.z-control {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background-color: white;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
}

:deep(.el-input-number) {
  width: 100%;
}
</style> 