import {useEffect, useState} from "react";
import {getDirs, getFiles, getParentDir} from "../axios/StorageApi.ts";
import {BorderLayout} from "./BoarderLayout.tsx";
import type {FileInfo} from "../types/FileInfo.ts";
import type {DirectoryInfo} from "../types/DirectoryInfo.ts";
import styles from "../styles/FileViewer.module.css"
import {DirIcon} from "./DirIcon.tsx";
import {FileIcon} from "./FileIcon.tsx";

interface FileViewerProps {
    currentDirStack:DirectoryInfo[];
    onDirChange: React.Dispatch<React.SetStateAction<DirectoryInfo[]>>;
}

const FileViewer:React.FC<FileViewerProps> = ({currentDirStack, onDirChange}) => {
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
        onDirChange(prev =>prev.slice(0, -1));
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
                        </BorderLayout>
                    </a>
                ))}


            </div>
        </div>
    )
}


export {FileViewer}