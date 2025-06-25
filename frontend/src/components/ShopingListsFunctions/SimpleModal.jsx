import React, { useEffect, useState } from "react";

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
    subcategories,
}) {
    const [householdMap, setHouseholdMap] = useState({});

    useEffect(() => {
        fetch("http://127.0.0.1:5000/household/get", {
            method: "GET",
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                const map = {};
                data.forEach((h) => {
                    map[h.id] = h.name;
                });
                setHouseholdMap(map);
            });
    }, []);

    return (
        <div style={styles.modal}>
            <div style={styles.header}>
                <h2 style={styles.title}>
                    {list.name}
                    {list.household_id && (
                        <span style={{ fontSize: "0.8em", color: "gray" }}>
                            {" "}
                            ({householdMap[list.household_id]})
                        </span>
                    )}
                </h2>
                <div style={styles.buttonsContainer}>
                    <button
                        onClick={handleDeleteList}
                        style={styles.deleteButton}
                        title="Delete list"
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "#e63946")
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = "#ff4d4d")
                        }
                    >
                        🗑️
                    </button>
                    <button
                        onClick={onClose}
                        style={styles.buttonCancel}
                        title="Close"
                        onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = "#b0b0b0")
                        }
                        onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = "#ccc")
                        }
                    >
                        ×
                    </button>
                </div>
            </div>

            <div style={styles.section}>
                <h4 style={styles.subtitle}>Products:</h4>

                {products.length > 0 ? (
                    <ul style={styles.list}>
                        {products.map((product, index) => (
                            <li
                                key={product.id}
                                style={{
                                    ...styles.listItem,
                                    borderBottom:
                                        index !== products.length - 1
                                            ? "1px solid #ddd"
                                            : "none",
                                }}
                            >
                                <div style={styles.productContent}>
                                    <span style={styles.productName}>
                                        {product.name}{" "}
                                        <span style={styles.productQuantity}>
                                            ({product.quantity})
                                        </span>
                                        <span style={styles.productQuantity}>
                                            {getSubcategoryName(product, subcategories)}
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
                                            title="Edit product"
                                            onMouseEnter={(e) =>
                                                (e.currentTarget.style.backgroundColor =
                                                    "#d6e9ff")
                                            }
                                            onMouseLeave={(e) =>
                                                (e.currentTarget.style.backgroundColor =
                                                    "#f0f8ff")
                                            }
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            style={styles.deleteButtonSmall}
                                            onClick={() => {
                                                handleDeleteProduct(product.id);
                                            }}
                                            title="Delete product"
                                            onMouseEnter={(e) =>
                                                (e.currentTarget.style.backgroundColor =
                                                    "#e63946")
                                            }
                                            onMouseLeave={(e) =>
                                                (e.currentTarget.style.backgroundColor =
                                                    "#ff4d4d")
                                            }
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

            <div style={styles.addButtonWrapper}>
                <button
                    onClick={() => {
                        setShowExtendedModal(true);
                        setIsEditMode(false);
                    }}
                    style={styles.buttonAdd}
                    onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#2c7a2c")
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

function getSubcategoryName(product, subcategories) {
    return subcategories[product.subcategory_id]?.name || "";
}

const styles = {
    modal: {
        backgroundColor: "#fff",
        padding: "24px",
        borderRadius: "12px",
        width: "100%",
        maxWidth: "520px",
        maxHeight: "90vh",
        boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
        display: "flex",
        flexDirection: "column",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px",
        borderBottom: "1px solid #eee",
        paddingBottom: "12px",
    },
    buttonsContainer: {
        display: "flex",
        gap: "10px",
    },
    title: {
        margin: 0,
        fontSize: "1.75rem",
        fontWeight: "700",
        color: "#222",
    },
    section: {
        flex: "1",
        overflowY: "auto",
        marginBottom: "20px",
    },
    subtitle: {
        margin: "0 0 12px 0",
        fontWeight: "600",
        fontSize: "1.1rem",
        color: "#333",
    },
    list: {
        listStyleType: "none",
        padding: 0,
        maxHeight: "55vh",
        overflowY: "auto",
        border: "1px solid #ddd",
        borderRadius: "8px",
        backgroundColor: "#fafafa",
    },
    listItem: {
        padding: "12px 20px",
        fontSize: "1rem",
        color: "#444",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        transition: "background-color 0.2s ease",
    },
    productContent: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
    },
    productName: {
        fontWeight: "600",
        color: "#222",
    },
    productQuantity: {
        fontWeight: "500",
        color: "#555",
        marginLeft: "6px",
        fontSize: "0.9rem",
    },
    productButtons: {
        display: "flex",
        gap: "10px",
    },
    editButton: {
        padding: "6px 12px",
        backgroundColor: "#f0f8ff",
        border: "1px solid #a0c4ff",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "1rem",
        transition: "background-color 0.2s ease",
    },
    deleteButtonSmall: {
        padding: "6px 12px",
        backgroundColor: "#ff4d4d",
        border: "none",
        borderRadius: "6px",
        color: "white",
        cursor: "pointer",
        fontSize: "1rem",
        transition: "background-color 0.2s ease",
    },
    noItems: {
        fontStyle: "italic",
        color: "#777",
        padding: "12px 0",
        textAlign: "center",
    },
    addButtonWrapper: {
        textAlign: "center",
        marginBottom: "10px",
    },
    buttonAdd: {
        padding: "12px 24px",
        backgroundColor: "#28a745",
        color: "#fff",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "700",
        fontSize: "1rem",
        transition: "background-color 0.3s ease",
        boxShadow: "0 3px 8px rgba(40, 167, 69, 0.5)",
    },
    buttonCancel: {
        padding: "10px 16px",
        backgroundColor: "#ccc",
        color: "#333",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "700",
        fontSize: "1.1rem",
        transition: "background-color 0.3s ease",
    },
    deleteButton: {
        padding: "8px 14px",
        backgroundColor: "#ff4d4d",
        border: "none",
        borderRadius: "8px",
        color: "white",
        cursor: "pointer",
        fontSize: "1.1rem",
        transition: "background-color 0.3s ease",
    },
    error: {
        marginTop: "16px",
        color: "#d32f2f",
        fontWeight: "700",
        textAlign: "center",
        backgroundColor: "#fbeaea",
        padding: "8px",
        borderRadius: "6px",
    },
    message: {
        marginTop: "16px",
        color: "#2e7d32",
        fontWeight: "700",
        textAlign: "center",
        backgroundColor: "#e6f4ea",
        padding: "8px",
        borderRadius: "6px",
    },
};
