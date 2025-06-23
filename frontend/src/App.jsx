import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StartPage from "./components/StartPage";
import LoginRegisterPage from "./components/LoginRegisterPage";
import HomePage from "./components/HomePage";
import ProfilePage from "./components/ProfilePage";
import HouseholdPage from "./components/HouseholdPage";
import PurchaseEventPage from "./components/PurchaseEventPage";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<StartPage />} />
                <Route path="/login_register" element={<LoginRegisterPage />} />
                <Route path="/homepage" element={<HomePage/>} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/household" element={<HouseholdPage />} />
                <Route path="/purchaseEvent" element={<PurchaseEventPage />} />
            </Routes>
        </Router>
    );
}

export default App;
