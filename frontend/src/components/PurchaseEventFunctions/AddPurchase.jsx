import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function AddPurchase({ onClose, onCreated }) {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [selectedHousehold, setSelectedHousehold] = useState("private");
    const [receiptFile, setReceiptFile] = useState(null);
    const [loadingOcr, setLoadingOcr] = useState(false);
    const [products, setProducts] = useState([]);
    const [households, setHouseholds] = useState([]);
    const [ocrProducts, setOcrProducts] = useState([]);

    const inputRef = useRef();

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
            setHouseholds(data);
        } catch (err) {
            console.error("Error:", err.message);
        }
    };

    useEffect(() => {
        fetchUserHouseholds();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("name", name);
        formData.append(
            "householdId",
            selectedHousehold === "private" ? "" : selectedHousehold
        );
        if (receiptFile) {
            formData.append("receipt", receiptFile);
        }
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

            toast.success(data.message || "Lista zakupów dodana pomyślnie!");
            onCreated();
            onClose();
            window.location.reload();
        } catch (err) {
            toast.error("Error: " + err.message);
        }
    };

    const handleOcrUpload = async (file) => {
        if (!file) {
            toast.error("No file selected");
            return [];
        }

        setLoadingOcr(true);
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
            return data.products;
        } catch (error) {
            toast.error("Error: " + error.message);
            return [];
        } finally {
            setLoadingOcr(false);
        }
    };

    const onFileSelected = async (file) => {
        setReceiptFile(file);
        const ocrProducts = await handleOcrUpload(file);
        setProducts(ocrProducts);
        setOcrProducts(ocrProducts);
    };

    return (
        <div
            style={{
                padding: "20px",
                border: "1px solid #ddd",
                borderRadius: "12px",
                maxWidth: "100vw",
                backgroundColor: "#fff",
                margin: "auto",
            }}
        >
            <h2 style={{ marginBottom: "10px", marginTop: 0 }}>
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
                    style={{
                        padding: "10px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        fontSize: "1rem",
                    }}
                />

                <select
                    value={selectedHousehold}
                    onChange={(e) => setSelectedHousehold(e.target.value)}
                    style={{
                        padding: "10px",
                        borderRadius: "6px",
                        border: "1px solid #ccc",
                        fontSize: "1rem",
                    }}
                >
                    <option value="private">Prywatna (tylko dla Ciebie)</option>
                    {households.map((h) => (
                        <option key={h.id} value={h.id}>
                            {h.name}
                        </option>
                    ))}
                </select>

                {/* Sekcja dodawania paragonu */}
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
                        onDrop={async (e) => {
                            e.preventDefault();
                            const file = e.dataTransfer.files[0];
                            if (file) await onFileSelected(file);
                        }}
                    >
                        <input
                            id="receiptInput"
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                                const file = e.target.files[0];
                                if (file) await onFileSelected(file);
                            }}
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

                {ocrProducts.length > 0 && (
                    <div
                        style={{
                            backgroundColor: "#eef",
                            padding: "1rem",
                            borderRadius: "8px",
                            overflowY: "auto",
                        }}
                    >
                        <h4 style={{ marginBottom: "0.8rem", marginTop: 0 }}>
                            Rozpoznane produkty:
                        </h4>
                        {ocrProducts.map((p, i) => (
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
                                    onClick={() => {
                                        navigate("/edit");
                                    }}
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
                    <button
                        type="submit"
                        style={{
                            padding: "0.6rem 1.2rem",
                            borderRadius: "6px",
                            border: "none",
                            backgroundColor: "#28a745",
                            color: "#fff",
                            fontWeight: "bold",
                            cursor: "pointer",
                        }}
                    >
                        Dodaj
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            padding: "0.6rem 1.2rem",
                            borderRadius: "6px",
                            border: "1px solid #ccc",
                            backgroundColor: "#fff",
                            cursor: "pointer",
                            color: "black",
                        }}
                    >
                        Anuluj
                    </button>
                </div>
            </form>
        </div>
    );
}
