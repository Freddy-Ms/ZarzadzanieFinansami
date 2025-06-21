import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [username, setName] = useState("");
    const [email, setEmail] = useState("");
    const [household, setHousehold] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch("http://127.0.0.1:5000/user/get", {
                    method: "GET",
                    credentials: "include",
                });

                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.message || "Błąd pobierania danych");
                }

                setUser(data);
                setName(data.username);
                setEmail(data.email);
                setHousehold(data.household || "");
            } catch (err) {
                setError(err.message);
            }
        };

        fetchUser();
    }, []);

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setName(user.username);
        setEmail(user.email);
        setHousehold(user.household || "");
        setIsEditing(false);
    };

    const handleSave = async () => {
        try {
            const response = await fetch("http://127.0.0.1:5000/user/edit", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: username,
                    email: email,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Błąd podczas zapisu danych");
            }

            alert(data.message || "Profil zaktualizowany pomyślnie");

            setUser((prev) => ({ ...prev, username: username, email: email }));
            setIsEditing(false);
        } catch (err) {
            alert("Błąd: " + err.message);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Czy na pewno chcesz usunąć konto?")) return;

        try {
            const response = await fetch("http://localhost:5000/user/delete", {
                method: "POST",
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Błąd podczas usuwania konta");
            }

            alert(data.message || "Konto usunięte pomyślnie");

            navigate("/");
        } catch (err) {
            alert("Błąd: " + err.message);
        }
    };

    const handleJoinHousehold = () => alert("Dołącz do householda");

    // Obsługa przycisków householda
    const handleAdd = () => alert("Dodaj do householda");
    const handleEditHousehold = () => alert("Edytuj household");
    const handleRemove = () => alert("Usuń z householda");
    const handleGenerateInvite = () => alert("Wygeneruj zaproszenie");
    const handleLeave = () => alert("Opuść household");
    const handleKick = () => alert("Wyrzuć kogoś z householda");

    return (
        <div style={styles.pageWrapper}>
            <div style={styles.container}>
                <div style={styles.panel}>
                    <button
                        style={styles.backButton}
                        onClick={() => navigate("/homepage")}
                    >
                        ← Wróć
                    </button>

                    <h2 style={styles.title}>Profil użytkownika</h2>

                    {error && <p style={{ color: "red" }}>{error}</p>}

                    {user ? (
                        <div style={styles.infoBox}>
                            {isEditing ? (
                                <>
                                    <label>
                                        Nazwa:
                                        <br />
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) =>
                                                setName(e.target.value)
                                            }
                                            style={styles.input}
                                        />
                                    </label>
                                    <br />
                                    <label>
                                        Email:
                                        <br />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                            style={styles.input}
                                        />
                                    </label>
                                    <br />
                                    <p>
                                        <strong>Household:</strong>{" "}
                                        {household ||
                                            "Brak przypisanego householda"}
                                    </p>
                                    <br />
                                    <button
                                        style={styles.saveButton}
                                        onClick={handleSave}
                                    >
                                        Zapisz
                                    </button>
                                    <button
                                        style={styles.cancelButton}
                                        onClick={handleCancel}
                                    >
                                        Anuluj
                                    </button>
                                </>
                            ) : (
                                <>
                                    <p>
                                        <strong>Nazwa:</strong> {user.username}
                                    </p>
                                    <p>
                                        <strong>Email:</strong> {user.email}
                                    </p>
                                    <p>
                                        <strong>Household:</strong>{" "}
                                        {user.household ||
                                            "Brak przypisanego householda"}
                                    </p>
                                </>
                            )}
                        </div>
                    ) : (
                        !error && <p>Ładowanie danych...</p>
                    )}

                    <div style={styles.buttonsRow}>
                        <button
                            style={{ ...styles.button, ...styles.editButton }}
                            onClick={handleEditClick}
                        >
                            Edytuj konto
                        </button>
                        <button
                            style={{ ...styles.button, ...styles.deleteButton }}
                            onClick={handleDelete}
                        >
                            Usuń konto
                        </button>
                    </div>
                </div>

                {/* Panel Household */}
                <div style={styles.panel}>
                    <h2 style={styles.title}>Household</h2>

                    <div style={styles.householdButtons}>
                        <button
                            style={styles.householdButton}
                            onClick={handleAdd}
                        >
                            Dodaj
                        </button>
                        <button
                            style={styles.householdButton}
                            onClick={handleEditHousehold}
                        >
                            Edytuj
                        </button>
                        <button
                            style={styles.householdButton}
                            onClick={handleRemove}
                        >
                            Usuń
                        </button>
                        <button
                            style={styles.householdButton}
                            onClick={handleGenerateInvite}
                        >
                            Wygeneruj zaproszenie
                        </button>
                        <button
                            style={styles.householdButton}
                            onClick={handleLeave}
                        >
                            Opuść
                        </button>
                        <button
                            style={styles.householdButton}
                            onClick={handleKick}
                        >
                            Wywal kogoś
                        </button>
                        <button
                            style={styles.householdButton}
                            onClick={handleJoinHousehold}
                        >
                            Dołącz
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    pageWrapper: {
        height: "100vh",
        backgroundColor: "#3b82f6",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100vw",
    },
    container: {
        display: "flex",
        gap: 40,
    },
    panel: {
        backgroundColor: "#f9fafb",
        padding: 20,
        borderRadius: 8,
        width: 360,
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    },
    backButton: {
        background: "none",
        border: "none",
        color: "#3b82f6",
        fontSize: 16,
        cursor: "pointer",
        marginBottom: 20,
    },
    title: {
        textAlign: "center",
        color: "#111827",
        marginBottom: 20,
    },
    infoBox: {
        backgroundColor: "#ffffff",
        padding: 20,
        borderRadius: 8,
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        marginBottom: 30,
        color: "#111827",
    },
    input: {
        width: "100%",
        padding: 8,
        fontSize: 16,
        marginTop: 4,
        marginBottom: 12,
        borderRadius: 4,
        border: "1px solid #ccc",
    },
    editButton: {
        backgroundColor: "#3b82f6",
        border: "none",
        color: "white",
        padding: "10px 16px",
        borderRadius: 4,
        cursor: "pointer",
    },
    saveButton: {
        backgroundColor: "#10b981",
        border: "none",
        color: "white",
        padding: "10px 16px",
        borderRadius: 4,
        cursor: "pointer",
        marginRight: 10,
    },
    cancelButton: {
        backgroundColor: "#ef4444",
        border: "none",
        color: "white",
        padding: "10px 16px",
        borderRadius: 4,
        cursor: "pointer",
    },
};

export default ProfilePage;
