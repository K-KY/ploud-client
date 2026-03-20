import LoginPage from "./components/LoginPage.tsx";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {Home} from "./components/Home.tsx";
import {Private} from "./components/Private.tsx";
import {useEffect} from "react";
import {refresh} from "./axios/UserApi.ts";
import FileUploader from "./components/FileUploader.tsx";
import Signup from "./components/Signup.tsx";

function App() {
    useEffect(() => {
        const initAuth = async () => {
            await refresh();
        };

        initAuth();
    }, []);


    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/" element={
                        <Private>
                            <Home/>
                        </Private>
                    }></Route>

                    <Route path={"upload"} element={
                        <Private>
                            <FileUploader/>
                        </Private>
                    }>
                    </Route>

                    <Route path={"signup"} element={
                        <Signup></Signup>
                    }>

                    </Route>
                </Routes>
            </BrowserRouter>
        </>
    )
}

export default App
