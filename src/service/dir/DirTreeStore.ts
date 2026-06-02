import { create } from 'zustand';
import type {DirectoryInfo} from "../../types/DirectoryInfo.ts";

interface DirTreeState {
    parentRegistry: Record<number, number | null>; // 조각 모음 및 복구되는 족보 맵
    nameRegistry: Record<number, string>;          // ID -> 디렉토리 이름
    currentPath: number[];                         // 현재 위치 PK 배열
}

interface DirTreeActions {
    setCurrent: (path: number[]) => void;
    registerChildren: (children: DirectoryInfo[]) => void;
    //새로고침 시 주소창의 암호화/인코딩된 경로 스트링을 받아 뼈대 맵을 복구하는 함수
    restorePathFromUrl: (urlPathStr: string) => void;
    validateAndRoute: () => void;
    //다른 탭의 변경사항을 수신하여 맵을 고치는 함수
    repairRegistrySingle: (dirKey: number, newParent: number | null) => void;
}

type DirTreeStore = DirTreeState & DirTreeActions;

// 브라우저 내부 IPC 채널 개설
const treeSyncChannel = new BroadcastChannel('DRIVE_TREE_SYNC_CHANNEL');

export const useDirTreeStore = create<DirTreeStore>((set, get) => {

    //스토어 생성과 동시에 Broadcast Channel 리스너 가동 (멀티탭 초고속 동기화)
    treeSyncChannel.onmessage = (event) => {
        const { type, dirKey, newParent } = event.data;
        if (type === 'DIR_MOVED') {
            get().repairRegistrySingle(dirKey, newParent);
        }
    };

    return {
        parentRegistry: {},
        nameRegistry: {},
        currentPath: [],


        // 평소 마우스 탐색 시 자식 리스트를 받아 조각 모음
        registerChildren: (children) => set((state) => {
            const nextParentRegistry = { ...state.parentRegistry };
            const nextNameRegistry = { ...state.nameRegistry };

            children.forEach((node) => {
                nextParentRegistry[node.dirSeq] = node.parentSeq;
                nextNameRegistry[node.dirSeq] = node.dirName;
            });

            return {
                parentRegistry: nextParentRegistry,
                nameRegistry: nextNameRegistry
            };
        }),

        //주소창에 존재하는 암호화경로로 현재 탐색 위치 복원
        restorePathFromUrl: (urlPathStr) => set(() => {
            const nextParentRegistry: Record<number, number | null> = {};
            const nextNameRegistry: Record<number, string> = {};
            const nextCurrentPath: number[] = [];
            console.log(urlPathStr);
            return {
                parentRegistry: nextParentRegistry,
                nameRegistry: nextNameRegistry,
                currentPath: nextCurrentPath
            };
        }),

        // 족보 붕괴 검증
        validateAndRoute: () => {
            const { parentRegistry, currentPath } = get();
            if (currentPath.length === 0) return;

            let currentId: number | null = currentPath[currentPath.length - 1];
            const validAncestors = new Set<number>([currentId]);

            while (currentId !== null && currentId !== 0 && parentRegistry[currentId] !== undefined) {
                currentId = parentRegistry[currentId];
                if (currentId !== null) validAncestors.add(currentId);
            }

            const isPathValid = currentPath.every(id => validAncestors.has(id));

            if (!isPathValid) {
                // 주소창 청소 및 튕겨내기
                window.history.pushState({}, '', '/');
                set({ currentPath: [0], parentRegistry: {}, nameRegistry: {} });
            }
        },


        //멀티탭 이슈 대응
        // Broadcast Channel 혹은 SSE 수신 시 특정 노드 관계 수정
        repairRegistrySingle: (dirKey, newParent) => {
            set((state) => ({
                parentRegistry: { ...state.parentRegistry, [dirKey]: newParent }
            }));

            // 수리 후 즉시 내가 서 있는 발판 검증
            get().validateAndRoute();
        },

        setCurrent: (path)=>{
            console.log(path)
        }
    };
});

//디렉토리 이동
export const broadcastDirMove = (dirKey: number, parent: number | null) => {
    treeSyncChannel.postMessage({ type: 'DIR_MOVED', dirKey, parent });
};

//디렉토리 탐색 또는 새로운 디렉토리 업로드 상황에 발생
export const broadcastDirAdded = (dirKey: number, parent: number | null) => {
    treeSyncChannel.postMessage({type: 'DIR_ADDED', dirKey, parent});
}

//디렉토리 삭제
export const broadcastDirRemoved = (dirKey: number, parent: number | null) => {
    treeSyncChannel.postMessage({type: 'DIR_REMOVED', dirKey, parent});
}

treeSyncChannel.onmessage= (event) => {
    if (event.data.type === 'DIR_MOVED') {
        console.log('DIR_MOVED', event.data.dirKey, event.data.parent);
        return
    }

    if (event.data.type === 'DIR_ADDED') {
        console.log('DIR_ADDED', event.data.dirKey, event.data.parent);
        return
    }

    if (event.data.type === 'DIR_REMOVED') {
        console.log('DIR_REMOVED', event.data.dirKey, event.data.parent);
        return
    }
}