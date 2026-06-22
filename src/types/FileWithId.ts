interface FileWithId {
    file: File;
    id: string;
    preSignedUrl: string;
    storageKey: string;
    relativePath?: string;//이 파일의 사용자 컴퓨터에서의 위치
}

export type {FileWithId}