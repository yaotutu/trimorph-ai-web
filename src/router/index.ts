import { createRouter, createWebHistory } from 'vue-router'
import PrinterControl from '@/views/PrinterControl.vue'
import ModelPreview from '@/views/ModelPreview.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/printer-control',
            name: 'PrinterControl',
            component: PrinterControl
        },
        {
            path: '/model-preview',
            name: 'ModelPreview',
            component: ModelPreview
        },
        {
            path: '/',
            redirect: '/printer-control'
        }
    ]
})

export default router