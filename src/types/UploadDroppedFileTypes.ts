interface DroppedFile {
    file: File;
    relativePath: string;
}

interface UploadDroppedFilesOptions {
    locationPrefix: string;
}

export type {DroppedFile, UploadDroppedFilesOptions};
