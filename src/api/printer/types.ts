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
export interface WebcamState {
    enabled: boolean
    url: string
}

export interface WebcamInfo {
    name: string;
    location: string;
    service: string;
    enabled: boolean;
    icon: string;
    target_fps: number;
    target_fps_idle: number;
    stream_url: string;
    snapshot_url: string;
    flip_horizontal: boolean;
    flip_vertical: boolean;
    rotation: number;
    aspect_ratio: string;
    extra_data: Record<string, any>;
    source: string;
    uid: string;
}

export interface WebcamsResponse {
    webcams: WebcamInfo[];
}

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