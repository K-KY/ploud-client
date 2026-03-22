import {FileViewer} from "./FileViewer.tsx";
import {useState} from "react";
import type {DirectoryInfo} from "../types/DirectoryInfo.ts";
import {Button} from "./Button.tsx";
import {LinearLayout} from "./LinearLayout.tsx";
import {useNavigate} from "react-router-dom";
import {logout} from "../axios/UserApi.ts";
import {userAuthStore} from "../stores/token.store.ts";
import {LocationIndicator} from "./LocationIndicator.tsx";

export function Home() {
    const [currentDirStack, setCurrentDirStack] = useState<DirectoryInfo[]>([])
    const navigate = useNavigate();

    function fileUpload() {
        navigate("upload")
    }

    function handleLogout() {
        console.log("logout")
        logout()
        userAuthStore.getState().logout()
    }

    return (
        <>
            <LinearLayout>
                <Button onClick={fileUpload} content={"파일 업로드"}/>
                <Button onClick={handleLogout} content={"로그아웃"}/>
            </LinearLayout>
            <LocationIndicator currentDirStack={currentDirStack} />
            <FileViewer onDirChange={setCurrentDirStack}></FileViewer>
        </>
    )
}