import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PurchaseList from "./PurchaseEventFunctions/PurchaseListFun";
import AddPurchase from "./PurchaseEventFunctions/AddPurchase";
import ShowPurchase from "./PurchaseEventFunctions/ShowPurchase";

export default function PurchaseEventPage() {
    const navigate = useNavigate();
    const [showAddPanel, setShowAddPanel] = useState(false);
    const [showViewPanel, setShowViewPanel] = useState(false);
    const [editPurchaseID, setEditPurchaseID] = useState(null);
    const [userOrHouseholdID, setUserOrHouseholdID] = useState("private");

    return (
        <div style={styles.pageWrapper}>
            <ToastContainer />
            <div style={styles.outerContainer}>
                <button
                    style={styles.backButton}
                    onClick={() => navigate("/homepage")}
                    onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor =
                            styles.hoverEffects.backButtonHover.backgroundColor)
                    }
                    onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor =
                            styles.backButton.backgroundColor)
                    }
                >
                    ← Back
                </button>

                <div style={styles.twoColumnRow}>
                    <div style={styles.rightPanel}>
                        <div style={styles.infoBox}>
                            <PurchaseList
                                list={{ products: [] }}
                                onClose={() => {}}
                                onCreated={() => {}}
                                setShowViewPanel={setShowViewPanel}
                                setShowAddPanel={setShowAddPanel}
                                setEditPurchaseID={setEditPurchaseID}
                                setUserOrHouseholdID={setUserOrHouseholdID}
                            />
                        </div>
                        <button
                            onClick={() => {
                                setShowAddPanel(true);
                                setShowViewPanel(false);
                            }}
                            style={{
                                padding: "10px",
                                borderRadius: "6px",
                                border: "none",
                                backgroundColor: "#007bff",
                                color: "white",
                                cursor: "pointer",
                            }}
                        >
                            Add Purchased List
                        </button>
                    </div>

                    <div style={styles.leftPanel}>
                        <div style={styles.panel}>
                            {showAddPanel ? (
                                <AddPurchase
                                    onClose={() => setShowAddPanel(false)}
                                />
                            ) : showViewPanel ? (
                                <ShowPurchase
                                    onClose={() => setShowViewPanel(false)}
                                    editPurchaseID={editPurchaseID}
                                    userOrHouseholdID={userOrHouseholdID}
                                />
                            ) : (
                                <p>
                                    ← Select an option on the right or click "Add Purchased List".
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    pageWrapper: {
        minHeight: "100vh",
        backgroundColor: "#0077cc",
        padding: "20px 30px",
        width: "100vw",
        boxSizing: "border-box",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#1e293b",
    },
    outerContainer: {
        display: "flex",
        flexDirection: "column",
        gap: "5px",
        width: "100%",
        maxWidth: "auto",
        margin: "0 auto",
    },
    panel: {
        borderRadius: "12px",
        flex: "1 1 46%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        color: "#1e293b",
        width: "100%",
    },
    title: {
        marginBottom: "16px",
        fontSize: "1.75rem",
        fontWeight: "600",
        color: "#1e293b",
    },
    infoBox: {
        backgroundColor: "#f9fafb",
        padding: "16px",
        borderRadius: "8px",
        marginBottom: "16px",
        boxShadow: "inset 0 0 8px rgba(0,0,0,0.05)",
        color: "#1e293b",
    },
    label: {
        display: "block",
        marginBottom: "12px",
        fontWeight: "500",
        fontSize: "1rem",
        color: "#334155",
    },
    input: {
        width: "100%",
        padding: "10px 12px",
        borderRadius: "6px",
        border: "1.5px solid #cbd5e1",
        fontSize: "1rem",
        transition: "border-color 0.2s ease",
        color: "#1e293b",
        backgroundColor: "#fff",
    },
    buttonRow: {
        display: "flex",
        gap: "14px",
        marginTop: "14px",
        flexWrap: "wrap",
    },
    buttonsRow: {
        marginTop: "20px",
        display: "flex",
        gap: "14px",
        flexWrap: "wrap",
    },
    button: {
        padding: "12px 18px",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "1rem",
        transition: "background-color 0.3s ease",
        userSelect: "none",
        color: "#fff",
    },
    editButton: {
        backgroundColor: "#38bdf8",
    },
    deleteButton: {
        backgroundColor: "#ef4444",
    },
    saveButton: {
        backgroundColor: "#10b981",
        padding: "12px 18px",
        borderRadius: "8px",
    },
    cancelButton: {
        backgroundColor: "#94a3b8",
        padding: "12px 18px",
        borderRadius: "8px",
    },
    backButton: {
        backgroundColor: "#58a7fc",
        border: "none",
        borderRadius: "8px",
        padding: "8px 14px",
        cursor: "pointer",
        marginBottom: "18px",
        color: "#fff",
        fontWeight: "600",
        fontSize: "1rem",
        alignSelf: "flex-start",
        transition: "background-color 0.3s ease",
    },
    hoverEffects: {
        backButtonHover: {
            backgroundColor: "#1d4ed8",
        },
    },
    householdBox: {
        backgroundColor: "#e2e8f0",
        padding: "14px 20px",
        borderRadius: "10px",
        marginBottom: "14px",
        fontSize: "1rem",
        color: "#334155",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    },
    twoColumnRow: {
        display: "flex",
        gap: "20px",
        justifyContent: "space-between",
        alignItems: "flex-start",
        flexWrap: "nowrap",
    },
    leftPanel: {
        flex: 5,
        backgroundColor: "#fff",
        borderRadius: "10px",
        padding: "20px 15px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        boxSizing: "border-box",
        color: "#1e293b",
    },
    rightPanel: {
        flex: 2,
        backgroundColor: "#fff",
        borderRadius: "10px",
        padding: "20px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        boxSizing: "border-box",
        color: "#1e293b",
        minWidth: "250px",
    },
};
