import LoginPage from "./components/LoginPage.tsx";
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {Home} from "./components/Home.tsx";

function App() {

    return (
        <>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/" element={<Home/>}></Route>
                </Routes>
            </BrowserRouter>
        </>
    )
}

export default App
