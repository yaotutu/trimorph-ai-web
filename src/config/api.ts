// API 基础配置
export const API_CONFIG = {
    // API 基础URL
    baseURL: 'http://192.168.200.89:8080/api/v1.0',

    // API 路径
    paths: {
        login: '/login',
    },

    // 请求超时时间（毫秒）
    timeout: 10000,

    // 请求头
    headers: {
        'Content-Type': 'application/json',
    },
} as const 