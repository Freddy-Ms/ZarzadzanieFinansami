import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [username, setName] = useState("");
    const [email, setEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [household, setHousehold] = useState([]);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const getHouseholds = async () => {
            const data = await fetchUserHouseholds();
            setHousehold(data);
        };
        getHouseholds();
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const response = await fetch("http://127.0.0.1:5000/user/get", {
                method: "GET",
                credentials: "include",
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message);
            }

            setUser(data);
            setName(data.username);
            setEmail(data.email);
        } catch (err) {
            setError(err.message);
        }
    };

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
                throw new Error(data.message);
            }
            return data;
        } catch (err) {
            toast.error("Error:", err.message);
            return null;
        }
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancel = () => {
        setName(user.username);
        setEmail(user.email);
        setHousehold(user.household || "");
        setIsEditing(false);
        setNewPassword("");
        setConfirmPassword("");
    };

    const handleSave = async () => {
        if (newPassword && newPassword !== confirmPassword) {
            toast.error("Passwords do not match", { autoClose: 3000 });
            return;
        }

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
                    new_password: newPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            toast.success(data.message, { autoClose: 3000 });

            setUser((prev) => ({ ...prev, username: username, email: email }));
            setNewPassword("");
            setConfirmPassword("");
            setIsEditing(false);
        } catch (err) {
            toast.error("Error: " + err.message, { autoClose: 3000 });
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete your account?"))
            return;

        try {
            const response = await fetch("http://127.0.0.1:5000/user/delete", {
                method: "POST",
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            toast.success("Account deleted successfully", { autoClose: 3000 })

            navigate("/");
        } catch (err) {
            toast.error("Error: " + err.message, { autoClose: 3000 });
        }
    };

    return (
        
        <div style={styles.pageWrapper}>
            <ToastContainer />
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
                    <div style={styles.leftPanel}>
                        <div style={styles.panel}>
                            <h2 style={styles.title}>User Profile</h2>

                            {error && (
                                <p
                                    style={{
                                        color: "#f87171",
                                        marginBottom: 10,
                                    }}
                                >
                                    {error}
                                </p>
                            )}

                            {user ? (
                                <div style={styles.infoBox}>
                                    {isEditing ? (
                                        <>
                                            <label style={styles.label}>
                                                Name:
                                                <input
                                                    type="text"
                                                    value={username}
                                                    onChange={(e) =>
                                                        setName(e.target.value)
                                                    }
                                                    style={styles.input}
                                                    placeholder="Enter your name"
                                                    onFocus={(e) =>
                                                        (e.currentTarget.style.borderColor =
                                                            styles.inputFocus.borderColor)
                                                    }
                                                    onBlur={(e) =>
                                                        (e.currentTarget.style.borderColor =
                                                            styles.input.borderColor)
                                                    }
                                                />
                                            </label>
                                            <label style={styles.label}>
                                                Email:
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) =>
                                                        setEmail(e.target.value)
                                                    }
                                                    style={styles.input}
                                                    placeholder="Enter your email"
                                                    onFocus={(e) =>
                                                        (e.currentTarget.style.borderColor =
                                                            styles.inputFocus.borderColor)
                                                    }
                                                    onBlur={(e) =>
                                                        (e.currentTarget.style.borderColor =
                                                            styles.input.borderColor)
                                                    }
                                                />
                                            </label>
                                            <label style={styles.label}>
                                                New Password:
                                                <input
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={(e) =>
                                                        setNewPassword(
                                                            e.target.value
                                                        )
                                                    }
                                                    style={styles.input}
                                                    placeholder="Enter new password"
                                                />
                                            </label>
                                            <label style={styles.label}>
                                                Confirm New Password:
                                                <input
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) =>
                                                        setConfirmPassword(
                                                            e.target.value
                                                        )
                                                    }
                                                    style={styles.input}
                                                    placeholder="Repeat new password"
                                                />
                                            </label>
                                            <p>
                                                <strong>Household:</strong>{" "}
                                                {household &&
                                                household.length > 0
                                                    ? household
                                                          .map((h) => h.name)
                                                          .join(", ")
                                                    : "No household assigned"}
                                            </p>

                                            <div style={styles.buttonRow}>
                                                <button
                                                    style={styles.saveButton}
                                                    onMouseEnter={(e) =>
                                                        (e.currentTarget.style.backgroundColor =
                                                            styles.hoverEffects.saveButtonHover.backgroundColor)
                                                    }
                                                    onMouseLeave={(e) =>
                                                        (e.currentTarget.style.backgroundColor =
                                                            styles.saveButton.backgroundColor)
                                                    }
                                                    onClick={handleSave}
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    style={styles.cancelButton}
                                                    onMouseEnter={(e) =>
                                                        (e.currentTarget.style.backgroundColor =
                                                            styles.hoverEffects.cancelButtonHover.backgroundColor)
                                                    }
                                                    onMouseLeave={(e) =>
                                                        (e.currentTarget.style.backgroundColor =
                                                            styles.cancelButton.backgroundColor)
                                                    }
                                                    onClick={handleCancel}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <p>
                                                <strong>Name:</strong>{" "}
                                                {user.username}
                                            </p>
                                            <p>
                                                <strong>Email:</strong>{" "}
                                                {user.email}
                                            </p>
                                            <p>
                                                <strong>Household:</strong>{" "}
                                                {household &&
                                                household.length > 0
                                                    ? household
                                                          .map((h) => h.name)
                                                          .join(", ")
                                                    : "No household assigned"}
                                            </p>
                                        </>
                                    )}
                                </div>
                            ) : (
                                !error && <p>Loading data...</p>
                            )}

                            <div style={styles.buttonsRow}>
                                <button
                                    style={{
                                        ...styles.button,
                                        ...styles.editButton,
                                    }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.backgroundColor =
                                            styles.hoverEffects.editButtonHover.backgroundColor)
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.backgroundColor =
                                            styles.editButton.backgroundColor)
                                    }
                                    onClick={handleEditClick}
                                >
                                    Edit Account
                                </button>
                                <button
                                    style={{
                                        ...styles.button,
                                        ...styles.deleteButton,
                                    }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.backgroundColor =
                                            styles.hoverEffects.deleteButtonHover.backgroundColor)
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.backgroundColor =
                                            styles.deleteButton.backgroundColor)
                                    }
                                    onClick={handleDelete}
                                >
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>

                    <div style={styles.rightPanel}>
                        <h2 style={styles.title}>Households You Belong To</h2>
                        {household.length > 0 ? (
                            <ul
                                style={{
                                    listStyle: "none",
                                    padding: 0,
                                    margin: 0,
                                }}
                            >
                                {household.map((h, i) => (
                                    <li key={i} style={styles.householdBox}>
                                        <strong>{h.name}</strong> – owner:{" "}
                                        {h.owner_username}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>You do not belong to any households.</p>
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
    },
    panel: {
        backgroundColor: "#fff",
        borderRadius: "12px",
        padding: "24px",
        flex: "1 1 48%",
        boxShadow: "0 6px 12px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        color: "#1e293b",
    },
    title: {
        marginBottom: "16px",
        fontSize: "1.75rem",
        fontWeight: "600",
        color: "#1e293b",
    },
    infoBox: {
        backgroundColor: "#f9fafb",
        padding: "16px",
        borderRadius: "8px",
        marginBottom: "16px",
        boxShadow: "inset 0 0 8px rgba(0,0,0,0.05)",
        color: "#1e293b",
    },
    label: {
        display: "block",
        marginBottom: "12px",
        fontWeight: "500",
        fontSize: "1rem",
        color: "#334155",
    },
    input: {
        width: "100%",
        padding: "10px 12px",
        borderRadius: "6px",
        border: "1.5px solid #cbd5e1",
        fontSize: "1rem",
        transition: "border-color 0.2s ease",
        color: "#1e293b",
        backgroundColor: "#fff",
    },
    buttonRow: {
        display: "flex",
        gap: "14px",
        marginTop: "14px",
        flexWrap: "wrap",
    },
    buttonsRow: {
        marginTop: "20px",
        display: "flex",
        gap: "14px",
        flexWrap: "wrap",
    },
    button: {
        padding: "12px 18px",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "1rem",
        transition: "background-color 0.3s ease",
        userSelect: "none",
        color: "#fff",
    },
    editButton: {
        backgroundColor: "#38bdf8",
    },
    deleteButton: {
        backgroundColor: "#ef4444",
    },
    saveButton: {
        backgroundColor: "#10b981",
        padding: "12px 18px",
        borderRadius: "8px",
    },
    cancelButton: {
        backgroundColor: "#94a3b8",
        padding: "12px 18px",
        borderRadius: "8px",
    },
    backButton: {
        backgroundColor: "#58a7fc",
        border: "none",
        borderRadius: "8px",
        padding: "8px 14px",
        cursor: "pointer",
        marginBottom: "18px",
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
    householdBox: {
        backgroundColor: "#e2e8f0",
        padding: "14px 20px",
        borderRadius: "10px",
        marginBottom: "14px",
        fontSize: "1rem",
        color: "#334155",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    },
    twoColumnRow: {
        display: "flex",
        gap: "24px",
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexWrap: "nowrap",
    },
    leftPanel: {
        flex: 3,
        backgroundColor: "#fff",
        borderRadius: "10px",
        padding: "20px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        boxSizing: "border-box",
        color: "#1e293b",
    },
    rightPanel: {
        flex: 2,
        backgroundColor: "#fff",
        borderRadius: "10px",
        padding: "20px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        boxSizing: "border-box",
        color: "#1e293b",
        minWidth: "250px",
    },
};

export default ProfilePage;
