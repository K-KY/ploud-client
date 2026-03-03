import LoginPage from "./components/LoginPage.tsx";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {Home} from "./components/Home.tsx";
import {Private} from "./components/Private.tsx";

function App() {

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
                </Routes>
            </BrowserRouter>
        </>
    )
}

export default App
