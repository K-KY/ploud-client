import {useEffect, useState} from "react";
import {getDirs, getFiles} from "../axios/StorageApi.ts";
import {BorderLayout} from "./BoarderLayout.tsx";
import type {FileInfo} from "../types/FileInfo.ts";
import type {DirectoryInfo} from "../types/DirectoryInfo.ts";

const FileViewer = () => {
    const [files, setFiles] = useState<FileInfo[]>([]);
    const [dirs, setDirs] = useState<DirectoryInfo[]>([]);
    //undefined인 경우 사용자의 루트 디렉토리 조회
    const [currentParentSeq, setCurrentParentSeq] = useState<number>(2);

    useEffect(() => {
        getDirs({
            ownerId: "김규영",
            parentSeq: currentParentSeq,
        }).then(res => setDirs(res));

        getFiles({
            ownerId: "김규영",
            parentSeq: currentParentSeq,
        }).then(res => {
            setFiles(res)
        });
    }, [currentParentSeq])


    return (
        <div className="file-list">
            {dirs.map((dir) => (
                <BorderLayout key={dir.dirName + dir.dirSeq}>
                    {dir.dirName}--directory
                </BorderLayout>
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