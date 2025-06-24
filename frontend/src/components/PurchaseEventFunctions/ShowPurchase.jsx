import { toast, ToastContainer } from "react-toastify";
import { useEffect, useState } from "react";

export default function ShowPurchase({ editPurchaseID, userOrHouseholdID }) {
    const [event, setEvent] = useState(null);
    const [ownerName, setOwnerName] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchLists = async () => {
            try {
                const response = await fetch(
                    "http://127.0.0.1:5000/purchaseevent/get",
                    {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(
                            userOrHouseholdID === "private"
                                ? {}
                                : { household_id: userOrHouseholdID }
                        ),
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Błąd serwera");
                }

                if (!Array.isArray(data.events)) {
                    throw new Error("Unexpected data format from server");
                }

                const foundEvent = data.events.find(
                    (ev) => ev.id === editPurchaseID
                );

                if (foundEvent) {
                    setEvent(foundEvent);
                } else {
                    toast.error("Nie znaleziono zdarzenia zakupu o podanym ID");
                }
            } catch (err) {
                toast.error(err.message);
            }
        };

        fetchLists();
    }, [editPurchaseID, userOrHouseholdID]);

    useEffect(() => {
        const fetchHouseholdName = async () => {
            try {
                const response = await fetch(
                    "http://127.0.0.1:5000/household/get",
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );

                const data = await response.json();

                const found = data.find((h) => h.id === userOrHouseholdID);

                if (found) {
                    setOwnerName(found.name);
                } else {
                    setOwnerName("Private");
                }
            } catch (err) {
                toast.error(err);
                setOwnerName("Error");
            }
        };

        if (userOrHouseholdID) {
            fetchHouseholdName();
        }
    }, [userOrHouseholdID]);

    return (
        <div
            style={{
                padding: "0px",
                maxWidth: "100vw",
                width: "100%",
                backgroundColor: "#fff",
                margin: "auto",
            }}
        >
            <ToastContainer />
            {event ? (
                <>
                    {isEditing ? (
                        <>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "10px",
                                }}
                            >


                            </div>
                        </>
                    ) : (
                        <>
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: "10px",
                                }}
                            >
                                <h2
                                    style={{
                                        marginTop: 0,
                                        marginBottom: "10px",
                                        fontWeight: "600",
                                        color: "#1e293b",
                                    }}
                                >
                                    {event.name}{" "}
                                    <span
                                        style={{
                                            fontSize: "0.85em",
                                            color: "gray",
                                            fontWeight: "400",
                                            marginLeft: "6px",
                                        }}
                                    >
                                        ({ownerName})
                                    </span>
                                    <div
                                        style={{
                                            fontSize: "0.9em",
                                            color: "#555",
                                            marginTop: "4px",
                                        }}
                                    >
                                        {new Date(
                                            event.date
                                        ).toLocaleDateString("pl-PL", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </div>
                                </h2>

                                <button
                                    style={{
                                        backgroundColor: "#007bff",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "4px",
                                        padding: "0.3rem 0.7rem",
                                        cursor: "pointer",
                                        marginRight: "0.5rem",
                                    }}
                                    onClick={() => {
                                        setIsEditing(true);
                                    }}
                                >
                                    ✏️
                                </button>
                            </div>

                            {event.products && event.products.length > 0 && (
                                <div
                                    style={{
                                        backgroundColor: "#eef",
                                        padding: "1rem",
                                        borderRadius: "8px",
                                        overflowY: "auto",
                                        marginTop: "1rem",
                                    }}
                                >
                                    <h4
                                        style={{
                                            marginBottom: "0.8rem",
                                            marginTop: 0,
                                        }}
                                    >
                                        Produkty w tej liście:
                                    </h4>
                                    {event.products.map((product) => (
                                        <div
                                            key={product.id}
                                            style={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "center",
                                                backgroundColor: "#fff",
                                                padding: "0.6rem 1rem",
                                                borderRadius: "6px",
                                                marginBottom: "0.5rem",
                                                boxShadow:
                                                    "0 1px 3px rgba(0,0,0,0.1)",
                                                gap: "1rem",
                                            }}
                                        >
                                            <div
                                                style={{
                                                    flex: "1 1 150px",
                                                    backgroundColor: "#f0f8ff",
                                                    padding: "0.5rem",
                                                    borderRadius: "6px",
                                                    boxShadow:
                                                        "inset 0 0 5px rgba(0,123,255,0.3)",
                                                    fontWeight: "600",
                                                }}
                                            >
                                                {product.name}
                                            </div>
                                            {/* Quantity */}
                                            {product.quantity !== undefined && (
                                                <div
                                                    style={{
                                                        flex: "0 0 80px",
                                                        backgroundColor:
                                                            "#f9f9f9",
                                                        padding: "0.5rem",
                                                        borderRadius: "6px",
                                                        boxShadow:
                                                            "inset 0 0 5px rgba(100,100,100,0.1)",
                                                        textAlign: "center",
                                                    }}
                                                >
                                                    {product.quantity}
                                                </div>
                                            )}
                                            {/* Unit */}
                                            {product.unit && (
                                                <div
                                                    style={{
                                                        flex: "0 0 80px",
                                                        backgroundColor:
                                                            "#f9f9f9",
                                                        padding: "0.5rem",
                                                        borderRadius: "6px",
                                                        boxShadow:
                                                            "inset 0 0 5px rgba(100,100,100,0.1)",
                                                        textAlign: "center",
                                                        fontStyle: "italic",
                                                        color: "#555",
                                                    }}
                                                >
                                                    {product.unit}
                                                </div>
                                            )}
                                            {/* Price */}
                                            {product.price !== undefined && (
                                                <div
                                                    style={{
                                                        flex: "0 0 100px",
                                                        backgroundColor:
                                                            "#f0fff0",
                                                        padding: "0.5rem",
                                                        borderRadius: "6px",
                                                        boxShadow:
                                                            "inset 0 0 5px rgba(0,128,0,0.2)",
                                                        textAlign: "center",
                                                        fontWeight: "600",
                                                        color: "#090",
                                                    }}
                                                >
                                                    {product.price} zł
                                                </div>
                                            )}
                                            {/* Subcategory */}
                                            {product.subcategory && (
                                                <div
                                                    style={{
                                                        flex: "1 1 150px",
                                                        backgroundColor:
                                                            "#fff8dc",
                                                        padding: "0.5rem",
                                                        borderRadius: "6px",
                                                        boxShadow:
                                                            "inset 0 0 5px rgba(218,165,32,0.3)",
                                                        fontStyle: "italic",
                                                    }}
                                                >
                                                    {product.subcategory}
                                                </div>
                                            )}
                                            <div>
                                                <button
                                                    style={{
                                                        backgroundColor:
                                                            "#ff0000",
                                                        color: "#fff",
                                                        border: "none",
                                                        borderRadius: "4px",
                                                        padding:
                                                            "0.3rem 0.7rem",
                                                        cursor: "pointer",
                                                    }}
                                                    onClick={() => {
                                                        toast.info(
                                                            "Funkcja usuwania w przygotowaniu"
                                                        );
                                                    }}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </>
            ) : (
                <p>Ładowanie...</p>
            )}
        </div>
    );
}
