<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import type { LoginRequest } from '@/types/api'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loginForm = ref<LoginRequest>({
    username: '',
    password: ''
})

const loading = ref(false)

const handleLogin = async () => {
    if (!loginForm.value.username || !loginForm.value.password) {
        ElMessage.warning('请输入用户名和密码')
        return
    }

    loading.value = true
    try {
        const success = await authStore.login(loginForm.value)
        if (success) {
            ElMessage.success('登录成功')
            // 获取重定向地址，如果没有则跳转到首页
            const redirect = route.query.redirect as string || '/'
            router.push(redirect)
        } else {
            ElMessage.error('登录失败，请检查用户名和密码')
        }
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div class="max-w-md w-full bg-white p-8 rounded-lg shadow-sm">
            <div class="mb-8">
                <h2 class="text-3xl font-bold text-center text-gray-900">登录系统</h2>
            </div>
            <form class="mt-8" @submit.prevent="handleLogin">
                <div class="mb-6">
                    <div class="mb-4">
                        <label for="username" class="sr-only">用户名</label>
                        <input id="username" v-model="loginForm.username" name="username" type="text" required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10"
                            placeholder="用户名">
                    </div>
                    <div class="mb-4">
                        <label for="password" class="sr-only">密码</label>
                        <input id="password" v-model="loginForm.password" name="password" type="password" required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10"
                            placeholder="密码">
                    </div>
                </div>

                <div>
                    <el-button :loading="loading" type="primary" class="w-full" @click="handleLogin">
                        登录
                    </el-button>
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>
.login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f3f4f6;
    padding: 1rem;
}

.login-box {
    max-width: 400px;
    width: 100%;
    background: white;
    padding: 2rem;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.login-header {
    margin-bottom: 2rem;
}

.login-title {
    font-size: 1.875rem;
    font-weight: bold;
    text-align: center;
    color: #111827;
}

.login-form {
    margin-top: 2rem;
}

.form-group {
    margin-bottom: 1.5rem;
}

.input-group {
    margin-bottom: 1rem;
}

.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
}

.form-input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    font-size: 0.875rem;
}

.form-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.submit-btn {
    width: 100%;
}
</style>