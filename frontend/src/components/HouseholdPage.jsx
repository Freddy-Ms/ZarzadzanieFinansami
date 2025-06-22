import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import JoinHouseholdPanel from "./HouseholdsFunctions/JoinHouseholdPanel";
import InviteModal from "./HouseholdsFunctions/InviteModal";
import AddHouseholdModal from "./HouseholdsFunctions/AddHouseholdModal";

const HouseholdPage = () => {
    const navigate = useNavigate();
    const [household, setHousehold] = useState([]);
    const [, setError] = useState(null);
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

            if (response.status === 404) {
                setHousehold([]);
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            setHousehold(data);
            setError(null);
        } catch (err) {
            console.error("Error:", err.message);
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
                throw new Error(data.message);
            }

            setShowEditModal(false);
            setEditHouseholdId(null);
            setEditHouseholdName("");
            await fetchUserHouseholds();
            toast.success("Household successfully updated!", {
                autoClose: 3000,
            });
        } catch (err) {
            toast.error("Error: " + err.message, {
                autoClose: 3000,
            });
        }
    };

    const handleDeleteHousehold = async (id) => {
        if (
            !window.confirm(`Are you sure you want to delete your household?`)
        ) {
            return;
        }

        try {
            const response = await fetch(
                "http://127.0.0.1:5000/household/delete",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ household_id: id }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.message, { autoClose: 3000 });
                return;
            }

            await fetchUserHouseholds();
            toast.success(data.message, { autoClose: 3000 });
        } catch (error) {
            toast.error("Error: " + error.message, { autoClose: 3000 });
        }
    };

    const handleLeave = async (householdId) => {
        try {
            const response = await fetch(
                "http://127.0.0.1:5000/household/leave",
                {
                    method: "DELETE",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ household_id: householdId }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message);
                fetchUserHouseholds();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Error: " + error.message);
        }
    };

    const handleRemoveMember = async (householdId, usernameToKick) => {
        try {
            const response = await fetch(
                "http://127.0.0.1:5000/household/kick",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        household_id: householdId,
                        username_to_kick: usernameToKick,
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                toast.error(errorData.message);
                return;
            }

            const data = await response.json();
            toast.success(data.message);

            fetchUserHouseholds();
        } catch (error) {
            toast.error("Error: " + error.message);
        }
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
            <ToastContainer position="top-center" autoClose={3000} />
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
                    ← Back
                </button>

                <div style={styles.twoColumnRow}>
                    <div style={styles.panel}>
                        <h2 style={styles.title}>Your household</h2>
                        {myHouseholds.length > 0 ? (
                            myHouseholds.map((h, index) => (
                                <div key={index} style={styles.householdCard}>
                                    <p>
                                        <strong>Name:</strong> {h.name}
                                    </p>
                                    <div>
                                        <strong>Members:</strong>
                                        {h.members.length > 0 ? (
                                            h.members.map((member, idx) => (
                                                <div
                                                    key={idx}
                                                    style={{
                                                        display: "flex",
                                                        justifyContent:
                                                            "space-between",
                                                        alignItems: "center",
                                                        padding: "6px 10px",
                                                        margin: "4px 0",
                                                        backgroundColor:
                                                            "#f0f0f0",
                                                        borderRadius: "4px",
                                                    }}
                                                >
                                                    <span>{member}</span>
                                                    <button
                                                        style={{
                                                            backgroundColor:
                                                                "#e74c3c",
                                                            color: "white",
                                                            border: "none",
                                                            borderRadius: "3px",
                                                            padding: "4px 8px",
                                                            cursor: "pointer",
                                                        }}
                                                        onClick={() =>
                                                            handleRemoveMember(
                                                                h.id,
                                                                member
                                                            )
                                                        }
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <p>No other members</p>
                                        )}
                                    </div>

                                    <div style={styles.buttonRow}>
                                        <>
                                            <button
                                                onClick={() =>
                                                    setShowInvite(true)
                                                }
                                                style={{
                                                    backgroundColor: "#3B82F6",
                                                    color: "white",
                                                    padding: "0.5rem 1rem",
                                                    borderRadius: "0.5rem",
                                                    border: "none",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                Generate invitation
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
                                            Edit
                                        </button>
                                        <button
                                            style={styles.dangerButton}
                                            onClick={() =>
                                                handleDeleteHousehold(h.id)
                                            }
                                        >
                                            Delete household
                                        </button>
                                    </div>

                                    {showEditModal && (
                                        <div style={modalStyles.overlay}>
                                            <div style={modalStyles.modal}>
                                                <h3>Edit household</h3>
                                                <input
                                                    type="text"
                                                    value={editHouseholdName}
                                                    onChange={(e) =>
                                                        setEditHouseholdName(
                                                            e.target.value
                                                        )
                                                    }
                                                    style={modalStyles.input}
                                                    placeholder="New household name"
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
                                                        Save
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
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <>
                                <p>You don't have a household yet</p>
                                <button
                                    onClick={() => setAddModalVisible(true)}
                                    style={{
                                        backgroundColor: "#3B82F6",
                                        color: "white",
                                        padding: "0.5rem 1rem",
                                        borderRadius: "0.5rem",
                                        border: "none",
                                        cursor: "pointer",
                                    }}
                                >
                                    Add household
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
                            <h2 style={styles.title}>Other households</h2>
                            <button
                                onClick={() => setShowJoinModal(true)}
                                style={{
                                    backgroundColor: "#3B82F6",
                                    color: "white",
                                    padding: "0.5rem 1rem",
                                    borderRadius: "0.5rem",
                                    border: "none",
                                    cursor: "pointer",
                                }}
                            >
                                Join a household
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
                                        <strong>Name:</strong> {h.name}
                                    </p>
                                    <p>
                                        <strong>Owner:</strong>{" "}
                                        {h.owner_username}
                                    </p>
                                    <p>
                                        <strong>Members:</strong>{" "}
                                        {h.members.length > 0
                                            ? h.members.join(", ")
                                            : "No other members"}
                                    </p>

                                    <div style={styles.buttonRow}>
                                        <button
                                            style={styles.leaveButton}
                                            onClick={() => handleLeave(h.id)}
                                        >
                                            Leave household
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p>You don't belong to other households.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    pageWrapper: {
        minHeight: "100vh",
        backgroundColor: "#0077cc",
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
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
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
