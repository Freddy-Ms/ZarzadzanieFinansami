import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AddModal from "./ModalAddPurchaseEvent";
import EditModal from "./EditProductPurhase";

export default function PurchaseList({ onClose, onCreated }) {
    const [name, setName] = useState("");
    const [households, setHouseholds] = useState([]);
    const [selectedHousehold, setSelectedHousehold] = useState("private");
    const [, setError] = useState(null);
    const [receiptFile, setReceiptFile] = useState(null);
    const [products, setProducts] = useState([]);
    const [loadingOcr, setLoadingOcr] = useState(false);

    const [showAddModal, setShowAddModal] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        fetchUserHouseholds();
    }, []);

    useEffect(() => {
        const processOcr = async () => {
            if (receiptFile && name.trim() && selectedHousehold) {
                setLoadingOcr(true);
                const result = await handleOcrUpload(receiptFile);
                setProducts(result);
                setLoadingOcr(false);
            }
        };

        processOcr();
    }, [receiptFile]);

    const inputRef = useRef(null);
    useEffect(() => {
        if (showAddModal || showEditModal) {
            inputRef.current?.focus();
        }
    }, [showAddModal, showEditModal]);

    const fetchUserHouseholds = async () => {
        try {
            const response = await fetch(
                "http://127.0.0.1:5000/household/get",
                {
                    method: "GET",
                    credentials: "include",
                }
            );

            if (response.status === 404) {
                setHouseholds([]);
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            setShowAddModal(true);
            setShowEditModal(false);
            setHouseholds(data);
            setError(null);
        } catch (err) {
            console.error("Error:", err.message);
            setError(err.message);
        }
    };

    const handleOcrUpload = async (file) => {
        if (!file) {
            toast.error("No file selected");
            return;
        }

        const formData = new FormData();
        formData.append("receipt", file);

        try {
            const response = await fetch("http://127.0.0.1:5000/OCR", {
                method: "POST",
                credentials: "include",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "OCR failed");
            }

            const data = await response.json();
            toast.success("OCR completed successfully!");
            setShowAddModal(true);
            setShowEditModal(false);
            const products = data.products;
            return products;
        } catch (error) {
            toast.error("Error: " + error.message);
            return [];
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("List name is required");
            return;
        }
        if (!receiptFile) {
            toast.error("Receipt image is required");
            return;
        }
        if (products.length === 0) {
            toast.error("No products detected from OCR");
            return;
        }

        const formData = new FormData();
        formData.append("name", name);
        formData.append(
            "household_id",
            selectedHousehold === "private" ? "" : selectedHousehold
        );
        formData.append("receipt", receiptFile);
        formData.append("products", JSON.stringify(products));

        try {
            const response = await fetch(
                "http://127.0.0.1:5000/purchaseevent/create",
                {
                    method: "POST",
                    credentials: "include",
                    body: formData,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Creation failed");
            }

            toast.success(data.message);
            setShowAddModal(false);
            setShowEditModal(false);
            onCreated();
            onClose();
        } catch (err) {
            toast.error("Error: " + err.message);
        }
    };

    return (
        <>
            {(showAddModal || showEditModal) && (
                <div style={styles.modalRow}>
                    {showAddModal && (
                        <AddModal
                            handleSubmit={handleSubmit}
                            setName={setName}
                            name={name}
                            selectedHousehold={selectedHousehold}
                            setSelectedHousehold={setSelectedHousehold}
                            households={households}
                            setReceiptFile={setReceiptFile}
                            receiptFile={receiptFile}
                            loadingOcr={loadingOcr}
                            products={products}
                            onClose={onClose}
                            inputRef={inputRef}
                            showEditModal={showEditModal}
                            setShowEditModal={setShowEditModal}
                        />
                    )}
                    {showEditModal && <EditModal />}
                </div>
            )}
        </>
    );
}

const styles = {
    modalRow: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 100,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "1px",
        padding: "20px",
        overflowY: "auto",
        maxHeight: "200vh",
        maxwidth: "100vw",
    },
};
