import type { TemperatureLimits } from '@/api/printer/types'
import type { TemperaturePreset } from '@/config/temperature-presets'

/**
 * 检查温度是否在限制范围内
 */
export function isTemperatureInRange(
    temp: number,
    limits: { min_temp: number; max_temp: number }
): boolean {
    return temp >= limits.min_temp && temp <= limits.max_temp
}

/**
 * 获取适应温度限制的预设温度
 */
export function getAdjustedPresetTemperature(
    preset: TemperaturePreset,
    limits: TemperatureLimits
): { hotend: number; bed: number } {
    return {
        hotend: Math.min(Math.max(preset.hotend, limits.extruder.min_temp), limits.extruder.max_temp),
        bed: Math.min(Math.max(preset.bed, limits.heater_bed.min_temp), limits.heater_bed.max_temp)
    }
}

/**
 * 格式化温度显示
 */
export function formatTemperature(temp: number): string {
    return temp.toFixed(1)
}

/**
 * 解析配置文件中的温度值
 */
export function parseConfigTemperature(temp: string): number {
    return parseFloat(temp)
} 