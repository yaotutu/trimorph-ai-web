import { PRINTER_API, GCODE_COMMANDS } from './config'
import type {
    PrinterInfo,
    ApiResponse,
    WebSocketMessage,
    PrinterStatus,
    ConfigFileResponse,
    WebcamInfo,
    WebcamsResponse
} from './types'

// API错误类
class PrinterApiError extends Error {
    constructor(message: string, public status?: number) {
        super(message)
        this.name = 'PrinterApiError'
    }
}

// 基础请求函数
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
        const response = await fetch(`${PRINTER_API.baseURL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        })

        if (!response.ok) {
            throw new PrinterApiError(`API请求失败: ${response.statusText}`, response.status)
        }

        return await response.json()
    } catch (error) {
        if (error instanceof PrinterApiError) {
            throw error
        }
        throw new PrinterApiError(`API请求错误: ${error instanceof Error ? error.message : '未知错误'}`)
    }
}

// 打印机API服务
export const printerApi = {
    // 获取所有相机列表
    async getWebcams(): Promise<WebcamsResponse> {
        try {
            const response = await fetch(`${PRINTER_API.baseURL}${PRINTER_API.endpoints.webcams}`)
            if (!response.ok) {
                throw new Error('获取相机列表失败')
            }
            const data = await response.json()
            return data as WebcamsResponse
        } catch (error) {
            console.error('获取相机列表失败:', error)
            throw error
        }
    },

    // 获取相机流URL
    getWebcamStreamUrl(webcam: WebcamInfo): string {
        const baseUrl = PRINTER_API.baseURL
        // 处理完整URL的情况
        if (webcam.stream_url.startsWith('http')) {
            return webcam.stream_url
        }
        // 处理相对URL的情况
        const path = webcam.stream_url.startsWith('/')
            ? webcam.stream_url.slice(1)
            : webcam.stream_url
        return `${baseUrl}/${path}`
    },

    // 检查相机可用性
    async checkWebcamAvailability(url: string): Promise<boolean> {
        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 5000) // 5秒超时

            const response = await fetch(url, {
                method: 'HEAD',
                signal: controller.signal
            })

            clearTimeout(timeoutId)
            return response.ok
        } catch (error) {
            console.error('检查相机可用性失败:', error)
            return false
        }
    },

    // 获取相机快照URL
    getWebcamSnapshotUrl(webcam: WebcamInfo): string {
        const baseUrl = PRINTER_API.baseURL
        return webcam.snapshot_url.startsWith('http')
            ? webcam.snapshot_url
            : `${baseUrl}${webcam.snapshot_url}`
    },

    // 获取打印机信息
    async getPrinterInfo(): Promise<ApiResponse<PrinterInfo>> {
        return await fetchApi(PRINTER_API.endpoints.info)
    },

    // 发送G-code命令
    async sendGcode(command: string): Promise<ApiResponse<string>> {
        return await fetchApi(PRINTER_API.endpoints.gcode, {
            method: 'POST',
            body: JSON.stringify({ script: command }),
        })
    },

    // 移动打印头
    async movePrinthead(axis: 'X' | 'Y' | 'Z', distance: number, speed?: string): Promise<ApiResponse<string>> {
        const command = [
            GCODE_COMMANDS.RELATIVE_POSITIONING,
            `${GCODE_COMMANDS.MOVE} ${axis}${distance} ${speed || GCODE_COMMANDS.DEFAULT_SPEED}`,
            GCODE_COMMANDS.ABSOLUTE_POSITIONING
        ].join('\n')

        return await this.sendGcode(command)
    },

    // 回原点
    async homeAxis(axis?: 'X' | 'Y' | 'Z'): Promise<ApiResponse<string>> {
        const command = `${GCODE_COMMANDS.HOME}${axis ? ` ${axis}` : ''}`
        return await this.sendGcode(command)
    },

    // 获取打印机状态
    async getPrinterStatus(): Promise<ApiResponse<PrinterStatus>> {
        return await fetchApi(PRINTER_API.endpoints.status)
    },

    // 获取温度限制
    async getTemperatureLimits(): Promise<ConfigFileResponse> {
        return await fetchApi('/printer/objects/query?configfile')
    }
}

// WebSocket连接管理
let socket: WebSocket | null = null
let reconnectTimer: number | null = null

export const printerWebSocket = {
    connect(handlers: {
        onMessage?: (data: any) => void
        onError?: (error: Event) => void
        onClose?: () => void
    } = {}) {
        if (socket?.readyState === WebSocket.OPEN) return

        socket = new WebSocket(PRINTER_API.wsURL)

        socket.onopen = () => {
            console.log('WebSocket连接成功')
            this.subscribe()
        }

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data)
                handlers.onMessage?.(data)
            } catch (error) {
                console.error('WebSocket消息解析错误:', error)
            }
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
            method: 'printer.objects.subscribe',
            params: {
                objects: {
                    print_stats: null,
                    heater_bed: null,
                    extruder: null,
                    toolhead: null
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
        }, PRINTER_API.timeout)
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