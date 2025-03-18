export interface PrinterInfo {
    state: string
    state_message: string
    hostname: string
    software_version: string
    cpu_info: string
}

export interface WebSocketMessage {
    method: string
    params: Record<string, any>
} 