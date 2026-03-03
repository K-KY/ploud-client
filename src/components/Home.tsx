import FileUploader from "./FileUploader.tsx";
import {FileViewer} from "./FileViewer.tsx";
import {useState} from "react";
import type {DirectoryInfo} from "../types/DirectoryInfo.ts";
import {userAuthStore} from "../stores/token.store.ts";
import {Navigate} from "react-router-dom";

export function Home() {
    const [currentDirStack, setCurrentDirStack] = useState<DirectoryInfo[]>([])
    if(!userAuthStore.getState().accessToken) {
        return <Navigate to="/login" replace />;
    }


    return (
        <>
            <FileUploader></FileUploader>
            <FileViewer currentDirStack={currentDirStack} onDirChange={setCurrentDirStack}></FileViewer>
        </>
    )
}