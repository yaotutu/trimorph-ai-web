import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// 路由配置
const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/login/index.vue'),
        meta: { requiresAuth: false }
    },
    {
        path: '/printer-control',
        name: 'PrinterControl',
        component: () => import('@/views/PrinterControl.vue'),
        meta: {
            requiresAuth: false // 不需要登录的页面
        }
    },
    {
        path: '/model-preview',
        name: 'ModelPreview',
        component: () => import('@/views/ModelPreview.vue'),
        meta: {
            requiresAuth: false // 不需要登录的页面
        }
    },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { requiresAuth: true }
    },
    {
        path: '/',
        name: 'Home',
        component: () => import('@/views/home/index.vue'),
        meta: { requiresAuth: false }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()

    // 检查页面是否需要认证
    if (to.meta.requiresAuth) {
        // 如果需要认证且未登录，重定向到登录页
        if (!authStore.isAuthenticated) {
            next({
                path: '/login',
                query: { redirect: to.fullPath }
            })
        } else {
            next()
        }
    } else {
        // 不需要认证的页面直接通过
        next()
    }
})

export default router