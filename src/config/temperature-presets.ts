import type { Temperature } from '@/api/printer/types'

export interface TemperaturePreset {
    hotend: number
    bed: number
    description: string
}

export const TEMPERATURE_PRESETS: Record<string, TemperaturePreset> = {
    PLA: {
        hotend: 200,
        bed: 60,
        description: 'PLA 打印推荐温度'
    },
    PETG: {
        hotend: 240,
        bed: 80,
        description: 'PETG 打印推荐温度'
    },
    TPU: {
        hotend: 220,
        bed: 60,
        description: 'TPU 打印推荐温度'
    }
} as const 