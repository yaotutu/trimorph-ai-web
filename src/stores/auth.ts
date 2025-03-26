import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authApi } from '@/api/auth'
import { request } from '@/utils/request'
import type { LoginRequest } from '@/types/api'

export const useAuthStore = defineStore('auth', () => {
    // 从 localStorage 初始化状态
    const token = ref(localStorage.getItem('token') || '')
    const isAuthenticated = ref(!!localStorage.getItem('token'))

    // 初始化 request 实例的 token
    if (token.value) {
        request.setToken(token.value)
    }

    // 登录
    const login = async (loginData: LoginRequest) => {
        try {
            const response = await authApi.login(loginData)
            if (response.code === 1) {
                token.value = response.data.token
                isAuthenticated.value = true
                // 保存到 localStorage
                localStorage.setItem('token', response.data.token)
                request.setToken(response.data.token)
                return true
            }
            return false
        } catch (error) {
            console.error('登录失败:', error)
            return false
        }
    }

    // 登出
    const logout = () => {
        token.value = ''
        isAuthenticated.value = false
        request.clearToken()
        // 清除 localStorage
        localStorage.removeItem('token')
    }

    return {
        token,
        isAuthenticated,
        login,
        logout
    }
})