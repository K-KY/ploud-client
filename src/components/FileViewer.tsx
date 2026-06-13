import React, {useEffect, useState} from "react";
import {
    getDirs,
    getFiles,
    getDirHierarchy,
    getDownloadUrl,
    getDirDownloadUrl,
    deleteDirs
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

const ROOT_DIR_SEQ = 0;

const FileViewer: React.FC = () => {
    const [dirs, setDirs] = useState<DirectoryInfo[]>([]);
    const [files, setFiles] = useState<FileInfo[]>([]);
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

    useEffect(() => {
        async function load() {
            const [dirRes, fileRes, hierarchyRes] = await Promise.all([
                getDirs(currentDirSeq),
                getFiles({
                    dirSeq: currentDirSeq,
                }),
                currentDirSeq === ROOT_DIR_SEQ ? Promise.resolve(null) : getDirHierarchy(currentDirSeq),
            ]);

            setDirs(dirRes.dirs);
            registerChildren(currentDirSeq === ROOT_DIR_SEQ ? null : currentDirSeq, dirRes.dirs);

            if (hierarchyRes) {
                //경로 등록
                hydrateHierarchy(hierarchyRes);
            } else {
                //만약 없으면 루트
                clearCurrent();
            }

            setFiles(fileRes);
        }

        load();
    }, [
        currentDirSeq,
        clearCurrent,
        hydrateHierarchy,
        registerChildren,
    ]);

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
        <div className={`${styles.fileListContainer}`}>
            <div className={styles.viewerShell}>
                <div className={styles.viewerHeader}>
                    <div className={styles.headerName}>이름</div>
                    <div className={styles.headerMeta}>정보</div>
                </div>
                <div className={`${styles.fileList}`}>
                    {currentDirSeq !== ROOT_DIR_SEQ ? (
                        <a className={`${styles.item}`} onClick={() => gotoParent()}>
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
                        <a className={`${styles.item}`} onClick={() => changeDir(dir)} key={dir.dirSeq + dir.dirName}>
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
                        <a className={`${styles.item}`} key={file.storageKey + file.fileSeq}>
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
