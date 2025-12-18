interface UploadStatus {
    status: 'ready' | 'uploading' | 'success' | 'error';
    message: string;
    progress?: number;
}

export type {UploadStatus};