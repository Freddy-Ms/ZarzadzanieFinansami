import { toast, ToastContainer } from "react-toastify";
import { useEffect, useState } from "react";

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
    const [newProduct, setNewProduct] = useState({
        name: "",
        quantity: null,
        unit_id: "",
        subcategory_id: "",
        price: null,
        event_id: editPurchaseID,
    });

    const [products, setProducts] = useState([]);
    const [units, setUnits] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [receiptUrl, setReceiptUrl] = useState(null);
    const [isAddingProduct, setisAddingProduct] = useState(false);

    useEffect(() => {
        if (event) {
            setName(event.name || "");
            setDate(event.date ? event.date.split("T")[0] : "");
        }
    }, [event]);

    useEffect(() => {
        fetchEvent();
    }, []);

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
                if (!res.ok) throw new Error("Error getting units");
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
                if (!res.ok) throw new Error("Error getting subcategory");
                const data = await res.json();
                setSubcategories(data);
            } catch (error) {
                toast.error(error.message);
            }
        };

        fetchSubcategories();
    }, []);

    useEffect(() => {
        let isMounted = true;
        let imageUrl;

        const fetchReceipt = async () => {
            try {
                const response = await fetch(
                    "http://127.0.0.1:5000/purchaseevent/receipt/get",
                    {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ event_id: editPurchaseID }),
                    }
                );

                if (!response.ok) throw new Error("Failed to download receipt");

                const blob = await response.blob();
                imageUrl = URL.createObjectURL(blob);
                if (isMounted) setReceiptUrl(imageUrl);
            } catch (err) {
                toast.error(err.message);
            }
        };

        if (editPurchaseID) fetchReceipt();

        return () => {
            isMounted = false;
            if (imageUrl) URL.revokeObjectURL(imageUrl);
        };
    }, [editPurchaseID]);

    const fetchEvent = async () => {
        if (!editPurchaseID) return;

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
                toast.error("No purchase event found with the specified ID");
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

            toast.success("Shopping list updated");
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

            toast.success("Product removed");

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
            if (!product.name || product.name.trim() === "") {
                toast.error("Name cannot be empty");
            } else if (
                !Number.isInteger(Number(product.quantity)) ||
                Number(product.quantity) <= 0
            ) {
                toast.error("Quantity must be an integer greater than 0");
            } else if (!product.unit_id) {
                product.unit_id = null;
            } else if (!product.subcategory_id) {
                product.subcategory_id = null;
            } else if (
                product.price === null ||
                product.price === undefined ||
                product.price.toString().trim() === ""
            ) {
                toast.error("Price cannot be empty");
            } else if (!/^\d+([.,]\d{1,2})?$/.test(product.price.toString())) {
                toast.error(
                    "Price must be in a valid format (max 2 digits after the decimal point)"
                );
            } else {
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
                    throw new Error(data.message);
                }

                toast.success(`Product updated`);
                await fetchEvent();
                return true;
            }
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
            name: product.name,
            quantity: product.quantity,
            unit_id: product.unit_id,
            subcategory_id: product.subcategory_id,
            price: product.price,
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

    const addPurchasedProduct = async (newProduct) => {
        try {
            if (!newProduct.name || newProduct.name.trim() === "") {
                toast.error("Name cannot be empty");
            } else if (
                !Number.isInteger(Number(newProduct.quantity)) ||
                Number(newProduct.quantity) <= 0
            ) {
                toast.error("Quantity must be an integer greater than 0");
            } else if (!newProduct.unit_id) {
                toast.error("Unit cannot be empty");
            } else if (!newProduct.subcategory_id) {
                toast.error("Category cannot be empty");
            } else if (
                newProduct.price === null ||
                newProduct.price === undefined ||
                newProduct.price.toString().trim() === ""
            ) {
                toast.error("Price cannot be empty");
            } else if (
                !/^\d+([.,]\d{1,2})?$/.test(newProduct.price.toString())
            ) {
                toast.error(
                    "The price must be in the correct format (max 2 digits after the decimal point)"
                );
            } else {
                const response = await fetch(
                    "http://127.0.0.1:5000/purchaseevent/product/add",
                    {
                        method: "POST",
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            name: newProduct.name,
                            quantity: newProduct.quantity,
                            unit_id: newProduct.unit_id,
                            subcategory_id: newProduct.subcategory_id,
                            price: newProduct.price,
                            event_id: newProduct.event_id,
                        }),
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message);
                }

                toast.success(`New product added`);

                await fetchEvent();
                return true;
            }
        } catch (error) {
            toast.error(error.message);
            return false;
        }
    };

    const handleAddClick = async () => {
        const success = await addPurchasedProduct(newProduct);
        if (success) {
            setNewProduct({
                name: "",
                quantity: null,
                unit_id: "",
                subcategory_id: "",
                price: null,
                event_id: newProduct.event_id,
            });
        }
    };

    const handleNewProductInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <div>
            <ToastContainer />
            {event ? (
                <>
                    <div style={styles.main}>
                        {isNameEditing ? (
                            <>
                                <div style={styles.editingPurchaseName}>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        placeholder="Enter name"
                                        style={styles.editName}
                                    />
                                    <span style={styles.spanStyle}>
                                        ({ownerName})
                                    </span>
                                </div>

                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    style={styles.editDate}
                                />
                                <div
                                    style={{
                                        display: "flex",
                                        gap: "6px",
                                    }}
                                >
                                    <button
                                        style={styles.cancelButton}
                                        onClick={() => setIsNameEditing(false)}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        style={styles.saveButton}
                                        onClick={handleSave}
                                    >
                                        Save
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div style={styles.purchaseName}>
                                    <h2 style={styles.name}>
                                        {event.name}{" "}
                                        <span style={styles.spanStyle2}>
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
                                        style={styles.edditButton}
                                        title="Edit product"
                                        onClick={() => {
                                            setIsNameEditing(true);
                                        }}
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        style={styles.deleteButton}
                                        title="Delete product"
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
                        <div style={styles.productsList}>
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
                                                style={styles.products}
                                            >
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={editedProduct.name}
                                                    onChange={handleInputChange}
                                                    placeholder="Product name"
                                                    style={
                                                        styles.editNameProduct
                                                    }
                                                />

                                                <input
                                                    type="number"
                                                    name="quantity"
                                                    value={
                                                        editedProduct.quantity
                                                    }
                                                    onChange={handleInputChange}
                                                    placeholder="Quantity"
                                                    style={
                                                        styles.editQuantityProduct
                                                    }
                                                    min="0"
                                                />

                                                <select
                                                    name="unit_id"
                                                    value={
                                                        editedProduct.unit_id ||
                                                        ""
                                                    }
                                                    onChange={handleInputChange}
                                                    style={
                                                        styles.editUnitProduct
                                                    }
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
                                                    style={
                                                        styles.editCategoryProduct
                                                    }
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
                                                    style={
                                                        styles.editPriceProduct
                                                    }
                                                    min="0.01"
                                                />
                                                <div
                                                    style={{
                                                        display: "flex",
                                                        gap: "6px",
                                                    }}
                                                >
                                                    <button
                                                        style={
                                                            styles.saveButton
                                                        }
                                                        onClick={
                                                            handleSaveClick
                                                        }
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        style={
                                                            styles.cancelButton
                                                        }
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
                                                style={styles.products}
                                            >
                                                <div style={styles.nameProduct}>
                                                    {product.name}
                                                </div>
                                                <div
                                                    style={
                                                        styles.quantityProduct
                                                    }
                                                >
                                                    {product.quantity}
                                                </div>
                                                <div style={styles.unitProduct}>
                                                    {units.find(
                                                        (u) =>
                                                            u.id ===
                                                            product.unit_id
                                                    )?.name || "-"}
                                                </div>
                                                <div
                                                    style={
                                                        styles.categoryProduct
                                                    }
                                                >
                                                    {subcategories.find(
                                                        (s) =>
                                                            s.id ===
                                                            product.subcategory_id
                                                    )?.name || "-"}
                                                </div>
                                                <div
                                                    style={styles.priceProduct}
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
                                                        style={
                                                            styles.editButton
                                                        }
                                                        onClick={() => {
                                                            handleEditClick(
                                                                product
                                                            );
                                                        }}
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        style={
                                                            styles.deleteButton
                                                        }
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

                    {isAddingProduct ? (
                        <div style={styles.addProductPanel}>
                            <input
                                type="text"
                                name="name"
                                value={newProduct.name}
                                onChange={handleNewProductInputChange}
                                placeholder="Product name"
                                style={styles.editNameProduct}
                            />

                            <input
                                type="number"
                                name="quantity"
                                value={newProduct.quantity}
                                onChange={handleNewProductInputChange}
                                placeholder="Quantity"
                                style={styles.editQuantityProduct}
                                min="1"
                            />

                            <select
                                name="unit_id"
                                value={newProduct.unit_id || ""}
                                onChange={handleNewProductInputChange}
                                style={styles.editUnitProduct}
                            >
                                <option value="" disabled>
                                    Unit
                                </option>
                                {units.map((unit) => (
                                    <option key={unit.id} value={unit.id}>
                                        {unit.name}
                                    </option>
                                ))}
                            </select>

                            <select
                                name="subcategory_id"
                                value={newProduct.subcategory_id || ""}
                                onChange={handleNewProductInputChange}
                                style={styles.editCategoryProduct}
                            >
                                <option value="" disabled>
                                    Select category
                                </option>
                                {subcategories.map((subcat) => (
                                    <option key={subcat.id} value={subcat.id}>
                                        {subcat.name}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="number"
                                name="price"
                                value={newProduct.price}
                                onChange={handleNewProductInputChange}
                                placeholder="Price"
                                style={styles.editPriceProduct}
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
                                        backgroundColor: "rgb(27, 187, 35)",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "4px",
                                        padding: "0.3rem 0.7rem",
                                        cursor: "pointer",
                                    }}
                                    onClick={handleAddClick}
                                >
                                    Add
                                </button>
                                <button
                                    style={{
                                        backgroundColor: "#ff0000",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "4px",
                                        padding: "0.3rem 0.7rem",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => setisAddingProduct(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                marginTop: "1rem",
                            }}
                        >
                            <button
                                onClick={() => setisAddingProduct(true)}
                                style={styles.addButton}
                            >
                                Add product
                            </button>
                        </div>
                    )}

                    {receiptUrl ? (
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                marginTop: "1rem",
                            }}
                        >
                            <img
                                src={receiptUrl}
                                alt="Receipt"
                                style={{
                                    maxWidth: "100%",
                                    maxHeight: "600px",
                                    borderRadius: "8px",
                                    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                                }}
                            />
                        </div>
                    ) : (
                        <p style={{ textAlign: "center" }}>
                            No receipt photo or loading...
                        </p>
                    )}
                </>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
}

const styles = {
    main: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "10px",
    },
    editingPurchaseName: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        minWidth: 0,
        flexShrink: 1,
    },

    editName: {
        fontSize: "1.25rem",
        fontWeight: "600",
        color: "#1e293b",
        padding: "8px 12px",
        border: "1px solid #ccc",
        borderRadius: "6px",
        background: "#f7f7f7",
        minWidth: "150px",
        flexShrink: 1,
    },
    spanStyle: {
        fontSize: "1rem",
        color: "gray",
        fontWeight: "400",
        whiteSpace: "nowrap",
    },

    editDate: {
        fontSize: "1rem",
        padding: "8px 12px",
        borderRadius: "6px",
        border: "1px solid #ccc",
        background: "#f7f7f7",
        color: "black",
        minWidth: "130px",
        WebkitAppearance: "none",
    },

    cancelButton: {
        backgroundColor: "#8a8a8a",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        padding: "0.5rem 1rem",
        cursor: "pointer",
        fontSize: "1rem",
        whiteSpace: "nowrap",
    },
    saveButton: {
        backgroundColor: "#1e8f1d",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        padding: "0.5rem 1rem",
        cursor: "pointer",
        fontSize: "1rem",
        whiteSpace: "nowrap",
    },
    purchaseaName: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        minWidth: 0,
        flexShrink: 1,
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    name: {
        margin: 0,
        fontWeight: "600",
        color: "#1e293b",
        display: "flex",
        alignItems: "center",
        gap: "6px",
    },
    spanStyle2: {
        fontSize: "0.85em",
        color: "gray",
        fontWeight: "400",
    },
    editButton: {
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        padding: "0.5rem 1rem",
        cursor: "pointer",
        fontSize: "1rem",
        whiteSpace: "nowrap",
    },
    deleteButton: {
        backgroundColor: "#ff0000",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        padding: "0.5rem 1rem",
        cursor: "pointer",
        fontSize: "1rem",
        whiteSpace: "nowrap",
    },
    productsList: {
        backgroundColor: "#d9ebff",
        padding: "1rem 0.5rem",
        borderRadius: "8px",
        overflowY: "auto",
        marginTop: "1rem",
    },
    products: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fff",
        padding: "0.6rem 1rem",
        borderRadius: "6px",
        marginBottom: "0.5rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        gap: "1rem",
    },
    editNameProduct: {
        flex: "1 1 150px",
        backgroundColor: "#f0f8ff",
        padding: "0.5rem",
        borderRadius: "6px",
        boxShadow: "inset 0 0 5px rgba(0,123,255,0.3)",
        fontWeight: "800",
        border: "none",
        outline: "none",
        width: "100%",
        color: "black",
        fontFamily: "Consolas, monospace",
    },
    editQuantityProduct: {
        flex: "0 0 70px",
        backgroundColor: "#f9f9f9",
        padding: "0.5rem",
        borderRadius: "6px",
        boxShadow: "inset 0 0 5px rgba(100,100,100,0.1)",
        fontWeight: "800",
        border: "none",
        outline: "none",
        width: "100%",
        color: "black",
        fontFamily: "Consolas, monospace",
    },
    editUnitProduct: {
        flex: "0 0 80px",
        padding: "0.5rem",
        borderRadius: "6px",
        border: "none",
        width: "65px",
        backgroundColor: "#f9f9f9",
        boxShadow: "inset 0 0 5px rgba(100,100,100,0.1)",
        color: "black",
        outline: "none",
        fontFamily: "Consolas, monospace",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
    },
    editCategoryProduct: {
        padding: "0.5rem",
        borderRadius: "6px",
        border: "none",
        flex: "0 0 30px",
        width: "165px",
        backgroundColor: "#fff8dc",
        boxShadow: "inset 0 0 5px rgba(218,165,32,0.3)",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        color: "black",
        fontFamily: "Consolas, monospace",
    },
    editPriceProduct: {
        flex: "0 0 70px",
        backgroundColor: "#f0fff0",
        padding: "0.5rem",
        borderRadius: "6px",
        boxShadow: "inset 0 0 5px rgba(0,128,0,0.2)",
        fontFamily: "Consolas, monospace",
        fontWeight: "800",
        border: "none",
        outline: "none",
        width: "100%",
        color: "black",
    },
    nameProduct: {
        flex: "1 1 150px",
        backgroundColor: "#f0f8ff",
        padding: "0.5rem",
        borderRadius: "6px",
        boxShadow: "inset 0 0 5px rgba(0,123,255,0.3)",
        fontWeight: "600",
    },
    quantityProduct: {
        flex: "0 0 20px",
        backgroundColor: "#f9f9f9",
        padding: "0.5rem",
        borderRadius: "6px",
        boxShadow: "inset 0 0 5px rgba(100,100,100,0.1)",
        textAlign: "center",
        width: "auto",
        minWidth: "10px",
    },
    unitProduct: {
        flex: "0 0 20px",
        backgroundColor: "#f9f9f9",
        padding: "0.5rem",
        borderRadius: "6px",
        boxShadow: "inset 0 0 5px rgba(100,100,100,0.1)",
        textAlign: "center",
        width: "auto",
        minWidth: "40px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        cursor: "default",
    },
    categoryProduct: {
        flex: "1 1 0px",
        backgroundColor: "#fff8dc",
        padding: "0.5rem",
        borderRadius: "6px",
        boxShadow: "inset 0 0 5px rgba(218,165,32,0.3)",
        textAlign: "center",
        width: "auto",
        minWidth: "10px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        cursor: "default",
    },
    priceProduct: {
        flex: "0 0 100px",
        backgroundColor: "#f0fff0",
        padding: "0.5rem",
        borderRadius: "6px",
        boxShadow: "inset 0 0 5px rgba(0,128,0,0.2)",
        textAlign: "center",
        fontWeight: "600",
        color: "#090",
    },
    addProductPanel: {
        marginTop: "1rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "rgba(29, 111, 225, 0.8)",
        padding: "0.6rem 1rem",
        borderRadius: "6px",
        marginBottom: "0.5rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        gap: "1rem",
    },
    addButton: {
        padding: "0.5rem 1rem",
        backgroundColor: "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "1rem",
    },
};
