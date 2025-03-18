export const PRINTER_API = {
    baseURL: 'http://192.168.100.223',
    wsURL: 'ws://192.168.100.223/websocket',
    endpoints: {
        info: '/printer/info',
        gcode: '/printer/gcode/script',
        status: '/printer/objects/query',
        temperature: '/printer/objects/query?temperatures'
    },
    retryTimes: 3,
    timeout: 5000
} as const

// G-code命令常量
export const GCODE_COMMANDS = {
    // 坐标系统
    RELATIVE_POSITIONING: 'G91', // 相对坐标系
    ABSOLUTE_POSITIONING: 'G90', // 绝对坐标系

    // 移动
    MOVE: 'G1',       // 线性移动
    HOME: 'G28',      // 回原点

    // 速度和加速度
    DEFAULT_SPEED: 'F3000',  // 默认移动速度
    SLOW_SPEED: 'F1000',    // 慢速移动
    FAST_SPEED: 'F5000',    // 快速移动
} as const 