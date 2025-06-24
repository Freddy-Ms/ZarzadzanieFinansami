import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import StartPage from "./components/StartPage";
import LoginRegisterPage from "./components/LoginRegisterPage";
import HomePage from "./components/HomePage";
import ProfilePage from "./components/ProfilePage";
import HouseholdPage from "./components/HouseholdPage";
import PurchaseEventPage from "./components/PurchaseEventPage";
import { AuthProvider } from "./protection/AuthProvider";
import ProtectedRoute from "./protection/ProtectedRoute";

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<StartPage />} />
                    <Route path="/login_register" element={<LoginRegisterPage />} />
                    <Route
                        path="/homepage"
                        element={
                            <ProtectedRoute>
                                <HomePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <ProfilePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/household"
                        element={
                            <ProtectedRoute>
                                <HouseholdPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/purchaseEvent"
                        element={
                            <ProtectedRoute>
                                <PurchaseEventPage />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
