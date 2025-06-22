import React, { useState } from "react";

const AddHouseholdModal = ({ visible, onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (!visible) return null;

  const handleAdd = async () => {
    if (!name.trim()) {
      setMessage("Nazwa householda nie może być pusta.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://127.0.0.1:5000/household/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Nie udało się utworzyć householda");
      }

      setMessage(data.message || "Household utworzony pomyślnie");
      onSuccess?.();
      setName("");
      onClose();
    } catch (err) {
      setMessage("Błąd: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.modal}>
      <div style={styles.modalContent}>
        <h3>Dodaj nowy household</h3>
        <input
          type="text"
          placeholder="Nazwa householda"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={loading}
          style={styles.input}
        />
        <div style={{ marginTop: 10 }}>
          <button onClick={handleAdd} disabled={loading} style={styles.okButton}>
            {loading ? "Tworzenie..." : "Utwórz"}
          </button>
          <button onClick={onClose} disabled={loading} style={styles.cancelButton}>
            Anuluj
          </button>
        </div>
        {message && <p style={{ marginTop: 10 }}>{message}</p>}
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
    padding: 20,
    borderRadius: 8,
    boxShadow: "0 0 10px rgba(0,0,0,0.3)",
    minWidth: 320,
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: 8,
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

export default AddHouseholdModal;
