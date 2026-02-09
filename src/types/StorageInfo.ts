interface StorageInfo {
    ownerId: string;
    group: string;
    originalFilename: string;
    location: string;
    contentType: string;
    size: number;
    isHls: boolean;
}

export type {StorageInfo};