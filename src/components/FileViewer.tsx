import {useEffect, useState} from "react";
import {getDirs, getFiles, getParentDir} from "../axios/StorageApi.ts";
import {BorderLayout} from "./BoarderLayout.tsx";
import type {FileInfo} from "../types/FileInfo.ts";
import type {DirectoryInfo} from "../types/DirectoryInfo.ts";

const FileViewer = () => {
    const [files, setFiles] = useState<FileInfo[]>([]);
    const [dirs, setDirs] = useState<DirectoryInfo[]>([]);
    //undefined인 경우 사용자의 루트 디렉토리 조회
    const [currentDirSeq, setCurrentDirSeq] = useState<number>(2);

    useEffect(() => {
        console.log("use")
        getDirs({
            ownerId: "김규영",
            parentSeq: currentDirSeq,
        }).then(res => setDirs(res));

        getFiles({
            ownerId: "김규영",
            parentSeq: currentDirSeq,
        }).then(res => {
            setFiles(res)
        });
    }, [currentDirSeq])

    //디렉토리 눌렀을 때
    function changeDir(dir: DirectoryInfo) {
        setCurrentDirSeq(dir.dirSeq)
    }

    //.. 폴더 눌렀을 때
    function gotoParent() {
        console.log(currentDirSeq);
        getParentDir({
            ownerId: "김규영",
            parentSeq: currentDirSeq,
        }).then(res => {
            console.log(res.dirSeq);
            setCurrentDirSeq(res.parentSeq)
        })
    }

    return (
        <div className="file-list">
            {currentDirSeq !== null ? (
                <a onClick={() => gotoParent()}>
                    <BorderLayout>
                        ..
                    </BorderLayout>
                </a>
            ) : null}
            {dirs.map((dir) => (
                <a onClick={() => changeDir(dir)} key={dir.dirSeq + dir.dirName}>
                    <BorderLayout key={dir.dirName + dir.dirSeq}>
                        {dir.dirName}--directory
                    </BorderLayout>
                </a>
            ))}
            {files.map((file) => (
                <BorderLayout key={file.storageKey}>
                    {file.title}--file
                </BorderLayout>
            ))}
        </div>
    )
}


export {FileViewer}