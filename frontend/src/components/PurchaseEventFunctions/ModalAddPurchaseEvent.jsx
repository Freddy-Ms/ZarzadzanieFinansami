import React from "react";

export default function AddModal({
}) {
    return (
        <div style={styles.modalRow}>
            <div style={styles.backdrop}>
                <div style={styles.modal}>
                    <h2
                        style={{
                            ...styles.title,
                            marginBottom: "10px",
                            marginTop: 0,
                        }}
                    >
                        Dodaj listę zakupów
                    </h2>
                </div>
            </div>
        </div>
        /*
        <div style={styles.backdrop}>
            <div style={styles.modal}>
                <h2
                    style={{
                        ...styles.title,
                        marginBottom: "10px",
                        marginTop: 0,
                    }}
                >
                    Dodaj listę zakupów
                </h2>
                <form
                    onSubmit={handleSubmit}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                    }}
                >
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Nazwa listy"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={styles.input}
                    />

                    <select
                        value={selectedHousehold}
                        onChange={(e) => setSelectedHousehold(e.target.value)}
                        style={styles.input}
                    >
                        <option value="private">
                            Prywatna (tylko dla Ciebie)
                        </option>
                        {households.map((h) => (
                            <option key={h.id} value={h.id}>
                                {h.name}
                            </option>
                        ))}
                    </select>

                    {/* Sekcja dodawania paragonu *}
                    {!receiptFile ? (
                        <div
                            style={{
                                border: "2px dashed #ccc",
                                borderRadius: "12px",
                                padding: "20px",
                                textAlign: "center",
                                backgroundColor: "#f9f9f9",
                                cursor: "pointer",
                                transition: "background-color 0.2s",
                            }}
                            onClick={() =>
                                document.getElementById("receiptInput").click()
                            }
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                const file = e.dataTransfer.files[0];
                                if (file) setReceiptFile(file);
                            }}
                        >
                            <input
                                id="receiptInput"
                                type="file"
                                accept="image/*"
                                onChange={(e) =>
                                    setReceiptFile(e.target.files[0])
                                }
                                style={{ display: "none" }}
                            />
                            <p>Kliknij lub przeciągnij tutaj obraz paragonu</p>
                        </div>
                    ) : (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                backgroundColor: "#e6f4ea",
                                padding: "0.75rem 1rem",
                                borderRadius: "8px",
                                color: "#2e7d32",
                                fontWeight: "bold",
                                fontSize: "0.95rem",
                            }}
                        >
                            <span style={{ fontSize: "1.25rem" }}>✔</span>
                            <span>Paragon dodany: {receiptFile.name}</span>
                        </div>
                    )}

                    {loadingOcr && (
                        <p style={{ fontStyle: "italic", color: "#888" }}>
                            Przetwarzanie OCR...
                        </p>
                    )}

                    {products.length > 0 && (
                        <div
                            style={{
                                backgroundColor: "#eef",
                                padding: "1rem",
                                borderRadius: "8px",
                                maxHeight: "320px",
                                overflowY: "auto",
                            }}
                        >
                            <h4
                                style={{ marginBottom: "0.8rem", marginTop: 0 }}
                            >
                                Rozpoznane produkty:
                            </h4>
                            {products.map((p, i) => (
                                <div
                                    key={i}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        backgroundColor: "#fff",
                                        padding: "0.6rem 1rem",
                                        borderRadius: "6px",
                                        marginBottom: "0.5rem",
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                                    }}
                                >
                                    <span>
                                        <strong>{p.name}</strong> – {p.price} zł
                                    </span>
                                    <button
                                        style={{
                                            backgroundColor: "#007bff",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "4px",
                                            padding: "0.3rem 0.7rem",
                                            cursor: "pointer",
                                        }}
                                        onClick={() => {}}
                                    >
                                        Edytuj
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: "1rem",
                        }}
                    >
                        <button type="submit" style={styles.buttonAdd}>
                            Dodaj
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            style={styles.buttonCancel}
                        >
                            Anuluj
                        </button>
                    </div>
                </form>
            </div>
        </div>*/
    );
}

const styles = {
    backdrop: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
    },
    modal: {
        backgroundColor: "#fff",
        borderRadius: "12px",
        padding: "2rem",
        width: "100%",
        maxWidth: "500px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    },
    title: {
        fontSize: "1.5rem",
        textAlign: "center",
    },
    input: {
        padding: "0.75rem",
        border: "1px solid #ccc",
        borderRadius: "8px",
        fontSize: "1rem",
    },
    buttonAdd: {
        padding: "0.5rem 1.25rem",
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
    },
    buttonCancel: {
        padding: "0.5rem 1.25rem",
        backgroundColor: "#ccc",
        color: "#333",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
    },
};
