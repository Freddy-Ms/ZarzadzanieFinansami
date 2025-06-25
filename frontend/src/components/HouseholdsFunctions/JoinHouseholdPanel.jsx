import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const JoinHouseholdPanel = ({ showModal, setShowModal, onSuccess }) => {
    const [tokenInput, setTokenInput] = useState("");
    const [message, setMessage] = useState("");

    const joinHousehold = async (token) => {
        try {
            const response = await fetch(
                "http://127.0.0.1:5000/household/accept_invite",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ token }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            toast.success("Joined successfully!");
            return true;
        } catch (err) {
            toast.error("Error: " + err.message);
            return false;
        }
    };

    const handleConfirm = async () => {
        if (tokenInput.trim()) {
            const success = await joinHousehold(tokenInput.trim());
            if (success) {
                onSuccess?.();
                setShowModal(false);
                setTokenInput("");
                setMessage("");
            }
        } else {
            setMessage("Paste the invitation token.");
        }
    };

    if (!showModal) return null;
    return (
        <div style={styles.modal}>
            <div style={styles.modalContent}>
                <h3 style={styles.title}>Paste invitation token</h3>
                <input
                    type="text"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    style={styles.input}
                    placeholder="Enter token here"
                />
                <div style={styles.buttonGroup}>
                    <button onClick={handleConfirm} style={styles.okButton}>
                        Ok
                    </button>
                    <button
                        onClick={() => setShowModal(false)}
                        style={styles.cancelButton}
                    >
                        Cancel
                    </button>
                </div>
                {message && <p style={styles.message}>{message}</p>}
            </div>
        </div>
    );
};
const styles = {
    modal: {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: "#fff",
        padding: "30px 25px",
        borderRadius: "12px",
        boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
        width: "90%",
        maxWidth: "380px",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
    },
    title: {
        marginBottom: "20px",
        fontSize: "22px",
        fontWeight: "600",
        color: "#222",
        textAlign: "center",
    },
    input: {
        padding: "12px 15px",
        fontSize: "16px",
        borderRadius: "8px",
        border: "1.5px solid #ccc",
        outline: "none",
        transition: "border-color 0.3s",
        marginBottom: "20px",
    },
    buttonGroup: {
        display: "flex",
        justifyContent: "space-between",
        gap: "12px",
    },
    okButton: {
        flex: 1,
        padding: "12px 0",
        backgroundColor: "#007bff",
        border: "none",
        borderRadius: "8px",
        color: "white",
        fontWeight: "600",
        cursor: "pointer",
        transition: "background-color 0.3s",
    },
    cancelButton: {
        flex: 1,
        padding: "12px 0",
        backgroundColor: "#f1f1f1",
        border: "none",
        borderRadius: "8px",
        color: "#555",
        fontWeight: "600",
        cursor: "pointer",
        transition: "background-color 0.3s",
    },
    message: {
        marginTop: "15px",
        textAlign: "center",
        color: "#d9534f",
        fontWeight: "500",
        fontSize: "14px",
    },
};

export default JoinHouseholdPanel;
