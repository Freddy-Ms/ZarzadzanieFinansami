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
        <div style={{ ...styles.modal, width: "400px" }}>
            <h2>{isEditMode ? "Edit product" : "Add product"}</h2>
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

                <div style={{ marginTop: "12px" }}>
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
        padding: "24px",
        borderRadius: "12px",
        width: "100%",
        maxWidth: "600px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        display: "flex",
        flexDirection: "column",
    },
    input: {
        padding: "8px",
        fontSize: "1rem",
        borderRadius: "6px",
        width: "100%",
        boxSizing: "border-box",
        marginBottom: "12px",
        backgroundColor: "rgb(215, 228, 241)",
        color: "black",
        border: "1px solid rgb(72, 132, 197)",
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
    fieldGroup: {
        marginBottom: "12px",
        display: "flex",
        flexDirection: "column",
    },
    label: {
        marginBottom: "4px",
        fontWeight: "500",
    },
};
