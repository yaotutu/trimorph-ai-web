import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

// 创建axios实例
const request = axios.create({
    baseURL: 'http://192.168.200.89:8080/api/v1.0',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// 请求拦截器
request.interceptors.request.use(
    (config) => {
        const authStore = useAuthStore()
        // 如果有token，添加到请求头
        if (authStore.token) {
            config.headers.Authorization = `Bearer ${authStore.token}`
        }
        return config
    },
    (error) => {
        console.error('请求错误:', error)
        return Promise.reject(error)
    }
)

// 响应拦截器
request.interceptors.response.use(
    (response) => {
        const { code, msg, data } = response.data

        // 如果code不等于1，说明请求出错
        if (code !== 1) {
            ElMessage.error(msg || '请求失败')
            return Promise.reject(new Error(msg || '请求失败'))
        }

        return data
    },
    (error) => {
        if (error.response?.status === 401) {
            // token失效，清除用户信息
            const authStore = useAuthStore()
            authStore.logout()
            ElMessage.error('登录已过期，请重新登录')
        } else {
            ElMessage.error(error.message || '网络错误')
        }
        return Promise.reject(error)
    }
)

export default request