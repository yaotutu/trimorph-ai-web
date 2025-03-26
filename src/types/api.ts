// API 响应的基础接口
export interface ApiResponse<T = any> {
    code: number
    data: T
    msg: string
}

// 登录请求参数接口
export interface LoginRequest {
    username: string
    password: string
}

// 登录响应数据接口
export interface LoginResponse {
    token: string
}

// 文件列表项接口
export interface FileItem {
    filename: string
    size: number
    modified: string
    // 根据实际返回的数据结构补充其他字段
}

// 文件列表响应接口
export interface FileListResponse {
    files: FileItem[]
    // 根据实际返回的数据结构补充其他字段
} 