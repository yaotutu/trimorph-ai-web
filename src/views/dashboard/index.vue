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
    <div class="dashboard-container">
        <nav class="nav-bar">
            <div class="nav-content">
                <div class="nav-wrapper">
                    <div class="nav-left">
                        <h1 class="nav-title">仪表盘</h1>
                    </div>
                    <div class="nav-right">
                        <el-button
                            type="danger"
                            @click="handleLogout"
                        >
                            退出登录
                        </el-button>
                    </div>
                </div>
            </div>
        </nav>

        <main class="main-content">
            <div class="content-wrapper">
                <div class="content-box">
                    <div class="content-header">
                        <h2 class="content-title">文件列表</h2>
                        <el-button
                            type="primary"
                            :loading="loading"
                            @click="fetchFileList"
                        >
                            刷新列表
                        </el-button>
                    </div>
                    
                    <el-table
                        v-loading="loading"
                        :data="fileList"
                        style="width: 100%"
                    >
                        <el-table-column
                            prop="filename"
                            label="文件名"
                            min-width="200"
                        />
                        <el-table-column
                            prop="size"
                            label="大小"
                            width="120"
                        >
                            <template #default="{ row }">
                                {{ (row.size / 1024).toFixed(2) }} KB
                            </template>
                        </el-table-column>
                        <el-table-column
                            prop="modified"
                            label="修改时间"
                            width="180"
                        />
                        <el-table-column
                            label="操作"
                            width="150"
                            fixed="right"
                        >
                            <template #default="{ row }">
                                <el-button
                                    type="primary"
                                    link
                                    @click="() => console.log('预览文件:', row.filename)"
                                >
                                    预览
                                </el-button>
                                <el-button
                                    type="danger"
                                    link
                                    @click="() => console.log('删除文件:', row.filename)"
                                >
                                    删除
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </div>
        </main>
    </div>
</template>

<style scoped>
.dashboard-container {
    min-height: 100vh;
    background-color: #f3f4f6;
}

.nav-bar {
    background-color: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.nav-content {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 1rem;
}

.nav-wrapper {
    display: flex;
    justify-content: space-between;
    height: 4rem;
}

.nav-left, .nav-right {
    display: flex;
    align-items: center;
}

.nav-title {
    font-size: 1.25rem;
    font-weight: bold;
    color: #111827;
}

.main-content {
    padding: 2.5rem 0;
}

.content-wrapper {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 1rem;
}

.content-box {
    background-color: white;
    border-radius: 0.5rem;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.content-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

.content-title {
    font-size: 1.125rem;
    font-weight: 500;
    color: #111827;
    margin: 0;
}
</style> 