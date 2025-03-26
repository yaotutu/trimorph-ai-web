import { API_CONFIG } from '@/config/api'
import type { ApiResponse } from '@/types/api'
import { ElMessage } from 'element-plus'

class RequestError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'RequestError'
    }
}

export class Request {
    private static instance: Request
    private token: string = ''

    private constructor() { }

    public static getInstance(): Request {
        if (!Request.instance) {
            Request.instance = new Request()
        }
        return Request.instance
    }

    // 设置token
    setToken(token: string) {
        this.token = token
    }

    // 获取token
    getToken(): string {
        return this.token
    }

    // 清除token
    clearToken() {
        this.token = ''
    }

    // 获取完整的URL
    private getFullUrl(path: string): string {
        return `${API_CONFIG.baseURL}${path}`
    }

    // 获取请求头
    private getHeaders(): HeadersInit {
        const headers = { ...API_CONFIG.headers }
        if (this.token) {
            // @ts-ignore
            headers['Authorization'] = this.token
        }
        return headers
    }

    // 处理响应
    private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
        if (!response.ok) {
            throw new RequestError(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        return data as ApiResponse<T>
    }

    // GET请求
    async get<T>(path: string): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(this.getFullUrl(path), {
                method: 'GET',
                headers: this.getHeaders(),
            })
            return await this.handleResponse<T>(response)
        } catch (error) {
            throw new RequestError(error instanceof Error ? error.message : '请求失败')
        }
    }

    // POST请求
    async post<T>(path: string, data?: any): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(this.getFullUrl(path), {
                method: 'POST',
                headers: this.getHeaders(),
                body: data ? JSON.stringify(data) : undefined,
            })
            return await this.handleResponse<T>(response)
        } catch (error) {
            throw new RequestError(error instanceof Error ? error.message : '请求失败')
        }
    }

    // PUT请求
    async put<T>(path: string, data?: any): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(this.getFullUrl(path), {
                method: 'PUT',
                headers: this.getHeaders(),
                body: data ? JSON.stringify(data) : undefined,
            })
            return await this.handleResponse<T>(response)
        } catch (error) {
            throw new RequestError(error instanceof Error ? error.message : '请求失败')
        }
    }

    // DELETE请求
    async delete<T>(path: string): Promise<ApiResponse<T>> {
        try {
            const response = await fetch(this.getFullUrl(path), {
                method: 'DELETE',
                headers: this.getHeaders(),
            })
            return await this.handleResponse<T>(response)
        } catch (error) {
            throw new RequestError(error instanceof Error ? error.message : '请求失败')
        }
    }
}

// 导出请求实例
export const request = Request.getInstance()