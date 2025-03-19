<script setup lang="ts">
import { usePrinterStore } from '@/stores/printer'
import { ElButton, ElInputNumber, ElCard, ElMessage, ElSkeleton, ElSkeletonItem, ElSelect, ElOption } from 'element-plus'
import { ref, watch } from 'vue'
import { printerApi } from '@/api/printer'
import type { WebcamInfo } from '@/api/printer/types'
import { onMounted } from 'vue'
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  HomeFilled,
  Plus,
  Minus,
  VideoCamera
} from '@element-plus/icons-vue'

const printerStore = usePrinterStore()
const moveDistance = ref(10) // 默认移动距离为10mm
const webcamEnabled = ref(false)
const webcamUrl = ref('')
const isLoading = ref(false)
const imageLoadError = ref(false)
const webcams = ref<WebcamInfo[]>([])
const selectedWebcam = ref<WebcamInfo | null>(null)

const handleImageError = () => {
  imageLoadError.value = true
  ElMessage.error('相机图像加载失败')
  webcamEnabled.value = false
}

// 获取相机列表
const loadWebcams = async () => {
  try {
    const response = await printerApi.getWebcams()
    webcams.value = response.webcams.filter(cam => cam.enabled)
    if (webcams.value.length > 0) {
      selectedWebcam.value = webcams.value[0]
    }
  } catch (error) {
    ElMessage.error('获取相机列表失败')
  }
}

// 处理相机切换
const handleWebcamChange = async (webcam: WebcamInfo | null) => {
  if (webcamEnabled.value && webcam) {
    isLoading.value = true
    imageLoadError.value = false
    try {
      const streamUrl = printerApi.getWebcamStreamUrl(webcam)
      const isAvailable = await printerApi.checkWebcamAvailability(streamUrl)

      if (isAvailable) {
        webcamUrl.value = streamUrl
      } else {
        ElMessage.warning(`相机${webcam.name}无法连接`)
        webcamEnabled.value = false
      }
    } catch (error) {
      ElMessage.error('切换相机失败')
      webcamEnabled.value = false
    } finally {
      isLoading.value = false
    }
  }
}

// 监听相机选择变化
watch(() => selectedWebcam.value, handleWebcamChange)

// 组件挂载时获取相机列表
onMounted(loadWebcams)

// 相机控制函数
const toggleWebcam = async () => {
  try {
    if (!webcamEnabled.value) {
      isLoading.value = true
      imageLoadError.value = false
      // 如果没有已选择的相机，重新加载相机列表
      if (!selectedWebcam.value) {
        await loadWebcams()
      }

      if (selectedWebcam.value) {
        const streamUrl = printerApi.getWebcamStreamUrl(selectedWebcam.value)
        // 检查相机流是否可用
        const isAvailable = await printerApi.checkWebcamAvailability(streamUrl)

        if (isAvailable) {
          webcamEnabled.value = true
          webcamUrl.value = streamUrl
        } else {
          ElMessage.warning(`相机${selectedWebcam.value.name}无法连接`)
        }
      } else {
        ElMessage.warning('未找到可用的相机')
      }
    } else {
      // 关闭相机
      webcamEnabled.value = false
      webcamUrl.value = ''
      imageLoadError.value = false
    }
  } catch (error) {
    ElMessage.error('相机控制出错：' + (error instanceof Error ? error.message : '未知错误'))
    webcamEnabled.value = false
    webcamUrl.value = ''
    imageLoadError.value = true
  } finally {
    isLoading.value = false
  }
}
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
            <ElButton type="primary" class="control-btn" @click="moveAxis('Y', 1)" :icon="ArrowUp" />
          </div>
          <!-- X- -->
          <div class="col-start-1 row-start-2">
            <ElButton type="primary" class="control-btn" @click="moveAxis('X', -1)" :icon="ArrowLeft" />
          </div>
          <!-- Home -->
          <div class="col-start-2 row-start-2">
            <ElButton type="warning" class="control-btn home-btn" @click="homeAxis()" :icon="HomeFilled" />
          </div>
          <!-- X+ -->
          <div class="col-start-3 row-start-2">
            <ElButton type="primary" class="control-btn" @click="moveAxis('X', 1)" :icon="ArrowRight" />
          </div>
          <!-- Y- -->
          <div class="col-start-2 row-start-3">
            <ElButton type="primary" class="control-btn" @click="moveAxis('Y', -1)" :icon="ArrowDown" />
          </div>
        </div>
        <div class="text-center mt-2">XY轴控制</div>
      </div>

      <!-- 相机控制区域 -->
      <ElCard class="mt-4 webcam-card" shadow="never">
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <h2 class="text-xl font-bold">相机监控</h2>
              <ElSelect v-model="selectedWebcam" placeholder="选择相机" :disabled="webcamEnabled" size="default"
                class="w-48">
                <ElOption v-for="cam in webcams" :key="cam.uid" :label="cam.name" :value="cam" />
              </ElSelect>
            </div>
            <div class="flex items-center gap-2">
              <ElButton v-if="webcamEnabled" type="warning" size="small" @click="loadWebcams" :loading="isLoading">
                刷新
              </ElButton>
              <ElButton type="primary" :icon="VideoCamera" @click="toggleWebcam" :class="{ 'is-active': webcamEnabled }"
                :disabled="!selectedWebcam && !webcamEnabled">
                {{ webcamEnabled ? '关闭相机' : '打开相机' }}
              </ElButton>
            </div>
          </div>
        </template>

        <!-- 相机图像显示区域 -->
        <div class="webcam-container rounded-lg overflow-hidden">
          <template v-if="webcamEnabled">
            <ElSkeleton :loading="isLoading" animated>
              <template #template>
                <div class="webcam-skeleton bg-gray-100">
                  <ElSkeletonItem variant="image" style="width: 100%; height: 400px;" />
                </div>
              </template>
              <template #default>
                <img :src="webcamUrl" alt="打印机相机画面" class="webcam-stream w-full h-full object-contain bg-black"
                  :class="{ 'is-loading': isLoading }" @error="handleImageError" v-show="!imageLoadError" />
              </template>
            </ElSkeleton>
            <div v-if="imageLoadError"
              class="webcam-error flex flex-col items-center justify-center bg-gray-50 h-[400px]">
              <ElEmpty description="相机画面加载失败" />
              <ElButton type="primary" size="small" class="mt-4" @click="toggleWebcam">
                重试
              </ElButton>
            </div>
          </template>
          <div v-else class="webcam-placeholder flex items-center justify-center bg-gray-50 h-[400px]">
            <ElEmpty description="相机未开启" />
          </div>
        </div>
      </ElCard>

      <!-- 中间：控制设置 -->
      <div class="control-settings">
        <ElCard shadow="never" class="settings-card">
          <h3 class="text-lg font-medium mb-4">移动设置</h3>

          <!-- 移动距离选择 -->
          <div class="setting-group">
            <div class="setting-label">移动距离 (mm)</div>
            <div class="distance-buttons">
              <ElButton v-for="distance in commonDistances" :key="distance"
                :type="moveDistance === distance ? 'primary' : 'default'" size="small" @click="moveDistance = distance">
                {{ distance }}
              </ElButton>
            </div>
            <ElInputNumber v-model="moveDistance" :min="0.1" :max="100" :step="0.1" size="small" class="mt-2" />
          </div>

          <!-- 移动速度选择 -->
          <div class="setting-group mt-4">
            <div class="setting-label">移动速度</div>
            <div class="speed-buttons">
              <ElButton v-for="speed in moveSpeeds" :key="speed.value"
                :type="selectedSpeed === speed.value ? 'primary' : 'default'" size="small"
                @click="selectedSpeed = speed.value">
                {{ speed.label }}
              </ElButton>
            </div>
          </div>
        </ElCard>
      </div>

      <!-- 右侧：Z轴控制 -->
      <div class="z-control">
        <div class="flex flex-col items-center gap-2">
          <ElButton type="primary" class="control-btn" @click="moveAxis('Z', 1)" :icon="Plus" />
          <div class="text-center my-2">Z轴控制</div>
          <ElButton type="primary" class="control-btn" @click="moveAxis('Z', -1)" :icon="Minus" />
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

/* 相机控制样式 */
.webcam-container {
  width: 100%;
  height: 400px;
  overflow: hidden;
  border-radius: 0.5rem;
  background-color: #000;
}

.webcam-stream {
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: all 0.3s ease;

  &.is-loading {
    opacity: 0.5;
  }
}

.webcam-card {
  :deep(.el-select) {
    .el-input__wrapper {
      background-color: #f3f4f6;
    }

    &.is-disabled .el-input__wrapper {
      background-color: #e5e7eb;
    }
  }
}

.webcam-placeholder {
  width: 100%;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  border-radius: 0.5rem;
}

.is-active {
  background-color: #10b981;
  border-color: #10b981;
}

.is-active:hover {
  background-color: #059669;
  border-color: #059669;
}
</style>