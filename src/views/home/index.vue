<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const goToDashboard = () => {
    router.push('/dashboard')
}
</script>

<template>
    <div class="home-container">
        <div class="content">
            <div class="text-content">
                <h1 class="title">欢迎来到首页</h1>
                <p class="description">这是一个不需要登录就能访问的页面</p>
                <div class="button-group">
                    <el-button
                        v-if="!authStore.isAuthenticated"
                        type="primary"
                        @click="router.push('/login')"
                    >
                        去登录
                    </el-button>
                    <el-button
                        type="success"
                        @click="goToDashboard"
                    >
                        访问仪表盘
                    </el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.home-container {
    min-height: 100vh;
    background-color: #f3f4f6;
    padding: 3rem 1rem;
}

.content {
    max-width: 1280px;
    margin: 0 auto;
}

.text-content {
    text-align: center;
}

.title {
    font-size: 2.25rem;
    font-weight: bold;
    color: #111827;
    margin-bottom: 2rem;
}

.description {
    font-size: 1.25rem;
    color: #4b5563;
    margin-bottom: 2rem;
}

.button-group {
    display: flex;
    gap: 1rem;
    justify-content: center;
}
</style> 