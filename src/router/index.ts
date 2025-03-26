import { createRouter, createWebHistory } from 'vue-router'
import { routeGuard } from '@/utils/auth'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
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
            path: '/login',
            name: 'Login',
            component: () => import('@/views/Login.vue'),
            meta: {
                requiresAuth: false
            }
        },
        {
            path: '/dashboard',
            name: 'Dashboard',
            component: () => import('@/views/Dashboard.vue'),
            meta: {
                requiresAuth: true // 需要登录的页面
            }
        },
        {
            path: '/',
            redirect: '/printer-control'
        }
    ]
})

// 全局路由守卫
router.beforeEach((to) => {
    return routeGuard(to)
})

export default router