import React, {useEffect, useState} from "react";
import {getDirs, getFiles, getParentDir, getDownloadUrl, getDirDownloadUrl} from "../axios/StorageApi.ts";
import {BorderLayout} from "./BoarderLayout.tsx";
import type {FileInfo} from "../types/FileInfo.ts";
import type {DirectoryInfo} from "../types/DirectoryInfo.ts";
import styles from "../styles/FileViewer.module.css"
import {DirIcon} from "./DirIcon.tsx";
import {FileIcon} from "./FileIcon.tsx";
import {ActionMenu, type ActionMenuItem} from "./ActionMenu.tsx";
import {useNavigate} from "react-router-dom";

interface FileViewerProps {
    currentDirSeq?: number;
    currentDirStack: DirectoryInfo[];
}

const FileViewer: React.FC<FileViewerProps> = ({currentDirSeq, currentDirStack}) => {
    const [files, setFiles] = useState<FileInfo[]>([]);
    const [dirs, setDirs] = useState<DirectoryInfo[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        getDirs({
            parentSeq: currentDirSeq,
        }).then(res => {
            setDirs(res)
        });

        getFiles({
            parentSeq: currentDirSeq,
        }).then(res => {
            setFiles(res)
        });
    }, [currentDirSeq])

    function moveToDir(dirSeq: number | undefined, dirStack: DirectoryInfo[]) {
        const nextSearchParams = new URLSearchParams();

        if (dirSeq !== undefined) {
            nextSearchParams.set("dirSeq", String(dirSeq));
        }

        if (dirStack.length > 0) {
            nextSearchParams.set("path", JSON.stringify(dirStack));
        }

        const nextSearch = nextSearchParams.toString();
        navigate(nextSearch ? `/?${nextSearch}` : "/", {replace: false});
    }

    //디렉토리 눌렀을 때
    function changeDir(dir: DirectoryInfo) {
        moveToDir(dir.dirSeq, [...currentDirStack, dir]);
    }

    //.. 폴더 눌렀을 때
    function gotoParent() {
        getParentDir({
            parentSeq: currentDirSeq,
        }).then(res => {
            moveToDir(res.parentSeq, currentDirStack.slice(0, -1));
        })
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

    function deleteDir(dir: DirectoryInfo) {
        console.log("delete file", dir);
    }

    return (
        <div className={`${styles.fileListContainer}`}>
            <div className={styles.viewerShell}>
                <div className={styles.viewerHeader}>
                    <div className={styles.headerName}>이름</div>
                    <div className={styles.headerMeta}>정보</div>
                </div>
                <div className={`${styles.fileList}`}>
                    {currentDirSeq !== undefined ? (
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
                        <a className={`${styles.item}`} key={file.storageKey}>
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
