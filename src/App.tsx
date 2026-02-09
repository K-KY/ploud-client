import FileUploader from "./components/FileUploader.tsx";
import {FileViewer} from "./components/FileViewer.tsx";
import {useState} from "react";
import type {DirectoryInfo} from "./types/DirectoryInfo.ts";

function App() {

    const [currentDirStack, setCurrentDirStack] = useState<DirectoryInfo[]>([])
    return (
        <>
            <div>
                <h3>{currentDirStack.map((c)=> {
                    return (<div>{c.dirName}</div>)
                })}</h3>
            </div>
            <FileUploader></FileUploader>
            <FileViewer currentDirStack={currentDirStack} onDirChange={setCurrentDirStack}></FileViewer>
        </>
    )
}

export default App
