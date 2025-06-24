import React, { useEffect, useState, useRef } from "react";

// Dummy SubcategoryCombo komponent - zamień na swój oryginalny!
function SubcategoryCombo({ subcategories, onSelect, selectedSubcategoryId }) {
    return (
        <select
            value={selectedSubcategoryId}
            onChange={(e) => onSelect(e.target.value)}
            style={{ padding: "10px", borderRadius: "6px" }}
        >
            <option value="">Select subcategory</option>
            {subcategories.map((sub) => (
                <option key={sub.id} value={sub.id}>
                    {sub.name}
                </option>
            ))}
        </select>
    );
}

export default function EditPage() {
    // Przykladowe dane do testu:
    const [subcategories] = useState([
        { id: "1", name: "Fruits" },
        { id: "2", name: "Vegetables" },
    ]);
    const [products] = useState([
        { id: 1, name: "Apple", quantity: 5, subcategory_id: "1" },
        { id: 2, name: "Carrot", quantity: 3, subcategory_id: "2" },
    ]);

    const [productId, setProductId] = useState(1); // przykładowo edytujemy produkt o id=1
    const [newProductName, setNewProductName] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [subcategoryId, setSubcategoryId] = useState("");
    const [showEditModal, setShowEditModal] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);

    const inputRef = useRef(null);

    useEffect(() => {
        if (productId) {
            const product = products.find((p) => p.id === Number(productId));
            if (product) {
                setNewProductName(product.name);
                setQuantity(product.quantity);
                setSubcategoryId(product.subcategory_id || "");
            }
        }
    }, [productId, products]);

    if (!showEditModal) {
        return (
            <div style={{ padding: 20 }}>
                <h2>Modal is closed</h2>
                <button onClick={() => setShowEditModal(true)}>
                    Open Edit Modal
                </button>
            </div>
        );
    }

    return (
        <div style={{ ...styles.modal, width: "420px", margin: "40px auto" }}>
            <h2 style={styles.heading}>Edit product</h2>

            <div style={styles.fieldGroup}>
                <label style={styles.label}>Product name:</label>
                <input
                    ref={inputRef}
                    type="text"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    style={styles.input}
                    placeholder="Enter product name"
                />
            </div>

            <div style={styles.fieldGroup}>
                <label style={styles.label}>Quantity:</label>
                <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    style={styles.input}
                />
            </div>

            <div style={styles.fieldGroup}>
                <label style={styles.label}>Category:</label>
                <SubcategoryCombo
                    subcategories={subcategories}
                    onSelect={setSubcategoryId}
                    selectedSubcategoryId={subcategoryId}
                />
            </div>

            <div style={styles.buttonsRow}>
                <button
                    type="submit"
                    style={styles.buttonAdd}
                    onClick={() => {
                        // Tu np. wywołaj API do zapisu i potem ustaw komunikaty
                        setMessage("Changes saved!");
                        setError(null);
                    }}
                >
                    Save changes
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setShowEditModal(false);
                        setShowAddModal(true);
                        setError(null);
                        setMessage(null);
                    }}
                    style={styles.buttonCancel}
                >
                    Cancel
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
        padding: "28px 32px",
        borderRadius: "14px",
        maxWidth: "600px",
        boxShadow: "0 6px 18px rgba(0, 0, 0, 0.15)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#222",
    },
    heading: {
        marginBottom: "24px",
        fontWeight: "700",
        fontSize: "1.8rem",
        color: "#333",
        userSelect: "none",
    },
    input: {
        padding: "10px 14px",
        fontSize: "1rem",
        borderRadius: "8px",
        width: "100%",
        boxSizing: "border-box",
        border: "1.5px solid #5a8dee",
        backgroundColor: "#f0f5ff",
        color: "#1a1a1a",
        transition: "border-color 0.3s ease",
        outline: "none",
    },
    buttonAdd: {
        padding: "12px 20px",
        backgroundColor: "#3a66d1",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "700",
        fontSize: "1rem",
        transition: "background-color 0.3s ease",
        flexGrow: 1,
        marginRight: "12px",
    },
    buttonCancel: {
        padding: "12px 20px",
        backgroundColor: "#d3d3d3",
        color: "#555",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "1rem",
        flexGrow: 1,
        transition: "background-color 0.3s ease",
    },
    error: {
        marginTop: "18px",
        color: "#d32f2f",
        fontWeight: "700",
        fontSize: "0.95rem",
        userSelect: "none",
    },
    message: {
        marginTop: "18px",
        color: "#388e3c",
        fontWeight: "700",
        fontSize: "0.95rem",
        userSelect: "none",
    },
    fieldGroup: {
        marginBottom: "18px",
        display: "flex",
        flexDirection: "column",
    },
    label: {
        marginBottom: "6px",
        fontWeight: "600",
        fontSize: "1rem",
        color: "#444",
        userSelect: "none",
    },
    buttonsRow: {
        display: "flex",
        justifyContent: "space-between",
        marginTop: "20px",
    },
};
