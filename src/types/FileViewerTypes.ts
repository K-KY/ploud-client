import type {SearchResponse} from "./StorageApiTypes.ts";

type InternalDragPayload =
    | {
        kind: "directory";
        dirSeq: number;
        parentSeq: number | null;
        dirName: string;
    }
    | {
        kind: "file";
        fileSeq: number;
    };

interface FileViewerProps {
    searchResult?: SearchResponse | null;
    searchKeyword?: string;
    onClearSearch?: () => void;
}

export type {FileViewerProps, InternalDragPayload};
