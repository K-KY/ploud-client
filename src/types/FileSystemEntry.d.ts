interface FileSystemEntry {
    isFile: boolean;
    isDirectory: boolean;
    name: string;
}

interface FileSystemFileEntry extends FileSystemEntry {
    file: (success: (file: File) => void, error?: (error: DOMException) => void) => void;
}

interface FileSystemDirectoryEntry extends FileSystemEntry {
    createReader: () => FileSystemDirectoryReader;
}

interface FileSystemDirectoryReader {
    readEntries: (
        success: (entries: FileSystemEntry[]) => void,
        error?: (error: DOMException) => void
    ) => void;
}
