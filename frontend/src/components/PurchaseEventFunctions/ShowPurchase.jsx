import { toast, ToastContainer } from "react-toastify";
import { useEffect, useState } from "react";

export default function ShowPurchase({ editPurchaseID, userOrHouseholdID }) {
    const [event, setEvent] = useState(null);
    const [ownerName, setOwnerName] = useState("");
    const [isNameEditing, setIsNameEditing] = useState(false);
    const [name, setName] = useState("");
    const [date, setDate] = useState("");

    useEffect(() => {
        if (event) {
            setName(event.name || "");
            setDate(event.date ? event.date.split("T")[0] : "");
        }
    }, [event]);

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
                toast.error(err.message);
                setOwnerName("Error");
            }
        };

        if (userOrHouseholdID) {
            fetchHouseholdName();
        }
    }, [userOrHouseholdID]);

    const handleSave = async () => {
        try {
            const response = await fetch(
                "http://127.0.0.1:5000/purchaseevent/edit",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        event_id: event.id,
                        name,
                        date,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Błąd zapisu");
            }

            toast.success("Zaktualizowano listę zakupów");
            setIsNameEditing(false);
            setEvent({ ...event, name, date });
        } catch (err) {
            toast.error(err.message);
        }
    };

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
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "10px",
                        }}
                    >
                        {isNameEditing ? (
                            <>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        minWidth: 0,
                                        flexShrink: 1,
                                    }}
                                >
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        placeholder="Enter name"
                                        style={{
                                            fontSize: "1.25rem",
                                            fontWeight: "600",
                                            color: "#1e293b",
                                            padding: "8px 12px",
                                            border: "1px solid #ccc",
                                            borderRadius: "6px",
                                            background: "#f7f7f7",
                                            minWidth: "150px",
                                            flexShrink: 1,
                                        }}
                                    />
                                    <span
                                        style={{
                                            fontSize: "1rem",
                                            color: "gray",
                                            fontWeight: "400",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        ({ownerName})
                                    </span>
                                </div>

                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    style={{
                                        fontSize: "1rem",
                                        padding: "8px 12px",
                                        borderRadius: "6px",
                                        border: "1px solid #ccc",
                                        background: "#f7f7f7",
                                        color: "black",
                                        minWidth: "130px",
                                        WebkitAppearance: "none",
                                    }}
                                />
                                <div
                                    style={{
                                        display: "flex",
                                        gap: "6px",
                                    }}
                                >
                                    <button
                                        style={{
                                            backgroundColor: "#8a8a8a",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "6px",
                                            padding: "0.5rem 1rem",
                                            cursor: "pointer",
                                            fontSize: "1rem",
                                            whiteSpace: "nowrap",
                                        }}
                                        onClick={() => setIsNameEditing(false)}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        style={{
                                            backgroundColor: "#1e8f1d",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "6px",
                                            padding: "0.5rem 1rem",
                                            cursor: "pointer",
                                            fontSize: "1rem",
                                            whiteSpace: "nowrap",
                                        }}
                                        onClick={handleSave}
                                    >
                                        Save
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                        minWidth: 0,
                                        flexShrink: 1,
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}
                                >
                                    <h2
                                        style={{
                                            margin: 0,
                                            fontWeight: "600",
                                            color: "#1e293b",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "6px",
                                        }}
                                    >
                                        {event.name}{" "}
                                        <span
                                            style={{
                                                fontSize: "0.85em",
                                                color: "gray",
                                                fontWeight: "400",
                                            }}
                                        >
                                            ({ownerName})
                                        </span>
                                    </h2>
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
                                </div>

                                <div
                                    style={{
                                        display: "flex",
                                        gap: "6px",
                                    }}
                                >
                                    <button
                                        style={{
                                            backgroundColor: "#007bff",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "6px",
                                            padding: "0.5rem 1rem",
                                            cursor: "pointer",
                                            fontSize: "1rem",
                                            whiteSpace: "nowrap",
                                        }}
                                        onClick={() => {
                                            setIsNameEditing(true);
                                        }}
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        style={{
                                            backgroundColor: "#ff0000",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "6px",
                                            padding: "0.5rem 1rem",
                                            cursor: "pointer",
                                            fontSize: "1rem",
                                            whiteSpace: "nowrap",
                                        }}
                                        onClick={() => {
                                            setIsNameEditing(true);
                                        }}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </>
                        )}
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
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
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
                                                backgroundColor: "#f9f9f9",
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
                                                backgroundColor: "#f9f9f9",
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
                                                backgroundColor: "#f0fff0",
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
                                                backgroundColor: "#fff8dc",
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
                                                backgroundColor: "#ff0000",
                                                color: "#fff",
                                                border: "none",
                                                borderRadius: "4px",
                                                padding: "0.3rem 0.7rem",
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
            ) : (
                <p>Ładowanie...</p>
            )}
        </div>
    );
}
