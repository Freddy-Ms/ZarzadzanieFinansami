import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddHouseholdModal = ({ visible, onClose, onSuccess }) => {
    const [name, setName] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    if (!visible) return null;

    const handleAdd = async () => {
        if (!name.trim()) {
            setMessage("Household name cannot be empty.");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const response = await fetch(
                "http://127.0.0.1:5000/household/create",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ name }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            toast.success(data.message);
            onSuccess?.();
            setName("");
            onClose();
        } catch (err) {
            toast.error("Error: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.modal}>
            <ToastContainer />
            <div style={styles.modalContent}>
                <h3 style={styles.title}>Add New Household</h3>
                <input
                    type="text"
                    placeholder="Household name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    style={styles.input}
                />
                <div style={styles.buttonGroup}>
                    <button
                        onClick={handleAdd}
                        disabled={loading}
                        style={{
                            ...styles.button,
                            ...styles.okButton,
                            opacity: loading ? 0.7 : 1,
                        }}
                    >
                        {loading ? "Creating a household..." : "Create"}
                    </button>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        style={{
                            ...styles.button,
                            ...styles.cancelButton,
                            opacity: loading ? 0.7 : 1,
                        }}
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
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
    },
    modalContent: {
        backgroundColor: "#fff",
        padding: "30px",
        borderRadius: "16px",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
        width: "90%",
        maxWidth: "400px",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        animation: "fadeIn 0.3s ease",
    },
    title: {
        marginBottom: "20px",
        fontSize: "20px",
        textAlign: "center",
        color: "#333",
    },
    input: {
        padding: "12px",
        borderRadius: "8px",
        border: "1px solid #ccc",
        fontSize: "16px",
        marginBottom: "20px",
    },
    buttonGroup: {
        display: "flex",
        justifyContent: "space-between",
        gap: "10px",
    },
    button: {
        flex: 1,
        padding: "12px",
        fontSize: "16px",
        borderRadius: "8px",
        cursor: "pointer",
        transition: "background-color 0.2s, transform 0.2s",
        border: "none",
    },
    okButton: {
        backgroundColor: "#007bff",
        color: "#fff",
    },
    cancelButton: {
        backgroundColor: "#f0f0f0",
        color: "#333",
    },
    message: {
        marginTop: "15px",
        textAlign: "center",
        color: "#cc0000",
        fontSize: "14px",
    },
};

export default AddHouseholdModal;
