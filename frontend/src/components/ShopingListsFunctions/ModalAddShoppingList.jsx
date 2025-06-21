import React, { useState } from "react";

export default function ModalAddShoppingList({ onClose, onCreated }) {
    const [name, setName] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        fetch("http://127.0.0.1:5000/shoppinglist/create", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ name }),
        })
            .then((res) => {
                if (!res.ok) throw new Error("Creation failed");
                return res.json();
            })
            .then((data) => {
                alert(data.message || "List created!");
                onCreated();
                onClose();
            })
            .catch((err) => {
                alert("Error: " + err.message);
            });
    };

    return (
        <div style={styles.backdrop}>
            <div style={styles.modal}>
                <h2 style={styles.title}>Add Shopping List</h2>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="List name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={styles.input}
                    />
                    <div style={styles.buttonRow}>
                        <button type="submit" style={styles.buttonAdd}>
                            Add
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            style={styles.buttonCancel}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const styles = {
  backdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "2rem",
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
    width: "90%",
    maxWidth: "400px",
  },
  title: {
    marginBottom: "1rem",
    textAlign: "center",
    color: "#333",
  },
  input: {
    width: "100%",
    padding: "0.75rem",
    fontSize: "1rem",
    border: "1px solid #ccc",
    borderRadius: "8px",
    marginBottom: "1.5rem",
    boxSizing: "border-box",
  },
  buttonRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: "1rem",
  },
  buttonAdd: {
    flex: 1,
    padding: "0.75rem",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  buttonCancel: {
    flex: 1,
    padding: "0.75rem",
    backgroundColor: "#f44336",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};
