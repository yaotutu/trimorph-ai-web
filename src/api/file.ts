import { request } from '@/utils/request'
import type { FileListResponse } from '@/types/api'

export const fileApi = {
    // 获取文件列表
    getFileList() {
        return request.get<FileListResponse>('/file/list')
    }
} 