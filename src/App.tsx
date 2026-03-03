import LoginPage from "./components/LoginPage.tsx";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {Home} from "./components/Home.tsx";
import {Private} from "./components/Private.tsx";
import {useEffect, useState} from "react";
import {logout, refresh} from "./axios/UserApi.ts";
import {userAuthStore} from "./stores/token.store.ts";

function App() {
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        const initAuth = async () => {
            await refresh();
            setLoading(false);
        };

        initAuth();
    }, []);

    function handleLogout() {
        console.log("logout")
        logout()
        userAuthStore.getState().logout()
    }
    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <button onClick={() => handleLogout()}>logout</button>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/" element={
                        <Private>
                            <Home/>
                        </Private>
                    }></Route>
                </Routes>
            </BrowserRouter>
        </>
    )
}

export default App
