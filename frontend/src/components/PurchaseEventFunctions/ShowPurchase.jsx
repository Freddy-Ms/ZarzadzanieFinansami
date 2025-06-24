import { toast, ToastContainer } from "react-toastify";
import { useEffect, useState } from "react";
import SubcategoryCombo from "../ShopingListsFunctions/SubcategoryCombo";

export default function ShowPurchase({ editPurchaseID, userOrHouseholdID }) {
    const [event, setEvent] = useState(null);
    const [ownerName, setOwnerName] = useState("");
    const [isNameEditing, setIsNameEditing] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);
    const [name, setName] = useState("");
    const [date, setDate] = useState("");
    const [editedProduct, setEditedProduct] = useState({
        id: null,
        name: "",
        quantity: "",
        unit_id: "",
        subcategory_id: "",
        price: "",
    });
    const [products, setProducts] = useState([]);
    const [units, setUnits] = useState([]);
    const [subcategories, setSubcategories] = useState([]);

    useEffect(() => {
        if (event) {
            setName(event.name || "");
            setDate(event.date ? event.date.split("T")[0] : "");
        }
    }, [event]);

    useEffect(() => {
        fetchEvent();
    }, [editPurchaseID, userOrHouseholdID]);

    useEffect(() => {
        if (event && event.products) {
            setProducts(event.products);
        } else {
            setProducts([]);
        }
    }, [event]);

    useEffect(() => {
        const fetchUnits = async () => {
            try {
                const res = await fetch(
                    "http://127.0.0.1:5000/quantityunit/get",
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );
                if (!res.ok) throw new Error("Błąd pobierania jednostek");
                const data = await res.json();
                setUnits(data);
            } catch (error) {
                toast.error(error.message);
            }
        };

        fetchUnits();
    }, []);

    useEffect(() => {
        const fetchSubcategories = async () => {
            try {
                const res = await fetch(
                    "http://127.0.0.1:5000/subcategory/get",
                    {
                        method: "GET",
                        credentials: "include",
                    }
                );
                if (!res.ok) throw new Error("Błąd pobierania podkategorii");
                const data = await res.json();
                setSubcategories(data);
            } catch (error) {
                toast.error(error.message);
            }
        };

        fetchSubcategories();
    }, []);

    const fetchEvent = async () => {
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
                throw new Error(data.message);
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
                throw new Error(data.message);
            }

            toast.success("Zaktualizowano listę zakupów");
            setIsNameEditing(false);
            setEvent({ ...event, name, date });
        } catch (err) {
            toast.error(err.message);
        }
    };

    const deletePurchaseEvent = async (editPurchaseID) => {
        try {
            const response = await fetch(
                "http://127.0.0.1:5000/purchaseevent/delete",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ event_id: editPurchaseID }),
                }
            );

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message);
                window.location.reload();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    const removeProduct = async (productId) => {
        try {
            const response = await fetch(
                "http://127.0.0.1:5000/purchaseevent/product/remove",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ id: productId }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message);
            }

            toast.success("Produkt usunięty");

            setEvent((prevEvent) => ({
                ...prevEvent,
                products: prevEvent.products.filter((p) => p.id !== productId),
            }));
        } catch (error) {
            toast.error(error.message);
        }
    };

    const editPurchasedProduct = async (product) => {
        try {
            const response = await fetch(
                "http://127.0.0.1:5000/purchaseevent/product/edit",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        id: product.id,
                        name: product.name,
                        quantity: product.quantity,
                        unit_id: product.unit_id,
                        subcategory_id: product.subcategory_id,
                        price: product.price,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Błąd edycji produktu");
            }

            toast.success(`Zaktualizowano produkt o nazwie: ${product.name}`);
            await fetchEvent();
            return true;
        } catch (error) {
            toast.error(error.message);
            return false;
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditedProduct((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleEditClick = (product) => {
        setEditedProduct({
            id: product.id,
            name: "",
            quantity: "",
            unit_id: "",
            subcategory_id: "",
            price: "",
        });
        setEditingProductId(product.id);
    };

    const handleSaveClick = async () => {
        const success = await editPurchasedProduct(editedProduct);
        if (success) {
            setProducts((prevProducts) =>
                prevProducts.map((p) =>
                    p.id === editedProduct.id ? editedProduct : p
                )
            );
            setEditingProductId(null);
        }
    };

    return (
        <div>
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
                                            deletePurchaseEvent(editPurchaseID);
                                        }}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                    {products && products.length > 0 && (
                        <div
                            style={{
                                backgroundColor: "#d9ebff",
                                padding: "1rem 0.5rem",
                                borderRadius: "8px",
                                overflowY: "auto",
                                marginTop: "1rem",
                            }}
                        >
                            <h4
                                style={{
                                    marginBottom: "0.3rem",
                                    marginTop: "-0.3rem",
                                }}
                            >
                                Produkty w tej liście:
                            </h4>
                            {products.map((product) => (
                                <>
                                    {editingProductId === product.id ? (
                                        <>
                                            <div
                                                key={product.id}
                                                style={{
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
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
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={editedProduct.name}
                                                    onChange={handleInputChange}
                                                    placeholder="Product name"
                                                    style={{
                                                        flex: "1 1 150px",
                                                        backgroundColor:
                                                            "#f0f8ff",
                                                        padding: "0.5rem",
                                                        borderRadius: "6px",
                                                        boxShadow:
                                                            "inset 0 0 5px rgba(0,123,255,0.3)",
                                                        fontWeight: "800",
                                                        border: "none",
                                                        outline: "none",
                                                        width: "100%",
                                                        color: "black",
                                                        fontFamily:
                                                            "Consolas, monospace",
                                                    }}
                                                />

                                                <input
                                                    type="number"
                                                    name="quantity"
                                                    value={
                                                        editedProduct.quantity
                                                    }
                                                    onChange={handleInputChange}
                                                    placeholder="Quantity"
                                                    style={{
                                                        flex: "1 1 80px",
                                                        backgroundColor:
                                                            "#f9f9f9",
                                                        padding: "0.5rem",
                                                        borderRadius: "6px",
                                                        boxShadow:
                                                            "inset 0 0 5px rgba(100,100,100,0.1)",
                                                        fontWeight: "800",
                                                        border: "none",
                                                        outline: "none",
                                                        width: "100%",
                                                        color: "black",
                                                        fontFamily:
                                                            "Consolas, monospace",
                                                    }}
                                                    min="0"
                                                />

                                                <select
                                                    name="unit_id"
                                                    value={
                                                        editedProduct.unit_id ||
                                                        ""
                                                    }
                                                    onChange={handleInputChange}
                                                    style={{
                                                        padding: "0.5rem",
                                                        borderRadius: "6px",
                                                        border: "1px solid #ccc",
                                                        width: "65px",
                                                    }}
                                                >
                                                    <option value="" disabled>
                                                        Unit
                                                    </option>
                                                    {units.map((unit) => (
                                                        <option
                                                            key={unit.id}
                                                            value={unit.id}
                                                        >
                                                            {unit.name}
                                                        </option>
                                                    ))}
                                                </select>

                                                <select
                                                    name="subcategory_id"
                                                    value={
                                                        editedProduct.subcategory_id ||
                                                        ""
                                                    }
                                                    onChange={handleInputChange}
                                                    style={{
                                                        padding: "0.5rem",
                                                        borderRadius: "6px",
                                                        border: "1px solid #ccc",
                                                        width: "129px",
                                                    }}
                                                >
                                                    <option value="" disabled>
                                                        Select category
                                                    </option>
                                                    {subcategories.map(
                                                        (subcat) => (
                                                            <option
                                                                key={subcat.id}
                                                                value={
                                                                    subcat.id
                                                                }
                                                            >
                                                                {subcat.name}
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                                <input
                                                    type="number"
                                                    name="price"
                                                    value={editedProduct.price}
                                                    onChange={handleInputChange}
                                                    placeholder="Price"
                                                    style={{
                                                        flex: "0 0 70px",
                                                        backgroundColor:
                                                            "#f0fff0",
                                                        padding: "0.5rem",
                                                        borderRadius: "6px",
                                                        boxShadow:
                                                            "inset 0 0 5px rgba(0,128,0,0.2)",
                                                        fontFamily:
                                                            "Consolas, monospace",
                                                        fontWeight: "800",
                                                        border: "none",
                                                        outline: "none",
                                                        width: "100%",
                                                        color: "black",
                                                    }}
                                                    min="0.01"
                                                />
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: "6px",
                                                    }}
                                                >
                                                    <button
                                                        style={{
                                                            backgroundColor:
                                                                "#007bff",
                                                            color: "#fff",
                                                            border: "none",
                                                            borderRadius: "4px",
                                                            padding:
                                                                "0.3rem 0.7rem",
                                                            cursor: "pointer",
                                                        }}
                                                        onClick={
                                                            handleSaveClick
                                                        }
                                                    >
                                                        Save
                                                    </button>
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
                                                        onClick={() =>
                                                            setEditingProductId(
                                                                null
                                                            )
                                                        }
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div
                                                key={product.id}
                                                style={{
                                                    display: "flex",
                                                    justifyContent:
                                                        "space-between",
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
                                                        backgroundColor:
                                                            "#f0f8ff",
                                                        padding: "0.5rem",
                                                        borderRadius: "6px",
                                                        boxShadow:
                                                            "inset 0 0 5px rgba(0,123,255,0.3)",
                                                        fontWeight: "600",
                                                    }}
                                                >
                                                    {product.name}
                                                </div>
                                                <div
                                                    style={{
                                                        flex: "0 0 20px",
                                                        backgroundColor:
                                                            "#f9f9f9",
                                                        padding: "0.5rem",
                                                        borderRadius: "6px",
                                                        boxShadow:
                                                            "inset 0 0 5px rgba(100,100,100,0.1)",
                                                        textAlign: "center",
                                                        width: "auto",
                                                        minWidth: "10px",
                                                    }}
                                                >
                                                    {product.quantity}
                                                </div>
                                                <div
                                                    style={{
                                                        flex: "0 0 20px",
                                                        backgroundColor:
                                                            "#f9f9f9",
                                                        padding: "0.5rem",
                                                        borderRadius: "6px",
                                                        boxShadow:
                                                            "inset 0 0 5px rgba(100,100,100,0.1)",
                                                        textAlign: "center",
                                                        width: "auto",
                                                        minWidth: "40px",
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow:
                                                            "ellipsis",
                                                        cursor: "default",
                                                    }}
                                                >
                                                    {units.find(
                                                        (u) =>
                                                            u.id ===
                                                            product.unit_id
                                                    )?.name || "-"}
                                                </div>
                                                <div
                                                    style={{
                                                        flex: "1 1 0px",
                                                        backgroundColor:
                                                            "#fff8dc",
                                                        padding: "0.5rem",
                                                        borderRadius: "6px",
                                                        boxShadow:
                                                            "inset 0 0 5px rgba(218,165,32,0.3)",
                                                        textAlign: "center",
                                                        width: "auto",
                                                        minWidth: "10px",
                                                        whiteSpace: "nowrap",
                                                        overflow: "hidden",
                                                        textOverflow:
                                                            "ellipsis",
                                                        cursor: "default",
                                                    }}
                                                >
                                                    {subcategories.find(
                                                        (s) =>
                                                            s.id ===
                                                            product.subcategory_id
                                                    )?.name || "-"}
                                                </div>
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

                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: "6px",
                                                    }}
                                                >
                                                    <button
                                                        style={{
                                                            backgroundColor:
                                                                "#007bff",
                                                            color: "#fff",
                                                            border: "none",
                                                            borderRadius: "4px",
                                                            padding:
                                                                "0.3rem 0.7rem",
                                                            cursor: "pointer",
                                                        }}
                                                        onClick={() => {
                                                            handleEditClick(
                                                                product
                                                            );
                                                        }}
                                                    >
                                                        ✏️
                                                    </button>
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
                                                        onClick={() =>
                                                            removeProduct(
                                                                product.id
                                                            )
                                                        }
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </>
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
