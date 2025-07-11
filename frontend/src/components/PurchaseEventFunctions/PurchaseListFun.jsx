import { useState, useEffect } from "react";

function PurchaseLists({
    setShowViewPanel,
    setShowAddPanel,
    setEditPurchaseID,
    setUserOrHouseholdID,
}) {
    const [lists, setLists] = useState([]);
    const [error, setError] = useState(null);
    const [filterText, setFilterText] = useState("");
    const [households, setHouseholds] = useState([]);
    const [selectedHousehold, setSelectedHousehold] = useState("private");

    const filteredLists = lists.filter((list) =>
        list.name.toLowerCase().includes(filterText.toLowerCase())
    );

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
                        selectedHousehold === "private"
                            ? {}
                            : { household_id: selectedHousehold }
                    ),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to download lists");
            }

            if (!Array.isArray(data.events)) {
                throw new Error("Unexpected data format from server");
            }

            setLists(data.events);
            setError(null);
        } catch (err) {
            setError(err.message);
            setLists([]);
        }
    };

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
            setError(null);
        } catch (err) {
            console.error("Error:", err.message);
            setError(err.message);
        }
    };

    useEffect(() => {
        fetchUserHouseholds();
    }, []);

    useEffect(() => {
        fetchLists();
    }, []);

    return (
        <div
            style={{
                color: "black",
                display: "flex",
                flexDirection: "column",
                maxHeight: "400px",
            }}
        >
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    marginBottom: "10px",
                }}
            >
                <h3 style={{ margin: 0 }}>Purchased Lists:</h3>
                <select
                    value={selectedHousehold}
                    onChange={(e) => setSelectedHousehold(e.target.value)}
                    style={{
                        padding: "8px 14px",
                        borderRadius: "8px",
                        border: "1px solid #d1d5db",
                        fontSize: "15px",
                        cursor: "pointer",
                        backgroundColor: "#f9fafb",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                        color: "#111827",
                        outline: "none",
                        transition: "border-color 0.2s, box-shadow 0.2s",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                    onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                >
                    <option value="private">Private (only you)</option>
                    {households.map((h) => (
                        <option key={h.id} value={h.id}>
                            {h.name}
                        </option>
                    ))}
                </select>
            </div>

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
                    <p>No purchased lists to display.</p>
                )}
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {filteredLists.map((list) => (
                        <li
                            key={list.id}
                            title={list.name}
                            onClick={() => {
                                setShowViewPanel(true);
                                setShowAddPanel(false);
                                setEditPurchaseID(list.id);
                                setUserOrHouseholdID(selectedHousehold);
                            }}
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
            </div>
        </div>
    );
}

export default PurchaseLists;
