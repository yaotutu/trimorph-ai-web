import { defineStore } from 'pinia'
import type { Router } from 'vue-router'

interface User {
    id: string
    username: string
    token: string
}

interface AuthState {
    user: User | null
    token: string | null
}

export const useAuthStore = defineStore('auth', {
    state: (): AuthState => ({
        user: null,
        token: localStorage.getItem('token')
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,
        getUser: (state) => state.user
    },

    actions: {
        async login(username: string, password: string) {
            try {
                // TODO: 实际项目中需要调用后端API进行验证
                // const response = await api.post('/auth/login', { username, password })
                // const { user, token } = response.data

                // 模拟登录成功
                const token = 'demo-token'
                const user = {
                    id: '1',
                    username,
                    token
                }

                // 保存登录状态
                this.setUser(user)
                this.setToken(token)

                return true
            } catch (error) {
                console.error('登录失败:', error)
                return false
            }
        },

        logout(router: Router) {
            // 清除用户状态
            this.user = null
            this.token = null
            localStorage.removeItem('token')

            // 跳转到登录页
            router.push('/login')
        },

        setUser(user: User) {
            this.user = user
        },

        setToken(token: string) {
            this.token = token
            localStorage.setItem('token', token)
        }
    }
})