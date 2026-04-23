import {FileViewer} from "./FileViewer.tsx";
import type {DirectoryInfo} from "../types/DirectoryInfo.ts";
import {Button} from "./Button.tsx";
import {LinearLayout} from "./LinearLayout.tsx";
import {useNavigate, useSearchParams} from "react-router-dom";
import {logout} from "../axios/UserApi.ts";
import {userAuthStore} from "../stores/token.store.ts";
import {LocationIndicator} from "./LocationIndicator.tsx";
import styles from "../styles/Home.module.css";

function parseDirectoryStack(searchParams: URLSearchParams): DirectoryInfo[] {
    const pathParam = searchParams.get("path");

    if (!pathParam) {
        return [];
    }

    try {
        const parsed = JSON.parse(pathParam);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("failed to parse directory path", error);
        return [];
    }
}

export function Home() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const currentDirStack = parseDirectoryStack(searchParams);
    const dirSeqParam = searchParams.get("dirSeq");
    const currentDirSeq = dirSeqParam ? Number(dirSeqParam) : undefined;

    function fileUpload() {
        navigate("upload")
    }

    function handleLogout() {
        console.log("logout")
        logout()
        userAuthStore.getState().logout()
    }

    return (
        <div className={styles.page}>
            <div className={styles.shell}>
                {/*헤더*/}
                <div className={styles.hero}>
                    <div>
                        <p className={styles.eyebrow}>PLOUD</p>
                    </div>
                    <LinearLayout className={styles.toolbar} justify={"end"} gap={"0.75rem"}>
                        <Button onClick={fileUpload} content={"파일 업로드"}/>
                        <Button onClick={handleLogout} content={"로그아웃"}/>
                    </LinearLayout>
                </div>

                <LocationIndicator currentDirStack={currentDirStack} />
                <FileViewer
                    currentDirSeq={Number.isNaN(currentDirSeq) ? undefined : currentDirSeq}
                    currentDirStack={currentDirStack}
                />
            </div>
        </div>
    )
}
