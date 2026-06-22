import React, {useEffect, useState} from "react";
import {
    getDirs,
    getFiles,
    getDirHierarchy,
    getDownloadUrl,
    getDirDownloadUrl,
    deleteDirs,
    moveDir,
    moveFiles
} from "../axios/StorageApi.ts";
import {BorderLayout} from "./BoarderLayout.tsx";
import type {FileInfo} from "../types/FileInfo.ts";
import type {DirectoryInfo} from "../types/DirectoryInfo.ts";
import styles from "../styles/FileViewer.module.css"
import {DirIcon} from "./DirIcon.tsx";
import {FileIcon} from "./FileIcon.tsx";
import {ActionMenu, type ActionMenuItem} from "./ActionMenu.tsx";
import {useNavigate, useParams} from "react-router-dom";
import {useDirTreeStore} from "../service/dir/DirTreeStore.ts";
import {extractDroppedFiles, uploadDroppedFiles} from "../service/upload/uploadDroppedFiles.ts";

const ROOT_DIR_SEQ = 0;
const INTERNAL_DRAG_MIME = "application/x-ploud-item";

type InternalDragPayload =
    | {
        kind: "directory";
        dirSeq: number;
        parentSeq: number | null;
        dirName: string;
    }
    | {
        kind: "file";
        file: FileInfo;
    };

const FileViewer: React.FC = () => {
    const [dirs, setDirs] = useState<DirectoryInfo[]>([]);
    const [files, setFiles] = useState<FileInfo[]>([]);
    const [dragOverTargetSeq, setDragOverTargetSeq] = useState<number | null | undefined>(undefined);
    const [isExternalDragOver, setIsExternalDragOver] = useState(false);
    const params = useParams<{ dir?: string;  }>();
    const parsedDirSeq = Number(params.dir ?? ROOT_DIR_SEQ);
    const currentDirSeq = Number.isNaN(parsedDirSeq) ? ROOT_DIR_SEQ : parsedDirSeq;
    const navigate = useNavigate();
    //탐색 트리
    const registerChildren = useDirTreeStore((state) => state.registerChildren);
    //현재 경로
    const hydrateHierarchy = useDirTreeStore((state) => state.hydrateHierarchy);
    //트리 초기화 함수
    const clearCurrent = useDirTreeStore((state) => state.clearCurrent);
    //현재 경로
    const currentPath = useDirTreeStore((state) => state.currentPath);
    const tree = useDirTreeStore((state) => state.tree);

    useEffect(() => {
        async function load() {
            await refreshCurrentDir();

            const hierarchyRes = currentDirSeq === ROOT_DIR_SEQ ? null : await getDirHierarchy(currentDirSeq);
            if (hierarchyRes) {
                //경로 등록
                hydrateHierarchy(hierarchyRes);
            } else {
                //만약 없으면 루트
                clearCurrent();
            }
        }

        load();
    }, [
        currentDirSeq,
        clearCurrent,
        hydrateHierarchy,
        registerChildren,
    ]);

    // 이동이나 업로드 후 현재 디렉토리 목록을 다시 조회
    async function refreshCurrentDir() {
        const [dirRes, fileRes] = await Promise.all([
            getDirs(currentDirSeq),
            getFiles({
                dirSeq: currentDirSeq,
            }),
        ]);

        setDirs(dirRes.dirs);
        registerChildren(currentDirSeq === ROOT_DIR_SEQ ? null : currentDirSeq, dirRes.dirs);
        setFiles(fileRes);
    }

    function changeDir(dir: DirectoryInfo) {
        navigate(
            `/${dir.dirSeq}`,
            { replace: false }
        );
    }

    async function gotoParent() {
        const parentSeq = currentPath.length > 1 ? currentPath[currentPath.length - 2] : ROOT_DIR_SEQ;

        if (!parentSeq || parentSeq === ROOT_DIR_SEQ) {
            navigate("/");
            return;
        }

        navigate(
            `/${parentSeq}`,
            { replace: false }
        );
    }

    // 디렉토리 행을 앱 내부 드래그 데이터로 변환
    function handleDirDragStart(event: React.DragEvent, dir: DirectoryInfo) {
        console.log("directoryDrag", dir)
        const payload: InternalDragPayload = {
            kind: "directory",
            dirSeq: dir.dirSeq,
            parentSeq: dir.parentSeq ?? null,
            dirName: dir.dirName,
        };

        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData(INTERNAL_DRAG_MIME, JSON.stringify(payload));
    }

    // 파일 행을 앱 내부 드래그 데이터로 변환
    function handleFileDragStart(event: React.DragEvent, file: FileInfo) {
        const payload: InternalDragPayload = {
            kind: "file",
            file,
        };

        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData(INTERNAL_DRAG_MIME, JSON.stringify(payload));
    }

    // 앱 내부 항목이 드랍 가능한 행 위에 있는지 표시
    function handleInternalDragOver(event: React.DragEvent, targetSeq: number | null) {
        if (!isInternalDrag(event)) {
            return;
        }

        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
        setDragOverTargetSeq(targetSeq);
    }

    // 앱 내부 항목을 특정 디렉토리로 이동
    async function handleDropToDir(event: React.DragEvent, targetSeq: number) {
        if (!isInternalDrag(event)) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        setDragOverTargetSeq(undefined);

        const payload = getInternalDragPayload(event);

        if (!payload) {
            return;
        }

        await moveInternalItem(payload, targetSeq);
    }

    // 앱 내부 항목을 상위 디렉토리로 이동
    async function handleDropToParent(event: React.DragEvent) {
        if (!isInternalDrag(event)) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();
        setDragOverTargetSeq(undefined);

        const payload = getInternalDragPayload(event);

        if (!payload) {
            return;
        }

        await moveInternalItem(payload, getParentDropTargetSeq());
    }

    // 드래그 payload 종류에 따라 파일 또는 디렉토리 이동 API 호출
    async function moveInternalItem(payload: InternalDragPayload, targetSeq: number | null) {
        if (payload.kind === "file") {
            await moveFiles({
                targetDirSeq: targetSeq,
                files: [payload.file],
            });

            await refreshCurrentDir();
            return;
        }

        if (payload.dirSeq === targetSeq || payload.parentSeq === targetSeq || isDescendantTarget(payload.dirSeq, targetSeq)) {
            return;
        }

        await moveDir({
            dirSeq: payload.dirSeq,
            targetSeq,
        });

        useDirTreeStore.getState().repairRegistrySingle(payload.dirSeq, targetSeq);
        await refreshCurrentDir();
    }

    // 현재 경로 기준 상위 드랍 대상 디렉토리 계산
    function getParentDropTargetSeq() {
        return currentPath.length > 1 ? currentPath[currentPath.length - 2] : null;
    }

    // 디렉토리를 자기 하위로 옮기는 순환 이동 방지
    function isDescendantTarget(dirSeq: number, targetSeq: number | null) {
        let current = targetSeq;
        const visited = new Set<number>();

        while (current != null && !visited.has(current)) {
            if (current === dirSeq) {
                return true;
            }

            visited.add(current);
            current = tree[current]?.parentDirSeq ?? null;
        }

        return false;
    }

    // 앱 내부 드래그인지 확인
    function isInternalDrag(event: React.DragEvent) {
        return Array.from(event.dataTransfer.types).includes(INTERNAL_DRAG_MIME);
    }

    // dataTransfer에 저장한 앱 내부 payload 파싱
    function getInternalDragPayload(event: React.DragEvent): InternalDragPayload | null {
        const raw = event.dataTransfer.getData(INTERNAL_DRAG_MIME);

        if (!raw) {
            return null;
        }

        try {
            return JSON.parse(raw) as InternalDragPayload;
        } catch (error) {
            console.error("invalid drag payload", error);
            return null;
        }
    }

    // 사용자의 컴퓨터에서 들어온 파일 드래그인지 확인
    function isExternalFileDrag(event: React.DragEvent) {
        return Array.from(event.dataTransfer.types).includes("Files");
    }

    // 외부 파일 드래그가 뷰어 위에 올라왔을 때 업로드 드랍 상태 표시
    function handleViewerDragOver(event: React.DragEvent) {
        if (!isExternalFileDrag(event)) {
            return;
        }

        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
        setIsExternalDragOver(true);
    }

    // 외부 파일 또는 디렉토리를 현재 위치에 업로드
    async function handleViewerDrop(event: React.DragEvent) {
        if (!isExternalFileDrag(event)) {
            return;
        }

        event.preventDefault();
        setIsExternalDragOver(false);

        const droppedFiles = await extractDroppedFiles(event.dataTransfer);

        if (droppedFiles.length === 0) {
            return;
        }

        await uploadDroppedFiles(droppedFiles, {
            locationPrefix: buildCurrentLocation(),
        });
        await refreshCurrentDir();
    }

    // 현재 경로 이름을 업로드 메타데이터 location 값으로 변환
    function buildCurrentLocation() {
        return currentPath
            .map((dirSeq) => tree[dirSeq]?.dirName)
            .filter((dirName): dirName is string => Boolean(dirName))
            .join("/");
    }

    function getDirMenus(dir: DirectoryInfo): ActionMenuItem[] {
        return [
            {
                key: 'download',
                label: '다운로드',
                icon: <DirIcon/>,
                onClick: () => downloadDir(dir),
            },
            {
                key: 'rename',
                label: '이름 변경',
                icon: <DirIcon/>,
                onClick: () => renameDir(dir),
            },
            {
                key: 'delete',
                label: '삭제',
                icon: <DirIcon/>,
                danger: true,
                onClick: () => deleteDir(dir),
            },
        ];
    }

    function getFileMenus(file: FileInfo): ActionMenuItem[] {
        return [
            {
                key: 'download',
                label: '다운로드',
                icon: <DirIcon/>,
                onClick: () => downloadFile(file),
            },
            {
                key: 'rename',
                label: '이름 변경',
                icon: <DirIcon/>,
                onClick: () => renameFile(file),
            },
            {
                key: 'delete',
                label: '삭제',
                icon: <DirIcon/>,
                danger: true,
                onClick: () => deleteFile(file),
            },
        ];
    }

    async function downloadFile(file: FileInfo) {
        const downloadUrl = await getDownloadUrl(file);
        const a = document.createElement('a');
        a.href = downloadUrl.preSignedUrl;
        a.download = file.title;
        a.click();
    }

    function renameFile(file: FileInfo) {
        console.log("rename file", file);
    }

    function deleteFile(file: FileInfo) {
        console.log("delete file", file);
    }

    function downloadDir(dir: DirectoryInfo) {
        getDirDownloadUrl(dir);

    }

    function renameDir(dir: DirectoryInfo) {
        console.log("rename file", dir);
    }

    async function deleteDir(dir: DirectoryInfo) {
        await deleteDirs({dirSeq: dir.dirSeq});

        const [dirsRes, filesRes] = await Promise.all([
            getDirs(currentDirSeq),
            getFiles({dirSeq: currentDirSeq}),
        ]);

        setDirs(dirsRes.dirs);
        registerChildren(currentDirSeq === ROOT_DIR_SEQ ? null : currentDirSeq, dirsRes.dirs);
        setFiles(filesRes);
    }

    return (
        <div
            className={`${styles.fileListContainer} ${isExternalDragOver ? styles.externalDragOver : ""}`}
            onDragOver={handleViewerDragOver}
            onDragLeave={() => setIsExternalDragOver(false)}
            onDrop={handleViewerDrop}
        >
            <div className={styles.viewerShell}>
                <div className={styles.viewerHeader}>
                    <div className={styles.headerName}>이름</div>
                    <div className={styles.headerMeta}>정보</div>
                </div>
                <div className={`${styles.fileList}`}>
                    {currentDirSeq !== ROOT_DIR_SEQ ? (
                        <a
                            className={`${styles.item} ${dragOverTargetSeq === getParentDropTargetSeq() ? styles.dropTarget : ""}`}
                            onClick={() => gotoParent()}
                            onDragOver={(event) => handleInternalDragOver(event, getParentDropTargetSeq())}
                            onDragLeave={() => setDragOverTargetSeq(undefined)}
                            onDrop={handleDropToParent}
                        >
                            <BorderLayout cursor={"pointer"} className={styles.row}>
                                <div className={styles.primaryCell}>
                                    <div className={styles.iconWrap}>
                                        <DirIcon>..</DirIcon>
                                    </div>
                                    <div className={styles.fileName}>상위 폴더</div>
                                </div>
                                <div className={styles.metaCell}>이전 위치로 이동</div>
                            </BorderLayout>
                        </a>
                    ) : null}

                    {dirs.map((dir) => (
                        <a
                            className={`${styles.item} ${dragOverTargetSeq === dir.dirSeq ? styles.dropTarget : ""}`}
                            draggable
                            onDragStart={(event) => handleDirDragStart(event, dir)}
                            onDragOver={(event) => handleInternalDragOver(event, dir.dirSeq)}
                            onDragLeave={() => setDragOverTargetSeq(undefined)}
                            onDrop={(event) => handleDropToDir(event, dir.dirSeq)}
                            onClick={() => changeDir(dir)}
                            key={dir.dirSeq + dir.dirName}
                        >
                            <BorderLayout cursor={"pointer"} className={styles.row}>
                                <div className={styles.primaryCell}>
                                    <div className={styles.iconWrap}>
                                        <DirIcon/>
                                    </div>
                                    <div className={styles.fileName}>{dir.dirName}</div>
                                </div>
                                <div className={styles.metaCell}>폴더</div>
                                <ActionMenu items={getDirMenus(dir)}/>
                            </BorderLayout>
                        </a>
                    ))}

                    {files.map((file) => (
                        <a
                            className={`${styles.item}`}
                            draggable
                            onDragStart={(event) => handleFileDragStart(event, file)}
                            key={file.storageKey + file.fileSeq}
                        >
                            <BorderLayout cursor={"pointer"} className={styles.row}>
                                <div className={styles.primaryCell}>
                                    <div className={styles.iconWrap}>
                                        <FileIcon/>
                                    </div>
                                    <div className={styles.fileName}>{file.title}</div>
                                </div>
                                <div className={styles.metaCell}>{file.size}</div>
                                <ActionMenu items={getFileMenus(file)}/>
                            </BorderLayout>
                        </a>
                    ))}
                </div>
            </div>
        </div>
    )
}

export {FileViewer}
