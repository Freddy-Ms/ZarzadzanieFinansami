import React, { useState } from "react";

const JoinHouseholdPanel = ({ showModal, setShowModal, onSuccess }) => {
    const [tokenInput, setTokenInput] = useState("");
    const [message, setMessage] = useState("");

    const joinHousehold = async (token) => {
        try {
            const response = await fetch("http://127.0.0.1:5000/household/accept_invite", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Błąd podczas dołączania do householda");
            }

            setMessage("Dołączono pomyślnie!");
            return true;
        } catch (err) {
            setMessage("Błąd: " + err.message);
            return false;
        }
    };

    const handleConfirm = async () => {
        if (tokenInput.trim()) {
            const success = await joinHousehold(tokenInput.trim());
            if(success) {
                onSuccess?.();          // odświeżenie po sukcesie
                setShowModal(false);    // zamknięcie modala
                setTokenInput("");
                setMessage("");
            }
        } else {
            setMessage("Wklej token zaproszenia.");
        }
    };

    if (!showModal) return null;

    return (
        <div style={styles.modal}>
            <div style={styles.modalContent}>
                <h3>Wklej token zaproszenia</h3>
                <input
                    type="text"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    style={styles.input}
                />
                <div style={{ marginTop: "10px" }}>
                    <button onClick={handleConfirm} style={styles.okButton}>
                        OK
                    </button>
                    <button onClick={() => setShowModal(false)} style={styles.cancelButton}>
                        Anuluj
                    </button>
                </div>
                {message && <p>{message}</p>}
            </div>
        </div>
    );
};

const styles = {
    modal: {
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 0 10px rgba(0,0,0,0.3)",
        minWidth: "300px",
        textAlign: "center",
    },
    input: {
        width: "100%",
        padding: "8px",
        marginTop: "10px",
    },
    okButton: {
        marginRight: "10px",
        padding: "8px 16px",
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
    },
    cancelButton: {
        padding: "8px 16px",
        backgroundColor: "#ccc",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
    },
};

export default JoinHouseholdPanel;
