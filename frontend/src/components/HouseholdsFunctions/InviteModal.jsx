import React, { useState } from "react";

const InviteModal = ({ householdId, onClose }) => {
    const [email, setEmail] = useState("");
    const [token, setToken] = useState(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendInvite = async () => {
        if (!email.trim()) {
            setMessage("Email jest wymagany");
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
                setMessage(`Błąd: ${data.message}`);
            }
        } catch (error) {
            setMessage(`Błąd sieci: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (token) {
            navigator.clipboard.writeText(token);
            setMessage("Skopiowano do schowka!");
        }
    };

    return (
        <div style={styles.modal}>
            <div style={styles.modalContent}>
                <h3>Wygeneruj zaproszenie</h3>
                {!token ? (
                    <>
                        <input
                            type="email"
                            placeholder="Podaj email zapraszanej osoby"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={styles.input}
                            disabled={loading}
                        />
                        <div style={{ marginTop: 10 }}>
                            <button
                                onClick={handleSendInvite}
                                disabled={loading}
                                style={styles.okButton}
                            >
                                {loading
                                    ? "Wysyłanie..."
                                    : "Wyślij zaproszenie"}
                            </button>
                            <button
                                onClick={onClose}
                                disabled={loading}
                                style={styles.cancelButton}
                            >
                                Anuluj
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <p>Zaproszenie wygenerowane!</p>
                        <textarea
                            readOnly
                            value={token}
                            style={{ width: "100%", height: 80, marginTop: 10 }}
                        />
                        <div style={{ marginTop: 10 }}>
                            <button
                                onClick={handleCopy}
                                style={styles.okButton}
                            >
                                Kopiuj token
                            </button>
                            <button
                                onClick={onClose}
                                style={styles.cancelButton}
                            >
                                Zamknij
                            </button>
                        </div>
                    </>
                )}
                {message && <p style={{ marginTop: 10 }}>{message}</p>}
            </div>
        </div>
    );
};

const styles = {
    modal: {
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
    modalContent: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 8,
        boxShadow: "0 0 10px rgba(0,0,0,0.3)",
        minWidth: 320,
        textAlign: "center",
    },
    input: {
        width: "100%",
        padding: 8,
        marginTop: 10,
        fontSize: 16,
    },
    okButton: {
        marginRight: 10,
        padding: "8px 16px",
        backgroundColor: "#007bff",
        color: "white",
        border: "none",
        borderRadius: 4,
        cursor: "pointer",
    },
    cancelButton: {
        padding: "8px 16px",
        backgroundColor: "#ccc",
        border: "none",
        borderRadius: 4,
        cursor: "pointer",
    },
};

export default InviteModal;
