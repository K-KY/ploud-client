interface StorageInfo {
    storageKey: string;
    ownerId: string;
    group: string;
    originalFilename: string;
    contentType: string;
    size: number;
    isHls: boolean;
}

export type {StorageInfo};