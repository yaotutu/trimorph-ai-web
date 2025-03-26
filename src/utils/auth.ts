import { ElMessage } from 'element-plus'
import type { RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 路由守卫相关工具函数
export const routeGuard = (to: RouteLocationNormalized) => {
    const authStore = useAuthStore()
    const requiresAuth = to.meta.requiresAuth as boolean

    if (requiresAuth && !authStore.isAuthenticated) {
        ElMessage.warning('请先登录')
        return '/login'
    }

    if (to.path === '/login' && authStore.isAuthenticated) {
        return '/dashboard'
    }

    return true
}