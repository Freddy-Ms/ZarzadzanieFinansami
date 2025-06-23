export default function EditModal() {
    return (
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

