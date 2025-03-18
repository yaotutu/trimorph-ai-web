import { defineStore } from 'pinia'
import { ref } from 'vue'
import { printerApi, printerWebSocket } from '@/api/printer'
import type { PrinterInfo } from '@/api/printer/types'

export const usePrinterStore = defineStore('printer', () => {
    const printerInfo = ref<PrinterInfo | null>(null)
    const printerStatus = ref<string>('unknown')
    const isConnected = ref(false)

    async function fetchPrinterInfo() {
        try {
            const { result } = await printerApi.getPrinterInfo()
            printerInfo.value = result
            printerStatus.value = result.state
        } catch (error) {
            console.error('获取打印机信息失败:', error)
        }
    }

    function initWebSocket() {
        printerWebSocket.connect({
            onMessage: (data) => {
                console.log('收到数据:', data)
            },
            onClose: () => {
                isConnected.value = false
            }
        })
    }

    function sendGcode(command: string) {
        return printerApi.sendGcode(command)
    }

    return {
        printerInfo,
        printerStatus,
        isConnected,
        fetchPrinterInfo,
        initWebSocket,
        sendGcode
    }
}) 