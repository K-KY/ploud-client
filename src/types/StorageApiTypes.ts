import type {DirectoryInfo} from "./DirectoryInfo.ts";
import type {FileInfo} from "./FileInfo.ts";

interface ExploreResponse {
    dirs: DirectoryInfo[];
    current: number;
}

interface MoveDirRequest {
    dirSeq: number;
    targetSeq: number | null;
}

interface MoveFilesRequest {
    targetDirSeq: number | null;
    files: {
        fileSeq: number;
    }[];
}

interface RenameDirRequest {
    dirSeq: number;
    dirName: string;
}

interface RenameFileRequest {
    fileSeq: number;
    title: string;
}

interface SearchResponse {
    keyword: string;
    limit: number;
    dirs: DirectoryInfo[];
    files: FileInfo[];
    directoryCount: number;
    fileCount: number;
}

export type {
    ExploreResponse,
    MoveDirRequest,
    MoveFilesRequest,
    RenameDirRequest,
    RenameFileRequest,
    SearchResponse,
};
