import { API_CONFIG } from '@/config/api'
import { request } from '@/utils/request'
import type { LoginRequest, LoginResponse } from '@/types/api'

export const authApi = {
    // 登录
    login(data: LoginRequest) {
        return request.post<LoginResponse>(API_CONFIG.paths.login, data)
    }
} 