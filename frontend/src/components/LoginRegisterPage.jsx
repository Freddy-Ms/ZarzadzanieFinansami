    import React, { useState } from "react";
    import { useNavigate } from "react-router-dom";
    import { toast, ToastContainer } from 'react-toastify';
    import 'react-toastify/dist/ReactToastify.css';

    export default function LoginRegisterPage() {
        // logowanie
        const [usernameOrEmail, setUsernameOrEmail] = useState("");
        const [password, setPassword] = useState("");
        const [errorMsg, setErrorMsg] = useState("");

        // rejestracja
        const [regUsername, setRegUsername] = useState("");
        const [regEmail, setRegEmail] = useState("");
        const [regPassword, setRegPassword] = useState("");
        const [registerMsg, setRegisterMsg] = useState("");

        const navigate = useNavigate();

        const handleLogin = async (e) => {
            e.preventDefault();
            setErrorMsg("");

            const payload = {
                password,
                [usernameOrEmail.includes("@") ? "email" : "username"]: usernameOrEmail,
            };

            try {
                const response = await fetch("http://127.0.0.1:5000/user/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include", // WAŻNE, żeby cookies się ustawiły
                    body: JSON.stringify(payload),
                });

                const data = await response.json();

                console.log("Kod odpowiedzi:", response.status);
                console.log("Treść message:", data.message);

                if (response.status !== 200) {
                    setErrorMsg(`${data.message}`);
                    toast.error("Błąd logowania: " + data.message, { autoClose: 3000 });
                } else {
                    setErrorMsg(`${data.message}`);
                    toast.success("Zalogowano!", { autoClose: 3000 });
                    navigate("/homepage");
                }
            } catch (error) {
                console.error("Błąd logowania:", error);
            }
        };

        const handleRegister = async (e) => {
            e.preventDefault();
            setRegisterMsg("");

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
                console.log("Kod odpowiedzi:", response.status);
                console.log("Treść message:", data.message);

                if (response.status !== 201) {
                    setRegisterMsg(`${data.message}`);
                    toast.error("Błąd rejestracji: " + data.message, { autoClose: 3000 });
                } else {
                    setRegisterMsg(`${data.message}`);
                    toast.success("Zarejestrowano! Zaloguj się teraz.", { autoClose: 3000 });
                }
            } catch (error) {
                console.error("Błąd logowania:", error);
            }
        };

        return (
        <div style={styles.page}>
            <ToastContainer position="top-center" autoClose={3000} />
            <div style={styles.container}>
                <div style={styles.panel}>
                    <h2 style={styles.title}>Zaloguj się</h2>
                    <form onSubmit={handleLogin} style={styles.form}>
                        <input
                            type="text"
                            placeholder="Nazwa użytkownika lub email"
                            value={usernameOrEmail}
                            onChange={(e) => setUsernameOrEmail(e.target.value)}
                            style={styles.input}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Hasło"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                            required
                        />
                        <button type="submit" style={styles.button}>
                            Zaloguj się
                        </button>
                        {errorMsg && <p style={styles.error}>{errorMsg}</p>}
                    </form>
                </div>
                <div style={{ ...styles.panel, backgroundColor: "#f0f8ff" }}>
                    <h2 style={styles.title}>Zarejestruj się</h2>
                    <form onSubmit={handleRegister} style={styles.form}>
                        <input
                            type="text"
                            placeholder="Nazwa użytkownika"
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
                            placeholder="Hasło"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            style={styles.input}
                            required
                        />
                        <button type="submit" style={styles.button}>
                            Zarejestruj się
                        </button>
                        {registerMsg && <p style={styles.error}>{registerMsg}</p>}
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
        background: "linear-gradient(135deg, #e0f7fa, #fce4ec)",
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