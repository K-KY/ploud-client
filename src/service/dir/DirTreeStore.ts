import {create} from "zustand";
import type {DirectoryInfo} from "../../types/DirectoryInfo.ts";
import type {DirHierarchyInfo} from "../../types/DirHierarchyInfo.ts";

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

const treeSyncChannel = new BroadcastChannel("DRIVE_TREE_SYNC_CHANNEL");

function uniqueChildren(children: number[]) {
    return [...new Set(children)];
}

function buildPathFromTree(tree: Record<number, DirTreeNode>, currentDirSeq: number) {
    if (!currentDirSeq) {
        return [];
    }

    const path: number[] = [];
    const visited = new Set<number>();
    let current: number | null = currentDirSeq;

    while (current != null && !visited.has(current)) {
        visited.add(current);
        path.unshift(current);
        current = tree[current]?.parentDirSeq ?? null;
    }

    return path;
}

export const useDirTreeStore = create<DirTreeStore>((set, get) => ({
    tree: {},
    currentDirSeq: 0,
    currentPath: [],

    setCurrent: (dirSeq) =>
        set((state) => ({
            currentDirSeq: dirSeq,
            currentPath: buildPathFromTree(state.tree, dirSeq),
        })),

    clearCurrent: () =>
        set({
            currentDirSeq: 0,
            currentPath: [],
        }),

    registerChildren: (parentDirSeq, children) =>
        set((state) => {
            const nextTree = {...state.tree};

            if (parentDirSeq !== null && parentDirSeq !== 0 && !nextTree[parentDirSeq]) {
                nextTree[parentDirSeq] = {
                    dirSeq: parentDirSeq,
                    parentDirSeq: null,
                    dirName: "",
                    depth: null,
                    children: [],
                };
            }

            children.forEach((node) => {
                const parentSeq = node.parentSeq ?? parentDirSeq ?? null;
                const existing = nextTree[node.dirSeq];

                nextTree[node.dirSeq] = {
                    dirSeq: node.dirSeq,
                    parentDirSeq: parentSeq,
                    dirName: node.dirName,
                    depth: existing?.depth ?? null,
                    children: existing?.children ?? [],
                };

                if (parentSeq !== null && parentSeq !== 0) {
                    //저장되어있는 노드를들을 꺼내거나 가본 값
                    const parentNode = nextTree[parentSeq] ?? {
                        dirSeq: parentSeq,
                        parentDirSeq: null,
                        dirName: "",
                        depth: null,
                        children: [],
                    };

                    nextTree[parentSeq] = {
                        ...parentNode,
                        children: uniqueChildren([...parentNode.children, node.dirSeq]),
                    };
                }

                broadcastDirAdded(node.dirSeq, parentSeq);
            });

            return {tree: nextTree};
        }),

    //루트 --> 현재 경로를 저장
    hydrateHierarchy: (hierarchy) =>
        set((state) => {
            //트리 정렬
            const normalized = [...hierarchy].sort((a, b) => b.depth - a.depth);
            const nextTree = {...state.tree};

            //기존 트리에 등록
            normalized.forEach((node) => {
                const existing = nextTree[node.dirSeq];
                nextTree[node.dirSeq] = {
                    dirSeq: node.dirSeq,
                    parentDirSeq: node.parentDirSeq,
                    dirName: node.dirName,
                    depth: node.depth,
                    children: existing?.children ?? [],
                };
            });

            //
            normalized.forEach((node, index) => {
                const child = normalized[index + 1];
                if (!child) {
                    return;
                }

                const parentNode = nextTree[node.dirSeq];
                nextTree[node.dirSeq] = {
                    ...parentNode,
                    children: uniqueChildren([...parentNode.children, child.dirSeq]),
                };
            });

            const currentPath = normalized.map((node) => node.dirSeq);
            const currentDirSeq = currentPath[currentPath.length - 1] ?? 0;

            return {
                tree: nextTree,
                currentDirSeq,
                currentPath,
            };
        }),

    validateAndRoute: () => {
        const {tree, currentDirSeq} = get();
        const nextPath = buildPathFromTree(tree, currentDirSeq);

        if (currentDirSeq !== 0 && nextPath[nextPath.length - 1] !== currentDirSeq) {
            window.history.pushState({}, "", "/");
            set({currentDirSeq: 0, currentPath: []});
            return;
        }

        set({currentPath: nextPath});
    },

    repairRegistrySingle: (dirSeq, newParent) =>
        set((state) => {
            const nextTree = {...state.tree};
            const currentNode = nextTree[dirSeq];

            if (!currentNode) {
                return state;
            }

            const oldParent = currentNode.parentDirSeq;

            if (oldParent !== null && nextTree[oldParent]) {
                nextTree[oldParent] = {
                    ...nextTree[oldParent],
                    children: nextTree[oldParent].children.filter((childSeq) => childSeq !== dirSeq),
                };
            }

            nextTree[dirSeq] = {
                ...currentNode,
                parentDirSeq: newParent,
            };

            if (newParent !== null) {
                const parentNode = nextTree[newParent] ?? {
                    dirSeq: newParent,
                    parentDirSeq: null,
                    dirName: "",
                    depth: null,
                    children: [],
                };

                nextTree[newParent] = {
                    ...parentNode,
                    children: uniqueChildren([...parentNode.children, dirSeq]),
                };
            }

            return {
                tree: nextTree,
                currentPath: buildPathFromTree(nextTree, state.currentDirSeq),
            };
        }),
}));

export const broadcastDirMove = (dirSeq: number, parent: number | null) => {
    treeSyncChannel.postMessage({type: "DIR_MOVED", dirSeq, parent});
};

export const broadcastDirAdded = (dirSeq: number, parent: number | null) => {
    treeSyncChannel.postMessage({type: "DIR_ADDED", dirSeq, parent});
};

export const broadcastDirRemoved = (dirSeq: number) => {
    treeSyncChannel.postMessage({type: "DIR_REMOVED", dirSeq});
};

treeSyncChannel.onmessage = (event) => {
    if (event.data.type === "DIR_MOVED") {
        useDirTreeStore.getState().repairRegistrySingle(event.data.dirSeq, event.data.parent);
        return;
    }

    if (event.data.type === "DIR_ADDED") {
        onAddDir(event.data.dirSeq, event.data.parent);
        return;
    }

    if (event.data.type === "DIR_REMOVED") {
        onRemoveDir(event.data.dirSeq);
    }
};

function onAddDir(dirSeq: number, parent: number | null) {
    useDirTreeStore.setState((state) => {
        const nextTree = {...state.tree};
        const existing = nextTree[dirSeq];

        nextTree[dirSeq] = {
            dirSeq,
            parentDirSeq: parent,
            dirName: existing?.dirName ?? "",
            depth: existing?.depth ?? null,
            children: existing?.children ?? [],
        };

        if (parent !== null) {
            const parentNode = nextTree[parent] ?? {
                dirSeq: parent,
                parentDirSeq: null,
                dirName: "",
                depth: null,
                children: [],
            };

            nextTree[parent] = {
                ...parentNode,
                children: uniqueChildren([...parentNode.children, dirSeq]),
            };
        }

        return {tree: nextTree};
    });
}

function onRemoveDir(dirSeq: number) {
    useDirTreeStore.setState((state) => {
        const nextTree = {...state.tree};
        const target = nextTree[dirSeq];

        if (!target) {
            return state;
        }

        if (target.parentDirSeq !== null && nextTree[target.parentDirSeq]) {
            nextTree[target.parentDirSeq] = {
                ...nextTree[target.parentDirSeq],
                children: nextTree[target.parentDirSeq].children.filter((childSeq) => childSeq !== dirSeq),
            };
        }

        delete nextTree[dirSeq];

        return {
            tree: nextTree,
            currentPath: buildPathFromTree(nextTree, state.currentDirSeq),
        };
    });
}
