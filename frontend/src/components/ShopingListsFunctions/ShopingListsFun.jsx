import React, { useState, useEffect } from "react";
import ModalAddShoppingList from "./ModalAddShoppingList";
import ModalShoppingListDetails from "./ModalShoppingListDetails";

function ShoppingLists() {
    const [lists, setLists] = useState([]);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedList, setSelectedList] = useState(null);
    const [filterText, setFilterText] = useState("");

    const filteredLists = lists.filter((list) =>
        list.name.toLowerCase().includes(filterText.toLowerCase())
    );

    const fetchLists = () => {
        fetch("http://127.0.0.1:5000/shoppinglist/get", {
            method: "GET",
            credentials: "include",
        })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to download lists");
                return res.json();
            })
            .then((data) => {
                if (Array.isArray(data)) {
                    setLists(data);
                    setError(null);
                } else if (data.error) {
                    setError(data.error);
                    setLists([]);
                } else {
                    setError("Unknown data format from server");
                    setLists([]);
                }
            })
            .catch((err) => {
                setError(err.message);
                setLists([]);
            });
    };

    useEffect(fetchLists, []);

    return (
        <div
            style={{
                color: "black",
                display: "flex",
                flexDirection: "column",
                maxHeight: "400px",
            }}
        >
            <h3 style={{ marginBottom: "10px" }}>Shopping Lists:</h3>

            <input
                type="text"
                placeholder="Search lists..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                style={{
                    marginBottom: "10px",
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid rgb(72, 132, 197)",
                    fontSize: "1rem",
                    backgroundColor: "rgb(215, 228, 241)",
                    width: "90%",
                    color: "black",
                }}
            />

            <div
                style={{
                    flex: 1,
                    overflowY: "scroll",
                    paddingRight: "10px",
                    marginBottom: "10px",
                    scrollbarWidth: "thin",
                    scrollbarColor: "gray white",
                }}
            >
                {error && <p style={{ color: "red" }}>Error: {error}</p>}
                {!error && lists.length === 0 && (
                    <p>No shopping lists to display.</p>
                )}
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {filteredLists.map((list) => (
                        <li
                            key={list.id}
                            title={list.name}
                            onClick={() => setSelectedList(list)}
                            style={{
                                maxWidth: "100%",
                                backgroundColor: "#d9ebff",
                                border: "1px solid rgb(72, 132, 197)",
                                borderRadius: "8px",
                                padding: "10px",
                                marginBottom: "6px",
                                cursor: "pointer",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            }}
                        >
                            {list.name}
                        </li>
                    ))}
                </ul>
                {selectedList && (
                    <ModalShoppingListDetails
                        list={selectedList}
                        onClose={() => setSelectedList(null)}
                    />
                )}
            </div>

            <button
                onClick={() => setShowModal(true)}
                style={{
                    padding: "10px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: "#007bff",
                    color: "white",
                    cursor: "pointer",
                }}
            >
                Add Shopping List
            </button>

            {showModal && (
                <ModalAddShoppingList
                    onClose={() => setShowModal(false)}
                    onCreated={fetchLists}
                />
            )}
        </div>
    );
}

export default ShoppingLists;
