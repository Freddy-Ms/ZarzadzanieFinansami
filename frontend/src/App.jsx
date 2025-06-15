import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StartPage from "./components/StartPage";
import LoginRegisterPage from "./components/LoginRegisterPage";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<StartPage />} />
                <Route path="/login_register" element={<LoginRegisterPage />} />
            </Routes>
        </Router>
    );
}

export default App;
