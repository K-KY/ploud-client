import React, {useEffect, useState} from "react";
import {getDirs, getFiles, getParentDir, getDownloadUrl, getDirDownloadUrl, deleteDirs} from "../axios/StorageApi.ts";
import {BorderLayout} from "./BoarderLayout.tsx";
import type {FileInfo} from "../types/FileInfo.ts";
import type {DirectoryInfo} from "../types/DirectoryInfo.ts";
import styles from "../styles/FileViewer.module.css"
import {DirIcon} from "./DirIcon.tsx";
import {FileIcon} from "./FileIcon.tsx";
import {ActionMenu, type ActionMenuItem} from "./ActionMenu.tsx";
import {useNavigate, useParams} from "react-router-dom";

interface FileViewerProps {
    onDirChange: React.Dispatch<React.SetStateAction<DirectoryInfo[]>>;
}

const ROOT_DIR_SEQ = 0;
const ROOT_PATH_TOKEN = "0";

const FileViewer: React.FC<FileViewerProps> = ({onDirChange}) => {
    const [files, setFiles] = useState<FileInfo[]>([]);
    const [dirs, setDirs] = useState<DirectoryInfo[]>([]);
    const [path, setPath] = useState<string>(ROOT_PATH_TOKEN);
    const navigate = useNavigate();
    const params = useParams<{ dir?: string; path?: string }>();
    const currentDirSeq = params.dir ? Number(params.dir) : ROOT_DIR_SEQ;
    const currentPath = params.path ?? ROOT_PATH_TOKEN;

    useEffect(() => {
        getDirs(currentDirSeq, currentPath).then(res => {
            setDirs(res.dirs)
            setPath(res.path)
        });

        getFiles({
            dirSeq: currentDirSeq,
        }).then(res => {
            setFiles(res)
        });
    }, [currentDirSeq, currentPath])

    function moveToDir(dirSeq: number) {
        navigate(`/${dirSeq}/${encodeURIComponent(path)}`, {replace: false});
    }

    //디렉토리 눌렀을 때
    function changeDir(dir: DirectoryInfo) {
        onDirChange(prev => [...prev, dir]);
        moveToDir(dir.dirSeq);
    }

    //.. 폴더 눌렀을 때
    function gotoParent() {
        getParentDir({
            dirSeq: currentDirSeq,
        }).then(res => {
            onDirChange(prev => prev.slice(0, -1));

            if (res.parentSeq === undefined || res.parentSeq === null || res.parentSeq === ROOT_DIR_SEQ) {
                navigate("/", {replace: false});
                return;
            }

            navigate(`/${res.parentSeq}/${encodeURIComponent(path)}`, {replace: false});
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

    async function deleteDir(dir: DirectoryInfo) {
        await deleteDirs({ dirSeq: dir.dirSeq });

        const [dirsRes, filesRes] = await Promise.all([
            getDirs(currentDirSeq, currentPath),
            getFiles({ dirSeq: currentDirSeq }),
        ]);

        setDirs(dirsRes.dirs);
        setPath(dirsRes.path);
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
