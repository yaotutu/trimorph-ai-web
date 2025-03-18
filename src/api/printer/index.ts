import { PRINTER_API } from './config'
import type { PrinterInfo, WebSocketMessage } from './types'

// WebSocket 连接管理
let socket: WebSocket | null = null
let reconnectTimer: number | null = null

type WebSocketHandlers = {
    onMessage?: (data: any) => void
    onError?: (error: Event) => void
    onClose?: () => void
}

// HTTP API
export const printerApi = {
    async getPrinterInfo(): Promise<{ result: PrinterInfo }> {
        try {
            const response = await fetch(`${PRINTER_API.baseURL}/printer/info`)
            return await response.json()
        } catch (error) {
            console.error('获取打印机信息失败:', error)
            throw error
        }
    },

    async sendGcode(command: string) {
        try {
            const response = await fetch(`${PRINTER_API.baseURL}/printer/gcode/script`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ script: command }),
            })
            return await response.json()
        } catch (error) {
            console.error('发送G-code失败:', error)
            throw error
        }
    }
}

// WebSocket API
export const printerWebSocket = {
    connect(handlers: WebSocketHandlers = {}) {
        if (socket?.readyState === WebSocket.OPEN) return

        socket = new WebSocket(PRINTER_API.wsURL)

        socket.onopen = () => {
            console.log('WebSocket连接成功')
            this.subscribe()
        }

        socket.onmessage = (event) => {
            const data = JSON.parse(event.data)
            handlers.onMessage?.(data)
        }

        socket.onerror = (error) => {
            console.error('WebSocket错误:', error)
            handlers.onError?.(error)
        }

        socket.onclose = () => {
            console.log('WebSocket连接关闭')
            handlers.onClose?.()
            this.reconnect()
        }
    },

    subscribe() {
        const message: WebSocketMessage = {
            method: "printer.objects.subscribe",
            params: {
                objects: {
                    "print_stats": null,
                    "temperature_sensor": null
                }
            }
        }
        this.send(message)
    },

    send(message: WebSocketMessage) {
        if (socket?.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message))
        }
    },

    reconnect() {
        if (reconnectTimer) return
        reconnectTimer = window.setTimeout(() => {
            this.connect()
            reconnectTimer = null
        }, 5000)
    },

    disconnect() {
        if (reconnectTimer) {
            clearTimeout(reconnectTimer)
            reconnectTimer = null
        }
        socket?.close()
        socket = null
    }
} 