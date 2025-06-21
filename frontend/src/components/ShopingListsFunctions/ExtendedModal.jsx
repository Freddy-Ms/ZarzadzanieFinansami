import SubcategoryCombo from "./SubcategoryCombo";
import { useEffect } from "react";

export default function ExtendedModal({
    subcategories,
    newProductName,
    setNewProductName,
    quantity,
    setQuantity,
    subcategoryId,
    setSubcategoryId,
    handleAddProduct,
    setShowExtendedModal,
    setShowSimpleModal,
    error,
    message,
    setError,
    setMessage,
    inputRef,
    handleEditProduct,
    isEditMode,
    productId,
    products,
}) {
    useEffect(() => {
        if (isEditMode && productId) {
            const product = products.find((p) => p.id === Number(productId));
            if (product) {
                setNewProductName(product.name);
                setQuantity(product.quantity);
                setSubcategoryId(product.subcategory_id || "");
            }
        }
    }, [isEditMode, productId]);

    return (
        <div style={{ ...styles.modal, width: "420px" }}>
            <h2 style={styles.heading}>{isEditMode ? "Edit product" : "Add product"}</h2>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    if (!newProductName.trim())
                        return alert("Product name cannot be empty");

                    const productData = {
                        name: newProductName,
                        quantity,
                        subcategory_id: subcategoryId || null,
                    };

                    if (isEditMode) {
                        handleEditProduct({ id: productId, ...productData });
                    } else {
                        handleAddProduct(productData);
                        setNewProductName("");
                        setQuantity(1);
                        setSubcategoryId("");
                    }
                }}
            >
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
                    <button type="submit" style={styles.buttonAdd}>
                        {isEditMode ? "Save changes" : "Add product"}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setShowExtendedModal(false);
                            setShowSimpleModal(true);
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
            </form>
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
    inputFocus: {
        borderColor: "#3a66d1",
        backgroundColor: "#e1e9ff",
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
    buttonAddHover: {
        backgroundColor: "#2e4ea2",
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
    buttonCancelHover: {
        backgroundColor: "#bfbfbf",
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
