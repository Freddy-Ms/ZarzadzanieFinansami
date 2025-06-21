export default function SimpleModal({
    list,
    products,
    setShowExtendedModal,
    error,
    message,
    onClose,
    handleDeleteList,
    setIsEditMode,
    setProductId,
    handleDeleteProduct,
}) {
    return (
        <div style={styles.modal}>
            <div style={styles.header}>
                <h2 style={styles.title}>{list.name}</h2>
                <div style={styles.buttonsContainer}>
                    <button
                        onClick={handleDeleteList}
                        style={styles.deleteButton}
                        title="Delete list"
                    >
                        🗑️
                    </button>
                    <button
                        onClick={onClose}
                        style={styles.buttonCancel}
                        aria-label="Close modal"
                    >
                        X
                    </button>
                </div>
            </div>

            <div style={styles.section}>
                <h4 style={styles.subtitle}>Products:</h4>

                {products.length > 0 ? (
                    <ul style={styles.list}>
                        {products.map((product, index) => (
                            <li
                                key={index}
                                style={{
                                    ...styles.listItem,
                                    borderBottom:
                                        index !== products.length - 1
                                            ? "1px solid #ddd"
                                            : "none",
                                }}
                            >
                                <div style={styles.productContent}>
                                    <span>
                                        {product.name}{" "}
                                        <span
                                            style={{
                                                fontWeight: "600",
                                                color: "#555",
                                            }}
                                        >
                                            ({product.quantity})
                                        </span>
                                    </span>
                                    <div style={styles.productButtons}>
                                        <button
                                            style={styles.editButton}
                                            onClick={() => {
                                                setShowExtendedModal(true);
                                                setIsEditMode(true);
                                                setProductId(product.id);
                                            }}
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            style={styles.deleteButton}
                                            onClick={() => {
                                                handleDeleteProduct(product.id);
                                            }}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p style={styles.noItems}>No products listed.</p>
                )}
            </div>

            <div style={{ textAlign: "center" }}>
                <button
                    onClick={() => {
                        setShowExtendedModal(true);
                        setIsEditMode(false);
                    }}
                    style={styles.buttonAdd}
                    onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#218838")
                    }
                    onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "#28a745")
                    }
                >
                    ➕ Add product
                </button>
            </div>

            {error && <div style={styles.error}>{error}</div>}
            {message && <div style={styles.message}>{message}</div>}
        </div>
    );
}

const styles = {
    modal: {
        backgroundColor: "#fff",
        padding: "24px",
        borderRadius: "12px",
        width: "100%",
        margin: "20px",
        maxWidth: "500px",
        maxHeight: "90vh",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        flexDirection: "column",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "16px",
        paddingBottom: "10px",
    },
    title: {
        margin: 0,
        fontSize: "1.5rem",
        fontWeight: "bold",
    },
    subtitle: {
        margin: "0 0 8px 0",
        fontWeight: "500",
    },
    list: {
        listStyleType: "none",
        padding: 0,
        maxHeight: "60vh",
        overflowY: "auto",
        border: "1px solid #ccc",
        borderRadius: "6px",
        backgroundColor: "#f9f9f9",
    },
    listItem: {
        padding: "10px 15px",
        borderBottom: "1px solid #ddd",
        fontSize: "1rem",
        color: "#444",
    },
    noItems: {
        fontStyle: "italic",
        color: "#666",
    },
    buttonAdd: {
        padding: "10px 16px",
        backgroundColor: "#4a90e2",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "600",
        marginRight: "8px",
    },
    buttonCancel: {
        padding: "10px 16px",
        backgroundColor: "#ccc",
        color: "#333",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontWeight: "600",
    },
    error: {
        marginTop: "12px",
        color: "red",
        fontWeight: "600",
    },
    message: {
        marginTop: "12px",
        color: "green",
        fontWeight: "600",
    },
    deleteButton: {
        padding: "6px 12px",
        backgroundColor: "#ff4d4d",
        border: "none",
        borderRadius: "4px",
        color: "white",
        cursor: "pointer",
    },
    productContent: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
    },
    productButtons: {
        display: "flex",
        gap: "8px",
    },
    editButton: {
        padding: "4px 8px",
        backgroundColor: "#f0f0f0",
        border: "1px solid #ccc",
        borderRadius: "4px",
        cursor: "pointer",
    },
};
