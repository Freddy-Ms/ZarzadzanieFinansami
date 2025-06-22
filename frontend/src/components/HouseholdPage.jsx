import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const HouseholdPage = () => {
    const navigate = useNavigate();
    const [household, setHousehold] = useState([]);
    const [error, setError] = useState(null);
    const [username, setUsername] = useState(null);

    const fetchUserHouseholds = async () => {
        try {
            const response = await fetch(
                "http://127.0.0.1:5000/household/get",
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Błąd pobierania householdów");
            }

            setHousehold(data);
            setError(null);
        } catch (err) {
            console.error("Błąd:", err.message);
            setError(err.message);
        }
    };

    const fetchUsername = async () => {
        try {
            const response = await fetch("http://127.0.0.1:5000/user/get", {
                method: "GET",
                credentials: "include",
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error downloading data");
            }

            const userData = await response.json();
            return userData.username;
        } catch (err) {
            console.error("Failed to fetch username:", err.message);
            return null;
        }
    };

    const handleAdd = async () => {
        const name = window.prompt("Podaj nazwę nowego householda:");

        if (!name) {
            alert("Nazwa householda nie może być pusta.");
            return;
        }

        try {
            const response = await fetch(
                "http://127.0.0.1:5000/household/create",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify({ name }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Nie udało się utworzyć householda"
                );
            }

            alert(data.message || "Household utworzony pomyślnie");
            fetchUserHouseholds();
        } catch (err) {
            alert("Błąd: " + err.message);
        }
    };

    const handleInvite = (id) => {
        alert(`Wygeneruj zaproszenie dla householda ID ${id}`);
    };

    const handleKick = (id) => {
        alert(`Usuń członka z householda ID ${id}`);
    };

    const handleDeleteHousehold = (id) => {
        alert(`Usuń household ID ${id}`);
    };

    const handleLeave = (id) => {
        alert(`Opuść household ID ${id}`);
    };

    useEffect(() => {
        const fetchData = async () => {
            const user = await fetchUsername();
            if (user) {
                setUsername(user);
                await fetchUserHouseholds();
            }
        };
        fetchData();
    }, []);

    const myHouseholds = household.filter((h) => h.owner_username === username);

    const otherHouseholds = household.filter(
        (h) => h.owner_username !== username
    );

    return (
        <div style={styles.pageWrapper}>
            <div style={styles.outerContainer}>
                <button
                    style={styles.backButton}
                    onClick={() => navigate("/homepage")}
                    onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor =
                            styles.hoverEffects.backButtonHover.backgroundColor)
                    }
                    onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor =
                            styles.backButton.backgroundColor)
                    }
                >
                    ← Wróć
                </button>

                <div style={styles.twoColumnRow}>
                    <div style={styles.panel}>
                        <h2 style={styles.title}>Twoje householdy</h2>
                        {myHouseholds.length > 0 ? (
                            myHouseholds.map((h, index) => (
                                <div key={index} style={styles.householdCard}>
                                    <p>
                                        <strong>Nazwa:</strong> {h.name}
                                    </p>
                                    <p>
                                        <strong>Właściciel:</strong>{" "}
                                        {h.owner_username}
                                    </p>
                                    <p>
                                        <strong>Członkowie:</strong>{" "}
                                        {h.members.length > 0
                                            ? h.members.join(", ")
                                            : "Brak innych członków"}
                                    </p>

                                    <div style={styles.buttonRow}>
                                        <button
                                            style={styles.primaryButton}
                                            onClick={() => handleInvite(h.id)}
                                        >
                                            Wygeneruj zaproszenie
                                        </button>
                                        <button
                                            style={styles.warningButton}
                                            onClick={() => handleKick(h.id)}
                                        >
                                            Usuń członka
                                        </button>
                                        <button
                                            style={styles.dangerButton}
                                            onClick={() =>
                                                handleDeleteHousehold(h.id)
                                            }
                                        >
                                            Usuń household
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <>
                                <p>Nie masz jeszcze householda.</p>
                                <button
                                    style={styles.addButton}
                                    onClick={handleAdd}
                                >
                                    Dodaj household
                                </button>
                            </>
                        )}
                    </div>

                    <div style={styles.panel}>
                        <h2 style={styles.title}>Pozostałe householdy</h2>
                        {otherHouseholds.length > 0 ? (
                            otherHouseholds.map((h, index) => (
                                <div key={index} style={styles.householdCard}>
                                    <p>
                                        <strong>Nazwa:</strong> {h.name}
                                    </p>
                                    <p>
                                        <strong>Właściciel:</strong>{" "}
                                        {h.owner_username}
                                    </p>
                                    <p>
                                        <strong>Członkowie:</strong>{" "}
                                        {h.members.length > 0
                                            ? h.members.join(", ")
                                            : "Brak innych członków"}
                                    </p>

                                    <div style={styles.buttonRow}>
                                        <button
                                            style={styles.leaveButton}
                                            onClick={() => handleLeave(h.id)}
                                        >
                                            Opuść household
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>Nie należysz do innych householdów.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Style
const styles = {
    pageWrapper: {
        minHeight: "100vh",
        backgroundColor: "#3b82f6",
        padding: "40px 20px",
        width: "100vw",
        boxSizing: "border-box",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#1e293b",
    },

    outerContainer: {
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        width: "100%",
        maxWidth: "1400px",
        margin: "0 auto",
        boxSizing: "border-box",
    },

    backButton: {
        backgroundColor: "#58a7fc",
        border: "none",
        borderRadius: "8px",
        padding: "8px 14px",
        cursor: "pointer",
        color: "#fff",
        fontWeight: "600",
        fontSize: "1rem",
        alignSelf: "flex-start",
        transition: "background-color 0.3s ease",
    },

    hoverEffects: {
        backButtonHover: {
            backgroundColor: "#1d4ed8",
        },
    },

    twoColumnRow: {
        display: "flex",
        gap: "24px",
        justifyContent: "space-between",
        alignItems: "stretch",
        flexWrap: "wrap",
    },

    panel: {
        backgroundColor: "#fff",
        borderRadius: "12px",
        padding: "24px",
        flexGrow: 1,
        width: "100%",
        maxWidth: "calc(50% - 12px)",
        boxSizing: "border-box",
        boxShadow: "0 6px 12px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
    },

    title: {
        marginBottom: "16px",
        fontSize: "1.75rem",
        fontWeight: "600",
        color: "#1e293b",
    },

    addButton: {
        marginTop: "12px",
        padding: "10px 16px",
        border: "none",
        borderRadius: "8px",
        backgroundColor: "#10b981",
        color: "#fff",
        fontWeight: "600",
        cursor: "pointer",
        fontSize: "1rem",
    },

    householdCard: {
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "16px",
        marginBottom: "16px",
    },

    buttonRow: {
        marginTop: "12px",
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
    },

    primaryButton: {
        backgroundColor: "#3b82f6",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        padding: "8px 12px",
        cursor: "pointer",
        fontWeight: "600",
    },

    warningButton: {
        backgroundColor: "#f59e0b",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        padding: "8px 12px",
        cursor: "pointer",
        fontWeight: "600",
    },

    dangerButton: {
        backgroundColor: "#ef4444",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        padding: "8px 12px",
        cursor: "pointer",
        fontWeight: "600",
    },

    leaveButton: {
        backgroundColor: "#6b7280",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        padding: "8px 12px",
        cursor: "pointer",
        fontWeight: "600",
    },
};

export default HouseholdPage;

/*
const handleInvite = async (householdId) => { //działało poprawnie
        const email = prompt("Podaj email zapraszanej osoby:");

        if (!email) {
            alert("Email jest wymagany");
            return;
        }

        try {
            const response = await fetch(
                "http://127.0.0.1:5000/household/create_invite_token",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ household_id: householdId, email }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                alert(`Zaproszenie wygenerowane! Token: ${data.token}`);
            } else {
                alert(`Błąd: ${data.message}`);
            }
        } catch (error) {
            alert(`Błąd sieci: ${error.message}`);
        }
    };


//const handleJoinHousehold = () => alert("Dołącz do householda");

// Obsługa przycisków householda
    const handleDeleteHousehold = () => alert("Usuń z householda");

    const handleLeave = () => alert("Opuść household");
    const handleKick = () => alert("Wyrzuć kogoś z householda");
*/
