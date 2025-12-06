interface UploadResponse {
    id: string;
    filename: string;
    size: number;
    uploadedAt: string;
    // 서버 응답에 맞게 타입 추가
}

export type {UploadResponse}