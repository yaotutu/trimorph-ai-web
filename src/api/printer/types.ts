export interface PrinterInfo {
    state: string
    state_message: string
    hostname: string
    software_version: string
    cpu_info: string
}

export interface ApiResponse<T> {
    result: T
}

export interface WebSocketMessage {
    method: string
    params: Record<string, any>
}

export interface PrinterStatus {
    position: {
        x: number
        y: number
        z: number
    }
    temperature: {
        bed: number
        extruder: number
    }
    state: string
}

export interface GcodeCommand {
    script: string
}

export interface Temperature {
    hotend: number
    bed: number
}

// 温度限制接口
export interface TemperatureLimits {
    extruder: {
        min_temp: number
        max_temp: number
    }
    heater_bed: {
        min_temp: number
        max_temp: number
    }
}

// 配置文件响应接口
export interface ConfigFileResponse {
    result: {
        eventtime: number
        status: {
            configfile: {
                config: {
                    extruder: {
                        min_temp: string
                        max_temp: string
                    }
                    heater_bed: {
                        min_temp: string
                        max_temp: string
                    }
                }
            }
        }
    }
} 