import type {DirectoryInfo} from "./DirectoryInfo.ts";
import type {DirHierarchyInfo} from "./DirHierarchyInfo.ts";

interface DirTreeNode {
    dirSeq: number;
    parentDirSeq: number | null;
    dirName: string;
    depth: number | null;
    children: number[];
}

interface DirTreeState {
    tree: Record<number, DirTreeNode>;
    currentDirSeq: number;
    currentPath: number[];
}

interface DirTreeActions {
    setCurrent: (dirSeq: number) => void;
    clearCurrent: () => void;
    registerChildren: (parentDirSeq: number | null, children: DirectoryInfo[]) => void;
    hydrateHierarchy: (hierarchy: DirHierarchyInfo[]) => void;
    validateAndRoute: () => void;
    repairRegistrySingle: (dirSeq: number, newParent: number | null) => void;
}

type DirTreeStore = DirTreeState & DirTreeActions;

export type {DirTreeActions, DirTreeNode, DirTreeState, DirTreeStore};
