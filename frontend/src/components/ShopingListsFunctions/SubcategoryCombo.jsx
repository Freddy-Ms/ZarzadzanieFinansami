import React, { useState, useEffect, useRef } from "react";

export default function SubcategoryCombo({
    subcategories,
    onSelect,
    selectedSubcategoryId,
}) {
    const [filterText, setFilterText] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (selectedSubcategoryId) {
            const selected = subcategories.find(
                (sub) => sub.id === selectedSubcategoryId
            );
            if (selected) {
                setFilterText(selected.name);
            }
        }
    }, [selectedSubcategoryId, subcategories]);

    useEffect(() => {
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filtered = subcategories.filter((subcat) =>
        subcat.name.toLowerCase().includes(filterText.toLowerCase())
    );

    function handleSelect(subcat) {
        setFilterText(subcat.name);
        setShowDropdown(false);
        if (onSelect) onSelect(subcat.id);
    }

    return (
        <div style={{ position: "relative", width: "90%" }} ref={ref}>
            <input
                type="text"
                placeholder="Select category..."
                value={filterText}
                onChange={(e) => {
                    setFilterText(e.target.value);
                    setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                style={{
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid rgb(72, 132, 197)",
                    fontSize: "1rem",
                    backgroundColor: "rgb(215, 228, 241)",
                    width: "100%",
                    color: "black",
                }}
            />
            {showDropdown && filtered.length > 0 && (
                <ul
                    style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        maxHeight: "150px",
                        overflowY: "auto",
                        backgroundColor: "white",
                        border: "1px solid rgb(72, 132, 197)",
                        borderRadius: "0 0 6px 6px",
                        margin: 0,
                        padding: 0,
                        listStyle: "none",
                        zIndex: 1000,
                    }}
                >
                    {filtered.map((subcat) => (
                        <li
                            key={subcat.id}
                            onClick={() => handleSelect(subcat)}
                            style={{
                                padding: "8px",
                                cursor: "pointer",
                                borderBottom: "1px solid #ddd",
                            }}
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            {subcat.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
