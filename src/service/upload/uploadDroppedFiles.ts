import {getPresignedUrl} from "../../axios/StorageApi.ts";
import {postFile} from "../../axios/MetadataApi.ts";
import type {FileWithId} from "../../types/FileWithId.ts";
import type {StorageInfo} from "../../types/StorageInfo.ts";

export interface DroppedFile {
    file: File;
    relativePath: string;
}

interface UploadDroppedFilesOptions {
    locationPrefix: string;
}

export async function extractDroppedFiles(dataTransfer: DataTransfer): Promise<DroppedFile[]> {
    const items = Array.from(dataTransfer.items ?? []);

    if (items.length === 0) {
        return Array.from(dataTransfer.files ?? []).map((file) => ({
            file,
            relativePath: file.name,
        }));
    }

    const droppedFiles: DroppedFile[] = [];

    for (const item of items) {
        const entry = item.webkitGetAsEntry?.();

        if (!entry) {
            const file = item.getAsFile();
            if (file) {
                droppedFiles.push({file, relativePath: file.name});
            }
            continue;
        }

        droppedFiles.push(...await readEntry(entry, ""));
    }

    return droppedFiles;
}

export async function uploadDroppedFiles(files: DroppedFile[], options: UploadDroppedFilesOptions) {
    const fileWithIds: FileWithId[] = files.map(({file, relativePath}) => ({
        file,
        relativePath,
        id: `${relativePath}-${file.size}-${crypto.randomUUID()}`,
        preSignedUrl: "",
        storageKey: "",
    }));

    const presignedUrls = await getPresignedUrl(fileWithIds);

    const uploadTargets = fileWithIds.map((fileWithId) => {
        const urlData = presignedUrls.find((item: { fileId: string }) => item.fileId === fileWithId.id);

        return {
            ...fileWithId,
            preSignedUrl: urlData?.preSignedUrl || urlData?.url,
            storageKey: urlData?.storageKey,
        };
    });

    await Promise.all(uploadTargets.map((target) => uploadSingleFile(target, options)));
}

async function uploadSingleFile(fileWithId: FileWithId, options: UploadDroppedFilesOptions) {
    const eTag = await putFile(fileWithId.preSignedUrl, fileWithId.file);
    const relativePath = fileWithId.relativePath || fileWithId.file.webkitRelativePath || fileWithId.file.name;
    console.log(fileWithId)
    const metadata: StorageInfo = {
        originalFilename: relativePath,
        location: joinPath(options.locationPrefix, relativePath),
        size: fileWithId.file.size,
        storageKey: fileWithId.storageKey,
        contentType: fileWithId.file.type,
        fileHash: eTag.replace(/"/g, ""),
    };

    await postFile(metadata);
}

function putFile(preSignedUrl: string, file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open("PUT", preSignedUrl);
        xhr.onload = () => {
            if (xhr.status !== 200) {
                reject(new Error(xhr.responseText || "업로드 실패"));
                return;
            }

            const eTag = xhr.getResponseHeader("ETag");

            if (!eTag) {
                reject(new Error("업로드 응답에 ETag가 없습니다."));
                return;
            }

            resolve(eTag);
        };
        xhr.onerror = () => reject(new Error("네트워크 오류가 발생했습니다."));
        xhr.send(file);
    });
}

async function readEntry(entry: FileSystemEntry, parentPath: string): Promise<DroppedFile[]> {
    if (entry.isFile) {
        const file = await new Promise<File>((resolve, reject) => {
            (entry as FileSystemFileEntry).file(resolve, reject);
        });

        return [{
            file,
            relativePath: `${parentPath}${file.name}`,
        }];
    }

    const directory = entry as FileSystemDirectoryEntry;
    const reader = directory.createReader();
    const children = await readAllEntries(reader);
    const nested = await Promise.all(
        children.map((child) => readEntry(child, `${parentPath}${directory.name}/`))
    );

    return nested.flat();
}

async function readAllEntries(reader: FileSystemDirectoryReader): Promise<FileSystemEntry[]> {
    const entries: FileSystemEntry[] = [];

    while (true) {
        const batch = await new Promise<FileSystemEntry[]>((resolve, reject) => {
            reader.readEntries(resolve, reject);
        });

        if (batch.length === 0) {
            return entries;
        }

        entries.push(...batch);
    }
}

function joinPath(prefix: string, filename: string) {
    if (!prefix) {
        return filename;
    }

    return `${prefix.replace(/\/$/, "")}/${filename.replace(/^\//, "")}`;
}
