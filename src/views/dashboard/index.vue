<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { fileApi } from '@/api/file'
import type { FileItem } from '@/types/api'

const router = useRouter()
const authStore = useAuthStore()

const fileList = ref<FileItem[]>([])
const loading = ref(false)

const handleLogout = () => {
    authStore.logout()
    router.push('/login')
}

const fetchFileList = async () => {
    loading.value = true
    try {
        const response = await fileApi.getFileList()
        if (response.code === 1) {
            fileList.value = response.data.files
        } else {
            ElMessage.error(response.msg || '获取文件列表失败')
        }
    } catch (error) {
        console.error('获取文件列表失败:', error)
        ElMessage.error('获取文件列表失败')
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    fetchFileList()
})
</script>

<template>
    <div class="min-h-screen bg-gray-100">
        <nav class="bg-white shadow">
            <div class="max-w-7xl mx-auto px-4">
                <div class="flex justify-between h-16">
                    <div class="flex items-center">
                        <h1 class="text-xl font-bold text-gray-900">仪表盘</h1>
                    </div>
                    <el-button type="danger" class="my-auto" @click="handleLogout">
                        退出登录
                    </el-button>
                </div>
            </div>
        </nav>

        <main class="py-10">
            <div class="max-w-7xl mx-auto px-4">
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-lg font-medium text-gray-900">文件列表</h2>
                        <el-button type="primary" :loading="loading" @click="fetchFileList">
                            刷新列表
                        </el-button>
                    </div>

                    <el-table v-loading="loading" :data="fileList" class="w-full">
                        <el-table-column prop="filename" label="文件名" min-width="200" class="text-sm text-gray-900" />
                        <el-table-column prop="size" label="大小" width="120" class="text-sm text-gray-600">
                            <template #default="{ row }">
                                {{ (row.size / 1024).toFixed(2) }} KB
                            </template>
                        </el-table-column>
                        <el-table-column prop="modified" label="修改时间" width="180" class="text-sm text-gray-600" />
                        <el-table-column label="操作" width="150" fixed="right" class="text-sm">
                            <template #default="{ row }">
                                <div class="space-x-2">
                                    <el-button type="primary" link class="text-blue-600 hover:text-blue-800"
                                        @click="() => console.log('预览文件:', row.filename)">
                                        预览
                                    </el-button>
                                    <el-button type="danger" link class="text-red-600 hover:text-red-800"
                                        @click="() => console.log('删除文件:', row.filename)">
                                        删除
                                    </el-button>
                                </div>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
        </main>
    </div>
</template>
