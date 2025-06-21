import { useState, useEffect, useRef } from "react";
import SimpleModal from "./SimpleModal";
import ExtendedModal from "./ExtendedModal";

export default function ModalShoppingListDetails({ list, onClose, onUpdated }) {
    const [products, setProducts] = useState(list.products || []);
    const [newProductName, setNewProductName] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [categoryId, setCategoryId] = useState("");
    const [subcategoryId, setSubcategoryId] = useState("");
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [filterText, setFilterText] = useState("");
    const [showSimpleModal, setShowSimpleModal] = useState(true);
    const [showExtendedModal, setShowExtendedModal] = useState(false);
    const [subcategories, setSubcategories] = useState({});
    const [isEditMode, setIsEditMode] = useState(false);
    const [productId, setProductId] = useState(null);

    useEffect(() => {
        async function fetchSubcategories() {
            try {
                const res = await fetch(
                    "http://127.0.0.1:5000/subcategory/get",
                    {
                        credentials: "include",
                    }
                );
                if (!res.ok) throw new Error("Error getting subcategorys");
                const data = await res.json();

                setSubcategories(data);
            } catch (err) {
                setError(err.message);
            }
        }
        fetchSubcategories();
    }, []);

    useEffect(() => {
        if (error || message) {
            const timer = setTimeout(() => {
                setError("");
                setMessage("");
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [error, message]);

    const inputRef = useRef(null);
    useEffect(() => {
        if (showExtendedModal) {
            inputRef.current?.focus();
        }
    }, [showExtendedModal]);

    const handleAddProduct = async (product) => {
        setError(null);
        setMessage(null);
        try {
            const res = await fetch(
                "http://127.0.0.1:5000/shoppinglist/product/add",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        list_id: list.id,
                        name: product.name,
                        quantity: product.quantity,
                        subcategory_id: product.subcategory_id || null,
                    }),
                }
            );
            const data = await res.json();
            if (!res.ok)
                throw new Error(data.message || "Failed to add product");
            setMessage(data.message || "Product added");
            setProducts((prev) => [...prev, product]);
            if (onUpdated) onUpdated();
            setShowExtendedModal(false);
            setShowSimpleModal(true);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleEditProduct = async (product) => {
        setError(null);
        setMessage(null);
        try {
            const res = await fetch(
                "http://127.0.0.1:5000/shoppinglist/product/edit",
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
                        subcategory_id: product.subcategory_id || null,
                    }),
                }
            );
            const data = await res.json();
            if (!res.ok)
                throw new Error(data.message || "Failed to edit product");
            setMessage(data.message || "Product updated");
            setProducts((prev) =>
                prev.map((p) => (p.id === productId ? { ...p, ...product } : p))
            );

            if (onUpdated) onUpdated();
            setShowExtendedModal(false);
            setShowSimpleModal(true);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteProduct = async (productId) => {
        setError(null);
        setMessage(null);
        try {
            const res = await fetch(
                "http://127.0.0.1:5000/shoppinglist/product/remove",
                {
                    method: "POST",
                    credentials: "include", // tak jak w handleAddProduct
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ id: productId }),
                }
            );
            const data = await res.json();
            if (!res.ok)
                throw new Error(data.message || "Failed to delete product");

            setMessage(data.message || "Product removed");

            setProducts((prev) => prev.filter((p) => p.id !== productId));

            if (onUpdated) onUpdated();

            setShowExtendedModal(false);
            setShowSimpleModal(true);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteList = () => {
        setError(null);
        fetch("http://127.0.0.1:5000/shoppinglist/delete", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ list_id: list.id }),
        })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to delete list");
                return res.json();
            })
            .then((data) => {
                setMessage(data.message || "List deleted");
                onClose();
                if (onUpdated) onUpdated();
                window.location.reload();
            })
            .catch((err) => setError(err.message));
    };

    return (
        <>
            {(showSimpleModal || showExtendedModal) && (
                <div style={styles.modalRow}>
                    {showSimpleModal && (
                        <SimpleModal
                            list={list}
                            products={products}
                            setShowExtendedModal={setShowExtendedModal}
                            error={error}
                            message={message}
                            onClose={onClose}
                            handleDeleteList={handleDeleteList}
                            setIsEditMode={setIsEditMode}
                            setProductId={setProductId}
                            handleDeleteProduct={handleDeleteProduct}
                        />
                    )}
                    {showExtendedModal && (
                        <ExtendedModal
                            subcategories={subcategories}
                            newProductName={newProductName}
                            setNewProductName={setNewProductName}
                            quantity={quantity}
                            setQuantity={setQuantity}
                            categoryId={categoryId}
                            setCategoryId={setCategoryId}
                            subcategoryId={subcategoryId}
                            setSubcategoryId={setSubcategoryId}
                            handleAddProduct={handleAddProduct}
                            setShowExtendedModal={setShowExtendedModal}
                            setShowSimpleModal={setShowSimpleModal}
                            error={error}
                            message={message}
                            setError={setError}
                            setMessage={setMessage}
                            inputRef={inputRef}
                            filterText={filterText}
                            setFilterText={setFilterText}
                            handleEditProduct={handleEditProduct}
                            isEditMode={isEditMode}
                            productId={productId}
                            products={products}
                        />
                    )}
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
