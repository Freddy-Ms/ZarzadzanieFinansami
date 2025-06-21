import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StartPage from "./components/StartPage";
import LoginRegisterPage from "./components/LoginRegisterPage";
import HomePage from "./components/HomePage";
import ProfilePage from "./components/ProfilePage";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<StartPage />} />
                <Route path="/login_register" element={<LoginRegisterPage />} />
                <Route path="/homepage" element={<HomePage/>} />
                <Route path="/profile" element={<ProfilePage />} />
            </Routes>
        </Router>
    );
}

export default App;
