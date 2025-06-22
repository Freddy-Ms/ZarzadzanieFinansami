import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import JoinHouseholdPanel from "./HouseholdsFunctions/JoinHouseholdPanel";
import InviteModal from "./HouseholdsFunctions/InviteModal";
import AddHouseholdModal from "./HouseholdsFunctions/AddHouseholdModal";

const HouseholdPage = () => {
    const navigate = useNavigate();
    const [household, setHousehold] = useState([]);
    const [error, setError] = useState(null);
    const [username, setUsername] = useState(null);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [showInvite, setShowInvite] = useState(false);
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editHouseholdId, setEditHouseholdId] = useState(null);
    const [editHouseholdName, setEditHouseholdName] = useState("");

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

    const handleEdit = (householdId, currentName) => {
        setEditHouseholdId(householdId);
        setEditHouseholdName(currentName);
        setShowEditModal(true);
    };

    const handleEditSubmit = async () => {
        try {
            const response = await fetch(
                "http://127.0.0.1:5000/household/edit",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        household_id: editHouseholdId,
                        name: editHouseholdName,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Błąd podczas edycji household"
                );
            }

            setShowEditModal(false);
            setEditHouseholdId(null);
            setEditHouseholdName("");
            await fetchUserHouseholds();
            alert("Household zaktualizowany pomyślnie");
        } catch (err) {
            alert("Błąd edycji household: " + err.message);
        }
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
                                        <strong>Członkowie:</strong>{" "}
                                        {h.members.length > 0
                                            ? h.members.join(", ")
                                            : "Brak innych członków"}
                                    </p>

                                    <div style={styles.buttonRow}>
                                        <>
                                            <button
                                                onClick={() =>
                                                    setShowInvite(true)
                                                }
                                            >
                                                Wygeneruj zaproszenie
                                            </button>
                                            {showInvite && (
                                                <InviteModal
                                                    householdId={h.id}
                                                    onClose={() => {
                                                        setShowInvite(false);
                                                        fetchUserHouseholds();
                                                    }}
                                                />
                                            )}
                                        </>
                                        <button
                                            style={styles.warningButton}
                                            onClick={() => handleEdit(h.id)}
                                        >
                                            Edytuj
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

                                    {showEditModal && (
                                        <div style={modalStyles.overlay}>
                                            <div style={modalStyles.modal}>
                                                <h3>Edytuj household</h3>
                                                <input
                                                    type="text"
                                                    value={editHouseholdName}
                                                    onChange={(e) =>
                                                        setEditHouseholdName(
                                                            e.target.value
                                                        )
                                                    }
                                                    style={modalStyles.input}
                                                    placeholder="Nowa nazwa household"
                                                />
                                                <div
                                                    style={
                                                        modalStyles.buttonRow
                                                    }
                                                >
                                                    <button
                                                        onClick={
                                                            handleEditSubmit
                                                        }
                                                        style={
                                                            styles.primaryButton
                                                        }
                                                    >
                                                        Zapisz
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            setShowEditModal(
                                                                false
                                                            )
                                                        }
                                                        style={
                                                            styles.dangerButton
                                                        }
                                                    >
                                                        Anuluj
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <>
                                <p>Nie masz jeszcze householda.</p>
                                <button
                                    onClick={() => setAddModalVisible(true)}
                                >
                                    Dodaj household
                                </button>

                                <AddHouseholdModal
                                    visible={addModalVisible}
                                    onClose={() => setAddModalVisible(false)}
                                    onSuccess={fetchUserHouseholds}
                                />
                            </>
                        )}
                    </div>

                    <div style={styles.panel}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                            }}
                        >
                            <h2 style={styles.title}>Pozostałe householdy</h2>
                            <button onClick={() => setShowJoinModal(true)}>
                                Dołącz do householda
                            </button>

                            <JoinHouseholdPanel
                                showModal={showJoinModal}
                                setShowModal={setShowJoinModal}
                                onSuccess={fetchUserHouseholds}
                            />
                        </div>
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
    joinButton: {
        padding: "8px 16px",
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
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

const modalStyles = {
    overlay: {
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    },
    modal: {
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "8px",
        width: "300px",
        boxSizing: "border-box",
        boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
    },
    input: {
        padding: "8px",
        fontSize: "1rem",
        borderRadius: "4px",
        border: "1px solid #ccc",
        width: "100%",
        boxSizing: "border-box",
    },
    buttonRow: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
    },
};


export default HouseholdPage;
