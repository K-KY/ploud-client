import React, {useEffect, useState} from "react";
import {getDirs, getFiles, getParentDir, getDownloadUrl} from "../axios/StorageApi.ts";
import {BorderLayout} from "./BoarderLayout.tsx";
import type {FileInfo} from "../types/FileInfo.ts";
import type {DirectoryInfo} from "../types/DirectoryInfo.ts";
import styles from "../styles/FileViewer.module.css"
import {DirIcon} from "./DirIcon.tsx";
import {FileIcon} from "./FileIcon.tsx";
import {ActionMenu, type ActionMenuItem} from "./ActionMenu.tsx";

interface FileViewerProps {
    onDirChange: React.Dispatch<React.SetStateAction<DirectoryInfo[]>>;
}

const FileViewer: React.FC<FileViewerProps> = ({onDirChange}) => {
    const [files, setFiles] = useState<FileInfo[]>([]);
    const [dirs, setDirs] = useState<DirectoryInfo[]>([]);
    //undefined인 경우 사용자의 루트 디렉토리 조회
    const [currentDirSeq, setCurrentDirSeq] = useState<number>();

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

    //디렉토리 눌렀을 때
    function changeDir(dir: DirectoryInfo) {
        setCurrentDirSeq(dir.dirSeq)
        onDirChange(prev => [...prev, dir]);
    }

    //.. 폴더 눌렀을 때
    function gotoParent() {
        getParentDir({
            parentSeq: currentDirSeq,
        }).then(res => {
            setCurrentDirSeq(res.parentSeq)
        })
        onDirChange(prev => prev.slice(0, -1));
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

    function downloadDir(file: DirectoryInfo) {
        console.log("download file", file);
    }

    function renameDir(file: DirectoryInfo) {
        console.log("rename file", file);
    }

    function deleteDir(file: DirectoryInfo) {
        console.log("delete file", file);
    }

    return (
        <div className={`${styles.fileListContainer}`}>
            <div className={`${styles.fileList}`}>
                {currentDirSeq !== null ? (
                    <a className={`${styles.item}`} onClick={() => gotoParent()}>
                        <BorderLayout cursor={"pointer"}>
                            <div>
                                <DirIcon>..</DirIcon>
                            </div>
                        </BorderLayout>
                    </a>
                ) : null}

                {dirs.map((dir) => (
                    <a className={`${styles.item}`} onClick={() => changeDir(dir)} key={dir.dirSeq + dir.dirName}>
                        <BorderLayout cursor={"pointer"}>
                            <DirIcon/>
                            {dir.dirName}
                            <ActionMenu items={getDirMenus(dir)}/>

                        </BorderLayout>
                    </a>
                ))}

                {files.map((file) => (
                    <a className={`${styles.item}`} key={file.storageKey}>
                        <BorderLayout cursor={"pointer"}>
                            <FileIcon/>
                            <div>
                                {file.title} -- {file.size}
                            </div>
                            <ActionMenu items={getFileMenus(file)}/>

                        </BorderLayout>
                    </a>
                ))}


            </div>
        </div>
    )
}


export {FileViewer}