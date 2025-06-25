import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../protection/AuthProvider";

export default function LoginRegisterPage() {
    const [usernameOrEmail, setUsernameOrEmail] = useState("");
    const [password, setPassword] = useState("");

    const [regUsername, setRegUsername] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");

    const navigate = useNavigate();
    const { setIsAuthenticated } = useContext(AuthContext);

    const handleLogin = async (e) => {
        e.preventDefault();

        const payload = {
            password,
            [usernameOrEmail.includes("@") ? "email" : "username"]:
                usernameOrEmail,
        };

        try {
            const response = await fetch("http://127.0.0.1:5000/user/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.status !== 200) {
                toast.error("Login error: " + data.message, {
                    autoClose: 3000,
                });
            } else {
                setIsAuthenticated(true);
                navigate("/homepage");
            }
        } catch (error) {
            toast.error("Log in error:" + error.message);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        const payload = {
            username: regUsername,
            email: regEmail,
            password: regPassword,
        };

        try {
            const response = await fetch(
                "http://127.0.0.1:5000/user/register",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(payload),
                }
            );

            const data = await response.json();

            if (response.status !== 201) {
                toast.error("Registration error: " + data.message, {
                    autoClose: 3000,
                });
            } else {
                toast.success("Registered! Please log in now.", {
                    autoClose: 3000,
                });
            }
        } catch (error) {
            toast.error("Registration error:" + error.message);
        }
    };

    return (
        <div style={styles.page}>
            <ToastContainer position="top-center" autoClose={3000} />
            <div style={styles.container}>
                <div style={styles.panel}>
                    <h2 style={styles.title}>Log In</h2>
                    <form onSubmit={handleLogin} style={styles.form}>
                        <input
                            type="text"
                            placeholder="Username or email"
                            value={usernameOrEmail}
                            onChange={(e) => setUsernameOrEmail(e.target.value)}
                            style={styles.input}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            required
                        />
                        <button type="submit" style={styles.button}>
                            Log In
                        </button>
                    </form>
                </div>
                <div style={{ ...styles.panel, backgroundColor: "#f0f8ff" }}>
                    <h2 style={styles.title}>Register</h2>
                    <form onSubmit={handleRegister} style={styles.form}>
                        <input
                            type="text"
                            placeholder="Username"
                            value={regUsername}
                            onChange={(e) => setRegUsername(e.target.value)}
                            style={styles.input}
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            style={styles.input}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            style={styles.input}
                            required
                        />
                        <button type="submit" style={styles.button}>
                            Register
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

const styles = {
    page: {
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg,rgb(109, 202, 252),rgb(138, 157, 255))",
        fontFamily: "'Segoe UI', sans-serif",
    },
    container: {
        display: "flex",
        flexWrap: "wrap",
        maxWidth: "900px",
        width: "100%",
        borderRadius: "12px",
        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
        overflow: "hidden",
    },
    panel: {
        flex: "1",
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        backgroundColor: "#ffffff",
        minWidth: "300px",
    },
    form: {
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        marginTop: "20px",
    },
    input: {
        padding: "12px 15px",
        fontSize: "16px",
        border: "1px solid #ccc",
        borderRadius: "8px",
        outline: "none",
        transition: "border 0.3s ease",
    },
    button: {
        padding: "12px",
        fontSize: "16px",
        backgroundColor: "#0077cc",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "background 0.3s ease",
    },
    error: {
        color: "red",
        marginTop: "10px",
    },
    title: {
        marginBottom: "10px",
        fontSize: "24px",
        fontWeight: "bold",
        color: "#333",
    },
};
