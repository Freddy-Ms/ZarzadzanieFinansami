import React, { useState } from "react";
import { toast } from "react-toastify";

const InviteModal = ({ householdId, onClose }) => {
    const [email, setEmail] = useState("");
    const [token, setToken] = useState(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendInvite = async () => {
        if (!email.trim()) {
            setMessage("Email is required.");
            return;
        }

        setLoading(true);
        setMessage("");
        try {
            const response = await fetch(
                "http://127.0.0.1:5000/household/create_invite_token",
                {
                    method: "POST",
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ household_id: householdId, email }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                setToken(data.token);
            } else {
                toast.error(`Error: ${data.message}`);
            }
        } catch (error) {
            toast.error(`Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (token) {
            navigator.clipboard.writeText(token);
            setMessage("Copied to clipboard!");
        }
    };

    return (
        <div style={styles.modal}>
            <div style={styles.modalContent}>
                <h3 style={styles.title}>Generate invitation</h3>
                {!token ? (
                    <>
                        <input
                            type="email"
                            placeholder="Provide the email of the person you are inviting"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={styles.input}
                            disabled={loading}
                        />
                        <div style={styles.buttonGroup}>
                            <button
                                onClick={handleSendInvite}
                                disabled={loading}
                                style={styles.okButton}
                            >
                                {loading ? "Sending..." : "Send an invitation"}
                            </button>
                            <button
                                onClick={onClose}
                                disabled={loading}
                                style={styles.cancelButton}
                            >
                                Cancel
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <p style={styles.successMessage}>
                            Invitation generated!
                        </p>
                        <textarea
                            readOnly
                            value={token}
                            style={styles.textarea}
                        />
                        <div style={styles.buttonGroup}>
                            <button
                                onClick={handleCopy}
                                style={styles.okButton}
                            >
                                Copy token
                            </button>
                            <button
                                onClick={onClose}
                                style={styles.cancelButton}
                            >
                                Close
                            </button>
                        </div>
                    </>
                )}
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
        padding: "15px",
        boxSizing: "border-box",
    },
    modalContent: {
        backgroundColor: "#fff",
        padding: "30px 25px",
        borderRadius: "12px",
        boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
        width: "100%",
        maxWidth: "420px",
        display: "flex",
        flexDirection: "column",
    },
    title: {
        marginBottom: "20px",
        fontSize: "24px",
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
        width: "100%",
        boxSizing: "border-box",
    },
    textarea: {
        width: "100%",
        height: "80px",
        padding: "12px 15px",
        fontSize: "14px",
        borderRadius: "8px",
        border: "1.5px solid #ccc",
        resize: "none",
        boxSizing: "border-box",
        marginTop: "10px",
        fontFamily: "monospace",
        backgroundColor: "#f9f9f9",
        color: "#333",
    },
    buttonGroup: {
        marginTop: "15px",
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
    successMessage: {
        fontWeight: "600",
        fontSize: "16px",
        color: "#28a745",
        textAlign: "center",
        marginBottom: "10px",
    },
};

export default InviteModal;
