<template>
  <el-container class="h-screen overflow-hidden">
    <el-aside class="h-full" :width="isCollapse ? '64px' : '200px'">
      <el-menu
        :collapse="isCollapse"
        :router="true"
        :default-active="route.path"
      >
        <div class="p-4 flex">
          <span v-show="!isCollapse" class="text-lg font-bold">3D打印管理</span>
          <el-icon class="cursor-pointer ml-auto" @click="toggleCollapse">
            <component :is="isCollapse ? 'Expand' : 'Fold'" />
          </el-icon>
        </div>
        <el-menu-item index="/dashboard">
          <el-icon><DataLine /></el-icon>
          <template #title>仪表盘</template>
        </el-menu-item>
        <el-menu-item index="/printer-control">
          <el-icon><Operation /></el-icon>
          <template #title>打印机控制</template>
        </el-menu-item>
        <el-menu-item index="/model-preview">
          <el-icon><View /></el-icon>
          <template #title>模型预览</template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-main class="h-full bg-[#f5f7fa] overflow-y-auto">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import {
  DataLine,
  Operation,
  View,
  Expand,
  Fold,
} from '@element-plus/icons-vue';

const route = useRoute();
const isCollapse = ref(false);

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value;
};
</script>

<style>
.el-menu {
  height: 100%;
  border-right: none;
}

.el-container {
  height: 100vh;
  overflow: hidden;
}
</style>
