import FileUploader from "./FileUploader.tsx";
import {FileViewer} from "./FileViewer.tsx";
import {useState} from "react";
import type {DirectoryInfo} from "../types/DirectoryInfo.ts";

export function Home() {
    const [currentDirStack, setCurrentDirStack] = useState<DirectoryInfo[]>([])
    return (
        <>
            <FileUploader></FileUploader>
            <FileViewer currentDirStack={currentDirStack} onDirChange={setCurrentDirStack}></FileViewer>
        </>
    )
}